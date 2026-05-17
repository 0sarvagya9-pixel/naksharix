import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";
import { Section } from "@/components/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/roles";

export default async function MyReadingsPage() {
  await requireRole(["USER", "ASTROLOGER", "CONSULTANT", "ADMIN", "SUPER_ADMIN"]);
  return (
    <Section>
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-cinzel"><BookOpen className="h-5 w-5 text-amber-200" /> My Readings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>Your saved kundli reports, horoscope readings, tarot sessions, and consultation notes will appear here as you use Naksharix.</p>
          <Button asChild><Link href="/kundli"><Sparkles className="h-4 w-4" /> Generate Kundli</Link></Button>
        </CardContent>
      </Card>
    </Section>
  );
}
