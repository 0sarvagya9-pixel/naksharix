import { Section } from "@/components/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/roles";

export default async function ProfilePage() {
  const user = await requireRole(["USER", "ASTROLOGER", "CONSULTANT", "ADMIN", "SUPER_ADMIN"]);
  return (
    <Section>
      <Card className="glass">
        <CardHeader>
          <CardTitle className="font-cinzel">My Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <p><span className="text-foreground">Name:</span> {user.name}</p>
          <p><span className="text-foreground">Email:</span> {user.email}</p>
          <p><span className="text-foreground">Role:</span> {user.role}</p>
          <p><span className="text-foreground">Status:</span> Active</p>
        </CardContent>
      </Card>
    </Section>
  );
}
