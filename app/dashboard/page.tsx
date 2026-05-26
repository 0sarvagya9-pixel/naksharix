"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardList, FileText, History, LayoutDashboard, MoonStar, ShieldCheck, Sparkles } from "lucide-react";
import { PaymentHistory } from "@/components/payment-history";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BecomeAstrologerButton } from "@/components/become-astrologer-button";

type DashboardUser = { role?: string | null; effectiveRole?: string | null; name?: string | null; email?: string | null };

const activeTools = [
  { title: "Generate Kundli", href: "/kundli", copy: "Create a free Kundli using complete birth details.", icon: MoonStar },
  { title: "Use Numerology", href: "/numerology", copy: "Explore deterministic numerology and Lo Shu tools.", icon: Sparkles },
  { title: "Browse Reports", href: "/reports", copy: "Submit real pending-review report requests without payment at request stage.", icon: ClipboardList },
  { title: "Today Panchang", href: "/panchang", copy: "Open provider-calculated Panchang with location and timezone notes.", icon: MoonStar },
  { title: "Transit Snapshot", href: "/transits", copy: "View provider-calculated current Gochar positions without prediction claims.", icon: Sparkles },
  { title: "Free Calculators", href: "/free-calculators", copy: "Open focused calculators that reuse existing engines.", icon: FileText }
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((json) => {
        if (mounted) setUser(json?.data?.user ?? null);
      })
      .catch(() => {
        if (mounted) setUser(null);
      })
      .finally(() => {
        if (mounted) setCheckingRole(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const role = user?.effectiveRole || user?.role || "USER";
  const accountRole = user?.role || "USER";
  const showBecomeAstrologer = !checkingRole && accountRole === "USER" && role === "USER";

  useEffect(() => {
    if (checkingRole) return;
    if (role === "ASTROLOGER") router.replace("/astrologer/dashboard");
  }, [checkingRole, role, router]);

  if (checkingRole || role === "ASTROLOGER") {
    return <Section className="star-field"><p className="text-sm naksh-muted-text">Loading dashboard...</p></Section>;
  }

  if (role === "CONSULTANT") {
    return (
      <Section className="star-field">
        <Card className="glass">
          <CardContent className="p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Consultant Portal</p>
            <h1 className="mt-3 font-cinzel text-3xl font-black">Consultation Is On Hold</h1>
            <p className="mt-3 naksh-muted-text">The consultation marketplace is not active in this phase. Profile and booking workflows will be completed in a later release.</p>
          </CardContent>
        </Card>
      </Section>
    );
  }

  return (
    <Section className="star-field">
      <div className="relative overflow-hidden rounded-lg border border-[#D4AF37]/25 bg-[linear-gradient(135deg,rgba(72,36,128,0.78),rgba(18,9,31,0.94)_58%,rgba(166,119,42,0.48))] p-6 sm:p-8">
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD700]">Naksharix Dashboard</p>
            <h1 className="mt-3 font-cinzel text-4xl font-black">Your Account Workspace</h1>
            <p className="mt-3 max-w-2xl naksh-muted-text">
              Use active Naksharix tools and review real account activity as backend workflows become available. Future modules stay clearly marked until they are production-ready.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild><Link href="/kundli">Generate Kundli</Link></Button>
              <Button variant="outline" asChild><Link href="/reports">View Reports</Link></Button>
              <Button variant="outline" asChild><Link href="/free-calculators">Free Calculators</Link></Button>
              {showBecomeAstrologer ? <BecomeAstrologerButton /> : null}
            </div>
          </div>
          <div className="grid h-20 w-20 place-items-center rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/10">
            <LayoutDashboard className="h-9 w-9 text-[#FFD700]" />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <StatusCard title="Saved Kundli History" copy="Saved Kundli history should show only real generated records. If no saved records exist yet, this section stays as an honest empty state." />
        <StatusCard title="Report Requests" copy="Report requests are saved as real pending-review records and visible in your profile history." />
        <StatusCard title="Premium PDF Reports" copy="Admin-reviewed PDF generation is available for real report requests. Downloads appear only when a file exists." />
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {activeTools.map(({ title, href, copy, icon: Icon }) => (
          <Card key={title} className="border-[#D4AF37]/20 bg-[#061D3C]/80">
            <CardContent className="p-5">
              <Icon className="h-5 w-5 text-[#FFD700]" />
              <h2 className="mt-4 font-cinzel text-lg font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 naksh-muted-text">{copy}</p>
              <Button className="mt-4 w-full" variant="outline" asChild><Link href={href}>Open</Link></Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-[#D4AF37]/20 bg-[#061D3C]/80">
          <CardHeader><CardTitle className="font-cinzel">Future Modules</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {["AI Astrologer", "Shop", "Consultation marketplace", "Transit predictions", "Report payment checkout"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-md border border-[#D4AF37]/20 bg-[#02112C]/60 p-3 text-sm">
                <span>{item}</span>
                <span className="rounded-full border border-[#D4AF37]/30 px-2 py-1 text-xs text-[#FFD700]">Coming Soon</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-[#D4AF37]/20 bg-[#061D3C]/80">
          <CardHeader><CardTitle className="font-cinzel">Trust Notes</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 naksh-muted-text">
            <p className="rounded-md border border-[#D4AF37]/20 bg-[#02112C]/60 p-3"><ShieldCheck className="mr-2 inline h-4 w-4 text-[#00f5a0]" />Guidance on Naksharix is for reflection and spiritual insight, not guaranteed outcomes.</p>
            <p className="rounded-md border border-[#D4AF37]/20 bg-[#02112C]/60 p-3"><History className="mr-2 inline h-4 w-4 text-[#00f5a0]" />History and downloads should appear only from real saved data as workflows are completed.</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <PaymentHistory />
      </div>
    </Section>
  );
}

function StatusCard({ title, copy }: { title: string; copy: string }) {
  return (
    <Card className="border-[#D4AF37]/20 bg-[#061D3C]/80">
      <CardContent className="p-5">
        <FileText className="h-5 w-5 text-[#FFD700]" />
        <h2 className="mt-4 font-cinzel text-lg font-bold">{title}</h2>
        <p className="mt-2 text-sm leading-6 naksh-muted-text">{copy}</p>
      </CardContent>
    </Card>
  );
}
