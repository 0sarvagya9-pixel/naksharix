import { cookies } from "next/headers";
import { BookOpen } from "lucide-react";
import { Section } from "@/components/section";
import { SavedKundliReportList } from "@/components/saved-kundli-report-list";
import { requireRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { normalizeLocale } from "@/lib/i18n";
import { safeServerTranslation } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function MyReadingsPage() {
  const user = await requireRole(["USER", "ASTROLOGER", "CONSULTANT", "ADMIN", "SUPER_ADMIN"]);
  const locale = await getServerLocale();
  const reports = await prisma.kundliReport.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 24
  });
  const title = safeServerTranslation(locale, "myReadings");
  const emptyText = safeServerTranslation(locale, "noSavedReports");

  return (
    <Section>
      <div className="mb-8">
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]"><BookOpen className="h-4 w-4" />{title}</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">{title}</h1>
        <p className="mt-3 max-w-2xl naksh-muted-text">{emptyText}</p>
      </div>
      <SavedKundliReportList reports={reports} emptyText={emptyText} />
    </Section>
  );
}

async function getServerLocale() {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get("naksharix-language")?.value);
}
