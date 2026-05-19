import Link from "next/link";
import { Section } from "@/components/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";

export default async function ProfilePage() {
  const user = await requireRole(["USER", "ASTROLOGER", "CONSULTANT", "ADMIN", "SUPER_ADMIN"]);
  const reportRequests = await prisma.reportRequest.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 10 });
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
                <p className="text-xs text-[#FFD700]">Report will be sent within 24 hours.</p>
              </div>
              <Link className="text-[#FFD700] hover:underline" href={`/report-request/success?id=${request.id}`}>View</Link>
            </div>
          ))}
          {!reportRequests.length ? <p className="naksh-muted-text">No report requests yet.</p> : null}
        </CardContent>
      </Card>
    </Section>
  );
}
