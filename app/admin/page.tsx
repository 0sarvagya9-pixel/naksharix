"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, Newspaper, ShieldCheck, Ticket, Users, Wallet } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const chart = [{ name: "Users", v: 120 }, { name: "Revenue", v: 340 }, { name: "Bookings", v: 210 }, { name: "Reports", v: 470 }];
type AdminAnalytics = {
  users: number;
  revenue: number;
  appointments: number;
  posts: number;
};
type AstrologerApprovalRow = {
  id: string;
  createdAt: string;
  displayName: string;
  specialization: string;
  languages: string[];
  experienceYears: number;
  consultationPrice: string | number;
  status: string;
  user?: { email?: string | null; name?: string | null } | null;
};

type ReportRequestRow = {
  id: string;
  createdAt: string;
  fullName: string;
  deliveryEmail: string;
  planType: string;
  paymentStatus: string;
  status: string;
  dateOfBirth: string;
  timeOfBirth?: string | null;
  birthPlace?: string | null;
  phone?: string | null;
  concern?: string | null;
  user?: { email?: string | null; name?: string | null } | null;
};
const adminMetricKeys: (keyof AdminAnalytics)[] = ["users", "revenue", "appointments", "posts"];
const operations = [
  { title: "User Management", copy: "Review roles, subscriptions, account status, and support history.", icon: Users },
  { title: "Kundli Submissions", copy: "Audit birth detail submissions, saved charts, failed calculations, and report upsells.", icon: ShieldCheck },
  { title: "Report Orders", copy: "Track paid kundli, career, marriage, finance, health, yearly, and numerology reports.", icon: Wallet },
  { title: "Astrologer Queue", copy: "Approve profiles, consultation pricing, ratings, and language coverage.", icon: ShieldCheck },
  { title: "Revenue Ops", copy: "Track subscriptions, paid reports, wallet credits, coupons, and refunds.", icon: Wallet },
  { title: "Consultations", copy: "Monitor bookings, missed sessions, escalations, and customer feedback.", icon: CalendarClock },
  { title: "Testimonials", copy: "Moderate homepage reviews, video placeholders, ratings, and social proof cards.", icon: Ticket },
  { title: "Blog CMS", copy: "Publish SEO articles and moderate astrology content workflows.", icon: Newspaper },
  { title: "SEO Pages", copy: "Review horoscope, zodiac, nakshatra, panchang, numerology, and compatibility landing pages.", icon: Newspaper },
  { title: "Pricing Plans", copy: "Manage free, premium monthly, yearly, one-time reports, and consultation packages.", icon: Wallet },
  { title: "Support Desk", copy: "Prioritize open tickets, billing issues, report delivery, and abuse flags.", icon: Ticket }
];

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [reportRequests, setReportRequests] = useState<ReportRequestRow[]>([]);
  const [astrologerApprovals, setAstrologerApprovals] = useState<AstrologerApprovalRow[]>([]);

  useEffect(() => {
    fetch("/api/admin/analytics").then((r) => r.json()).then((json) => setAnalytics(json.data)).catch(() => setAnalytics(null));
    fetch("/api/admin/report-requests").then((r) => r.json()).then((json) => setReportRequests(json.data?.reportRequests ?? [])).catch(() => setReportRequests([]));
    fetch("/api/admin/astrologers").then((r) => r.json()).then((json) => setAstrologerApprovals(json.data?.profiles ?? [])).catch(() => setAstrologerApprovals([]));
  }, []);

  return (
    <Section>
      <h1 className="text-4xl font-black">Admin Panel</h1>
      <p className="mt-3 naksh-muted-text">Manage users, astrologers, subscriptions, revenue, blogs, moderation, support tickets, and analytics.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/admin/blog">Open Blog CMS</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/revenue">Revenue Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/astrologers">Review Astrologers</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/payouts">Payout Dashboard</Link>
        </Button>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-4">
        {adminMetricKeys.map((key) => (
          <Card key={key}>
            <CardContent className="pt-5">
              <p className="text-2xl font-black">{analytics?.[key] ?? "-"}</p>
              <p className="capitalize text-sm naksh-muted-text">{key}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-6 overflow-hidden">
        <CardHeader><CardTitle>Astrologer Approvals</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.18em] text-[#FFD36A]">
              <tr className="border-b border-[#F5C542]/20">
                <th className="py-3 pr-4">Created</th>
                <th className="py-3 pr-4">Astrologer</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Expertise</th>
                <th className="py-3 pr-4">Languages</th>
                <th className="py-3 pr-4">Experience</th>
                <th className="py-3 pr-4">Price</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {astrologerApprovals.map((profile) => (
                <tr key={profile.id} className="border-b border-[#F5C542]/15 naksh-muted-text">
                  <td className="py-3 pr-4">{new Date(profile.createdAt).toLocaleString()}</td>
                  <td className="py-3 pr-4 text-[#FFF7E8]">{profile.displayName}</td>
                  <td className="py-3 pr-4">{profile.user?.email}</td>
                  <td className="py-3 pr-4">{profile.specialization}</td>
                  <td className="py-3 pr-4">{profile.languages?.join(", ")}</td>
                  <td className="py-3 pr-4">{profile.experienceYears}+ years</td>
                  <td className="py-3 pr-4">INR {Number(profile.consultationPrice).toLocaleString("en-IN")}</td>
                  <td className="py-3 pr-4">{profile.status}</td>
                  <td className="py-3 pr-4"><Link className="text-[#FFD36A] hover:underline" href="/admin/astrologers">Review</Link></td>
                </tr>
              ))}
              {!astrologerApprovals.length ? <tr><td colSpan={9} className="py-6 text-center naksh-muted-text">No astrologer profiles submitted yet.</td></tr> : null}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Card className="mt-6 overflow-hidden">
        <CardHeader><CardTitle>Report Requests</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.18em] text-[#FFD36A]">
              <tr className="border-b border-[#F5C542]/20">
                <th className="py-3 pr-4">Created</th>
                <th className="py-3 pr-4">User</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Plan</th>
                <th className="py-3 pr-4">Payment</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">DOB</th>
                <th className="py-3 pr-4">Time</th>
                <th className="py-3 pr-4">Place</th>
                <th className="py-3 pr-4">Phone</th>
                <th className="py-3 pr-4">Concern</th>
                <th className="py-3 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {reportRequests.map((request) => (
                <tr key={request.id} className="border-b border-[#F5C542]/15 naksh-muted-text">
                  <td className="py-3 pr-4">{new Date(request.createdAt).toLocaleString()}</td>
                  <td className="py-3 pr-4 text-[#FFF7E8]">{request.fullName}</td>
                  <td className="py-3 pr-4">{request.deliveryEmail || request.user?.email}</td>
                  <td className="py-3 pr-4">{request.planType}</td>
                  <td className="py-3 pr-4">{request.paymentStatus}</td>
                  <td className="py-3 pr-4">{request.status}</td>
                  <td className="py-3 pr-4">{request.dateOfBirth}</td>
                  <td className="py-3 pr-4">{request.timeOfBirth ?? "-"}</td>
                  <td className="py-3 pr-4">{request.birthPlace ?? "-"}</td>
                  <td className="py-3 pr-4">{request.phone ?? "-"}</td>
                  <td className="max-w-[16rem] truncate py-3 pr-4">{request.concern ?? "-"}</td>
                  <td className="py-3 pr-4"><Link className="text-[#FFD36A] hover:underline" href={`/admin/report-requests/${request.id}`}>View details</Link></td>
                </tr>
              ))}
              {!reportRequests.length ? <tr><td colSpan={12} className="py-6 text-center naksh-muted-text">No report requests yet.</td></tr> : null}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader><CardTitle>Revenue and growth</CardTitle></CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%"><LineChart data={chart}><XAxis dataKey="name" /><Tooltip /><Line dataKey="v" stroke="hsl(var(--secondary))" strokeWidth={3} /></LineChart></ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {operations.map(({ title, copy, icon: Icon }) => (
          <Card key={title} className="border-[#F5C542]/20 bg-[#201037]/80">
            <CardContent className="p-5">
              <Icon className="h-5 w-5 text-[#FFD36A]" />
              <h2 className="mt-4 font-cinzel text-lg font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 naksh-muted-text">{copy}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}


