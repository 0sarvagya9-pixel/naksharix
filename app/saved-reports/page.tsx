import Link from "next/link";
import { FileText, Sparkles } from "lucide-react";
import { Section } from "@/components/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/roles";

export default async function SavedReportsPage() {
  await requireRole(["USER", "ASTROLOGER", "CONSULTANT", "ADMIN", "SUPER_ADMIN"]);
  return (
    <Section>
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-cinzel"><FileText className="h-5 w-5 text-amber-200" /> Saved Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>No saved reports yet. Generate a kundli or premium report and save it to keep your cosmic archive organized.</p>
          <Button asChild><Link href="/reports"><Sparkles className="h-4 w-4" /> Explore Reports</Link></Button>
        </CardContent>
      </Card>
    </Section>
  );
}
