import Link from "next/link";
import { Section } from "@/components/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import {PushPreferences} from "@/components/push-preferences";
import {env} from "@/lib/env";

export default async function ProfilePage() {
  const user = await requireRole(["USER", "ASTROLOGER", "CONSULTANT", "ADMIN", "SUPER_ADMIN"]);
  const reportRequests = await prisma.reportRequest.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 10 });
  const kundliReports = await prisma.kundliReport.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 6 });
  return (
    <Section>
      <Card className="glass">
        <CardHeader>
          <CardTitle className="font-cinzel">My Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm naksh-muted-text sm:grid-cols-2">
          <p><span className="text-foreground">Name:</span> {user.name}</p>
          <p><span className="text-foreground">Email:</span> {user.email}</p>
          <p><span className="text-foreground">Role:</span> {user.role}</p>
          <p><span className="text-foreground">Status:</span> Active</p>
        </CardContent>
      </Card>

      <PushPreferences/>
      {env.B2B_INTEGRATION_ENABLED==="true"?<Link className="mt-5 inline-block font-semibold underline" href="/business-workspace">Business integration workspace</Link>:null}
      {env.DIGITAL_PACKAGE_SALES_ENABLED==="true"||env.DIGITAL_PACKAGE_GENERATION_ENABLED==="true"?<Link className="mt-5 ml-4 inline-block font-semibold underline" href="/digital-packages">Digital package orders</Link>:null}
      <Card className="glass mt-6">
        <CardHeader>
          <CardTitle className="font-cinzel">My Orders / My Report Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {reportRequests.map((request) => (
            <div key={request.id} className="flex flex-col gap-2 rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-foreground">{request.planType} Report</p>
                <p className="naksh-muted-text">{request.createdAt.toLocaleString()} | {request.paymentStatus} | {request.status}</p>
                <p className="naksh-muted-text">Delivery: {request.deliveryEmail}</p>
                <p className="text-xs text-[#FFD700]">{request.deliveryStatus==="email_sent"?"Report email accepted by delivery provider.":request.deliveryStatus.startsWith("auto_")?"Automatic report processing. Open the request for status and retry.":"Report review workflow. Download appears after a real PDF is stored."}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link className="text-[#FFD700] hover:underline" href={`/report-request/success?id=${request.id}`}>View</Link>
                {request.generatedPdfSize && request.paymentStatus!=="REFUNDED" ? <Link className="text-[#00f5a0] hover:underline" href={`/api/report-requests/${request.id}/download`}>Download PDF</Link> : null}
              </div>
            </div>
          ))}
          {!reportRequests.length ? <p className="naksh-muted-text">No report requests yet.</p> : null}
        </CardContent>
      </Card>

      <Card className="glass mt-6">
        <CardHeader>
          <CardTitle className="font-cinzel">Saved Kundli History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {kundliReports.map((report) => (
            <div key={report.id} className="flex flex-col gap-2 rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-foreground">{report.name}</p>
                <p className="naksh-muted-text">{report.birthPlace} | {report.dateOfBirth.toISOString().slice(0, 10)} {report.timeOfBirth}</p>
                <p className="text-xs text-[#FFD700]">Saved from a real generated Kundli session.</p>
              </div>
              <Link className="text-[#FFD700] hover:underline" href={`/kundli/report/${report.id}`}>Open</Link>
            </div>
          ))}
          {!kundliReports.length ? <p className="naksh-muted-text">No saved Kundli reports yet.</p> : null}
        </CardContent>
      </Card>
    </Section>
  );
}
