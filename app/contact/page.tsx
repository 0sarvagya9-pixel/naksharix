import Link from "next/link";
import { Clock, Mail, MessageCircle, Send, Share2 } from "lucide-react";
import { Section } from "@/components/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Contact Naksharix Support",
  description: "Contact Naksharix support at care@naksharix.com for astrology reports, kundli, AI chat, consultations, payments, and account help.",
  path: "/contact",
  keywords: ["Naksharix Contact", "Astrology Support", "care@naksharix.com"]
});

const supportLinks = [
  { title: "FAQ quick links", copy: "Find answers for kundli, reports, payments, and AI chat.", href: "/#faq", Icon: MessageCircle },
  { title: "WhatsApp placeholder", copy: "Quick contact button is available across key pages when enabled.", href: "/contact", Icon: MessageCircle },
  { title: "Social media", copy: "Instagram, YouTube, LinkedIn, and X placeholders are ready for launch.", href: "/contact", Icon: Share2 }
];

export default function ContactPage() {
  return (
    <main className="star-field">
      <Section>
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FFD36A]">Contact</p>
            <h1 className="mt-3 font-cinzel text-4xl font-black">We are here to help you use Naksharix with confidence</h1>
            <p className="mt-4 max-w-2xl leading-8 naksh-muted-text">
              For report delivery, consultation booking, billing, account access, or product feedback, write to our care team.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Card className="border-[#F5C542]/20 bg-[#201037]/75">
                <CardContent className="p-5">
                  <Mail className="h-5 w-5 text-[#FFD36A]" />
                  <p className="mt-3 font-semibold">care@naksharix.com</p>
                  <p className="text-sm naksh-muted-text">Primary support email</p>
                </CardContent>
              </Card>
              <Card className="border-[#F5C542]/20 bg-[#201037]/75">
                <CardContent className="p-5">
                  <Clock className="h-5 w-5 text-[#FFD36A]" />
                  <p className="mt-3 font-semibold">24 to 48 hours</p>
                  <p className="text-sm naksh-muted-text">Typical response time</p>
                </CardContent>
              </Card>
            </div>
          </div>
          <Card className="glass">
            <CardHeader><CardTitle className="font-cinzel">Send a message</CardTitle></CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2"><Label>Name</Label><Input placeholder="Your name" /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="you@example.com" /></div>
                <div className="space-y-2"><Label>Topic</Label><Input placeholder="Report, consultation, billing, or account help" /></div>
                <div className="space-y-2"><Label>Message</Label><Textarea placeholder="Tell us what happened and include any order or account detail if relevant." /></div>
                <Button type="button"><Send className="h-4 w-4" />Send message</Button>
                <p className="text-sm naksh-muted-text">Contact form delivery is placeholder-ready. Email us directly for production support.</p>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {supportLinks.map(({ title, copy, href, Icon }) => (
            <Card key={title} className="border-[#F5C542]/20 bg-[#201037]/75">
              <CardContent className="p-5">
                <Icon className="h-5 w-5 text-[#FFD36A]" />
                <h2 className="mt-4 font-cinzel text-lg font-bold">{title}</h2>
                <p className="mt-2 text-sm leading-6 naksh-muted-text">{copy}</p>
                <Button className="mt-4" variant="outline" asChild><Link href={href}>Open</Link></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}
