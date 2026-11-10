import { NextRequest } from "next/server";
import { fail, handleApiError, ok } from "@/lib/api";
import { getRequestIp, rateLimitResponse } from "@/lib/security/rate-limit";
import { getShopCatalogue } from "@/lib/shop/catalogue-store";
import { manualReports } from "@/lib/manual-catalogue";
import { getManualReportCheckout } from "@/lib/reports/checkout-catalogue";
import { getPublishedManualReportOffers } from "@/lib/reports/manual-offerings";
import { getPublishedPujaOffers } from "@/lib/puja/offerings";
import { pujaTopics } from "@/lib/puja/service-catalogue";
import { curatedPujaIds } from "@/lib/puja/curated-guides";

export const dynamic = "force-dynamic";

/** Read-only public summary. Never return customer records, seller inventory
 * credentials, unpublished fees, admin pricing drafts, or payment tokens.
 */
export async function GET(request:NextRequest){
  try {
    const limited=rateLimitResponse("native-mobile-catalogue",getRequestIp(request),30,60_000);
    if(limited)return limited;
    const [shop,pujaOffers,manualOffers]=await Promise.all([
      getShopCatalogue(),getPublishedPujaOffers(),getPublishedManualReportOffers()
    ]);
    if(!shop.storageReady)return fail("Catalogue data is temporarily unavailable.",503);
    const shops=shop.products
      .filter(product=>product.status==="active")
      .slice(0,60)
      .map(product=>({
        id:product.id,
        title:product.name.en,
        category:product.category,
        subtitle:product.shortDescription.en,
        pricePaise:typeof product.unitPricePaise==="number"&&product.unitPricePaise>=100
          ? product.unitPricePaise:null,
        path:"/shop/"+encodeURIComponent(product.slug),
        imageKind:"category_reference_only" as const
      }));
    const curated=new Set<string>(curatedPujaIds);
    const pujas=pujaTopics
      .filter(topic=>curated.has(topic.id))
      .map(topic=>({
        id:topic.id,title:topic.name,category:topic.category,
        subtitle:topic.description,
        pricePaise:pujaOffers[topic.id]?.pricePaise??null,
        path:"/pujas/"+encodeURIComponent(topic.id),
        bookingConfirmed:false as const
      }));
    const reports=manualReports.map(report=>{
      const checkout=getManualReportCheckout(report.slug);
      const price=checkout ? checkout.amount*100 : manualOffers[report.slug]?.pricePaise??null;
      return {
        id:report.slug,title:report.name.en,category:report.category,
        subtitle:report.description.en,
        pricePaise:price,
        path:"/reports/"+encodeURIComponent(report.slug),
        purchaseInApp:false as const
      };
    });
    return ok({shop:shops,pujas,reports,meta:{
      disclaimer:"Catalogues are informational. Displayed prices are published listings, not proof of stock, delivery, service booking or expert availability.",
      checkout:"Secure website only. No in-app payment processing.",
      shopStorageReady:true
    }},{headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex, nofollow"}});
  }catch(error){return handleApiError(error);}
}
