import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";

type AstrologerPortalPlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  emptyText: string;
  actionHref?: string;
  actionLabel?: string;
};

export function AstrologerPortalPlaceholder({ eyebrow, title, description, emptyText, actionHref = "/astrologer/dashboard", actionLabel = "Back to dashboard" }: AstrologerPortalPlaceholderProps) {
  return (
    <main className="star-field">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">{eyebrow}</p>
        <h1 className="mt-3 font-cinzel text-4xl font-black">{title}</h1>
        <p className="mt-3 max-w-3xl naksh-muted-text">{description}</p>
        <Card className="mt-8 glass">
          <CardHeader><CardTitle className="font-cinzel">{title}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4 text-sm naksh-muted-text">{emptyText}</p>
            <Button variant="outline" asChild><Link href={actionHref}>{actionLabel}</Link></Button>
          </CardContent>
        </Card>
      </Section>
    </main>
  );
}