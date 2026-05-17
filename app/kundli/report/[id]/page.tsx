import { notFound, redirect } from "next/navigation";
import { Section } from "@/components/section";
import { SavedKundliReportView } from "@/components/saved-kundli-report-view";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { normalizeLocale } from "@/lib/i18n";

type Params = Promise<{ id: string }>;

export const dynamic = "force-dynamic";

export default async function SavedKundliReportPage({ params }: { params: Params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const saved = await prisma.kundliReport.findFirst({ where: { id, userId: user.id } });
  if (!saved) notFound();

  return (
    <main className="star-field">
      <Section>
        <SavedKundliReportView
          report={saved.reportJson as Record<string, unknown>}
          reportId={saved.id}
          language={normalizeLocale(saved.language)}
          createdAt={saved.createdAt.toISOString()}
        />
      </Section>
    </main>
  );
}
