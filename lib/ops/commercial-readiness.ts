import "server-only";
import { prisma } from "@/lib/db";
import { getShopCatalogue } from "@/lib/shop/catalogue-store";
import { getPublishedPujaOffers } from "@/lib/puja/offerings";
import { getPublishedManualReportOffers } from "@/lib/reports/manual-offerings";
import { pujaTopics } from "@/lib/puja/service-catalogue";
import { editorialPujaPhotos, pujaEditorialPhoto } from "@/lib/puja/editorial-photos";
import { manualReports } from "@/lib/manual-catalogue";
import { getManualReportCheckout } from "@/lib/reports/checkout-catalogue";

export type CommercialGate = {
  key: string;
  title: string;
  status: "ready" | "action_required" | "unknown";
  detail: string;
  actionHref?: string;
};
export type CommercialReadiness = {
  checks: CommercialGate[];
  readyForAutomaticPayments: false;
  checkedAt: string;
};

// Admin-only read-only readiness. A field containing an HTTPS evidence link or
// an administrator-approved fee is NOT independent proof of stock, contracts,
// supplier authenticity, deliveries, real ceremonies, or successful refunds.
export async function getCommercialReadiness(): Promise<CommercialReadiness> {
  const [catalogueResult, pujaResult, reportResult, partnerResult, schemaResult] = await Promise.allSettled([
    getShopCatalogue(),
    getPublishedPujaOffers(),
    getPublishedManualReportOffers(),
    prisma.pujaPartner.count({ where: { reviewStatus: "VERIFIED", evidenceUrl: { not: null } } }),
    prisma.$queryRaw<Array<{ name: string; present: boolean }>>`
      SELECT name, to_regclass(format('public.%I', name)) IS NOT NULL AS present
      FROM unnest(ARRAY[
        'ShopCatalogueSnapshot', 'PujaOffering', 'ShopOrder',
        'PujaBookingRequest', 'ManualReportOffering'
      ]::text[]) AS t(name)
      ORDER BY name
    `
  ]);
  const checks: CommercialGate[] = [];
  const required = ["ShopCatalogueSnapshot", "PujaOffering", "ShopOrder", "PujaBookingRequest", "ManualReportOffering"];
  if (schemaResult.status === "fulfilled") {
    const actual = new Map(schemaResult.value.map(row => [row.name, row.present]));
    const missing = required.filter(name => !actual.get(name));
    checks.push({
      key: "schema", title: "Five commercial database tables",
      status: missing.length ? "action_required" : "ready",
      detail: missing.length
        ? "Missing from this connected database: " + missing.join(", ") + ". Production migration requires independently verified backup and recovery."
        : "All five table names exist in the connected database. Column/index validation and migration provenance still require release verification.",
      actionHref: "/admin/readiness"
    });
  } else {
    checks.push({ key: "schema", title: "Five commercial database tables", status: "unknown",
      detail: "Read-only schema inspection failed. Do not treat the release as ready." });
  }

  if (catalogueResult.status === "fulfilled") {
    const state = catalogueResult.value;
    const active = state.products.filter(item => item.status === "active");
    const priced = active.filter(item => Number.isSafeInteger(item.unitPricePaise) && (item.unitPricePaise ?? 0) >= 100);
    const imageEvidence = active.filter(item => {
      const photos = item.galleryImages?.length ? item.galleryImages : [{
        url: item.imageUrl, evidenceUrl: item.imageEvidenceUrl || "", imageRights: item.imageRights
      }];
      return photos.some(photo =>
        (photo.imageRights === "OWNED" || photo.imageRights === "SUPPLIER_AUTHORIZED") &&
        /^https:\/\//.test(photo.evidenceUrl) &&
        (photo.url.startsWith("/") || /^https:\/\//.test(photo.url))
      );
    });
    checks.push({
      key: "shop-prices", title: "Active Shop product prices",
      status: !state.storageReady ? "action_required" : active.length && active.length === priced.length ? "ready" : "action_required",
      detail: priced.length + " / " + active.length + " active products have an approved positive selling price. " +
        (state.storageReady ? "" : "Persistent catalogue schema is missing. ") +
        "Only admin-approved figures may be published; never invent a price.",
      actionHref: "/admin/shop"
    });
    checks.push({
      key: "shop-images", title: "Product-specific image rights evidence",
      status: active.length && imageEvidence.length === active.length ? "ready" : "action_required",
      detail: imageEvidence.length + " / " + active.length +
        " active listings contain owned/supplier-authorized photo evidence. Licensed category reference pictures do not count as SKU photos. Evidence alone does not certify the delivered product.",
      actionHref: "/admin/shop"
    });
  } else {
    checks.push({ key: "shop-prices", title: "Active Shop product prices", status: "unknown",
      detail: "Cannot read the owner-managed catalogue; no price or inventory readiness claim is possible.", actionHref: "/admin/shop" });
    checks.push({ key: "shop-images", title: "Product-specific image rights evidence", status: "unknown",
      detail: "Catalogue images could not be verified from the connected database.", actionHref: "/admin/shop" });
  }

  if (pujaResult.status === "fulfilled") {
    const published = Object.keys(pujaResult.value).length;
    checks.push({ key: "puja-offers", title: "Published Puja prices",
      status: published > 0 ? "ready" : "action_required",
      detail: published + " / " + pujaTopics.length +
        " curated Puja topics currently have an approved published offering. Individual offerings must have verified scope, dates and a partner before confirmation.",
      actionHref: "/admin/puja-offerings"
    });
  } else {
    checks.push({ key: "puja-offers", title: "Published Puja prices", status: "unknown",
      detail: "Cannot verify published Puja prices.", actionHref: "/admin/puja-offerings" });
  }

  const exactPhotos = pujaTopics.filter(topic => Boolean(editorialPujaPhotos[topic.id]));
  const visiblePhotos = pujaTopics.filter(topic => Boolean(pujaEditorialPhoto(topic.id, topic.category)));
  const uniqueSources = new Set(visiblePhotos.map(topic => pujaEditorialPhoto(topic.id,topic.category)!.source));
  checks.push({
    key: "puja-photo-coverage", title: "Puja-specific real photography",
    status: exactPhotos.length === pujaTopics.length ? "ready" : "action_required",
    detail: exactPhotos.length + " / " + pujaTopics.length +
      " Puja topics have a curated topic-specific licensed photo; " + visiblePhotos.length +
      " / " + pujaTopics.length + " have representative photo coverage across " + uniqueSources.size +
      " distinct Commons sources. Category fallbacks are not photos of the exact ceremony.",
    actionHref: "/admin/puja-offerings"
  });
  if (partnerResult.status === "fulfilled") {
    checks.push({ key: "puja-partners", title: "Admin-reviewed Puja partners",
      status: partnerResult.value > 0 ? "ready" : "action_required",
      detail: partnerResult.value + " partners have administrator-recorded VERIFIED status and a reference URL. Real identity, signed terms, availability and ceremony completion still require separate verification.",
      actionHref: "/admin/puja-partners" });
  } else {
    checks.push({ key: "puja-partners", title: "Admin-reviewed Puja partners", status: "unknown",
      detail: "Partner evidence could not be checked.", actionHref: "/admin/puja-partners" });
  }

  if (reportResult.status === "fulfilled") {
    const eligible = manualReports.filter(item => !getManualReportCheckout(item.slug)).length;
    const published = Object.keys(reportResult.value).length;
    checks.push({ key: "manual-report-prices", title: "Manual specialist report pricing",
      status: published === eligible && eligible > 0 ? "ready" : "action_required",
      detail: published + " / " + eligible + " non-gateway manual report types have an approved offer. Existing gateway-priced report amounts remain untouched.",
      actionHref: "/admin/manual-report-prices" });
  } else {
    checks.push({ key: "manual-report-prices", title: "Manual specialist report pricing", status: "unknown",
      detail: "Cannot inspect manual report fees.", actionHref: "/admin/manual-report-prices" });
  }

  checks.push({ key: "external-fulfilment", title: "External fulfilment and payment acceptance",
    status: "action_required",
    detail: "Live supplier/SKU identity, partner contracts, courier evidence, inbox delivery, monitoring, payment captures, webhook verification, refunds and rollback must be tested externally. No source-only check can certify these." });

  return { checks, readyForAutomaticPayments: false, checkedAt: new Date().toISOString() };
}
