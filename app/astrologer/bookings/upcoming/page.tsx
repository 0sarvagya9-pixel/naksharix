import { AstrologerPortalPlaceholder } from "@/components/astrologer-portal-placeholder";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AstrologerPortalPlaceholder
      eyebrow="Upcoming"
      title="Upcoming Bookings"
      description="Track confirmed consultations and prepare for upcoming client sessions."
      emptyText="No upcoming bookings yet."
      actionHref="/astrologer/availability"
      actionLabel="Update Availability"
    />
  );
}