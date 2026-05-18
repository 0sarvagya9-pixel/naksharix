import { AstrologerBookingActions } from "@/components/astrologer-booking-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type BookingRow = {
  id: string;
  mode: string;
  status: string;
  scheduledAt: Date;
  durationMins: number;
  question: string;
  amount: unknown;
  paymentStatus: string;
  birthName?: string | null;
  birthDate?: Date | null;
  birthTime?: string | null;
  birthPlace?: string | null;
  metadata?: unknown;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export function AstrologerBookingsList({
  title,
  emptyText,
  bookings,
  showActions = false
}: {
  title: string;
  emptyText: string;
  bookings: BookingRow[];
  showActions?: boolean;
}) {
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="font-cinzel">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {bookings.map((booking) => {
          const metadata = booking.metadata && typeof booking.metadata === "object" ? booking.metadata as Record<string, unknown> : {};
          const customerName = String(metadata.customerName ?? booking.birthName ?? booking.user?.name ?? "Client");
          const customerEmail = String(metadata.customerEmail ?? booking.user?.email ?? "-");
          const customerPhone = metadata.customerPhone ? String(metadata.customerPhone) : "-";
          return (
            <div key={booking.id} className="rounded-lg border border-[#F5C542]/20 bg-[#201037]/70 p-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-cinzel text-lg font-bold text-[#FFF7E8]">{customerName}</p>
                    <span className="rounded-full border border-[#F5C542]/25 px-2 py-0.5 text-xs text-[#FFD36A]">{booking.status}</span>
                    <span className="rounded-full border border-[#A855F7]/25 px-2 py-0.5 text-xs naksh-muted-text">{booking.mode}</span>
                  </div>
                  <p className="text-sm naksh-muted-text">{booking.scheduledAt.toLocaleString("en-IN")} | {booking.durationMins} min</p>
                  <p className="text-sm naksh-muted-text">Email: {customerEmail} | Phone: {customerPhone}</p>
                  <p className="text-sm naksh-muted-text">Payment: {booking.paymentStatus} | Amount: INR {Number(booking.amount ?? 0).toLocaleString("en-IN")}</p>
                  {booking.birthDate || booking.birthTime || booking.birthPlace ? (
                    <p className="text-sm naksh-muted-text">
                      Birth details: {[booking.birthDate ? booking.birthDate.toLocaleDateString("en-IN") : null, booking.birthTime, booking.birthPlace].filter(Boolean).join(" | ")}
                    </p>
                  ) : null}
                  <p className="text-sm leading-6 text-[#F8F1FF]">{booking.question}</p>
                </div>
                {showActions ? <AstrologerBookingActions bookingId={booking.id} /> : null}
              </div>
            </div>
          );
        })}
        {!bookings.length ? <p className="rounded-lg border border-[#F5C542]/20 bg-[#201037]/50 p-4 text-sm naksh-muted-text">{emptyText}</p> : null}
      </CardContent>
    </Card>
  );
}
