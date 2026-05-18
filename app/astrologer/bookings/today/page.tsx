import { AstrologerPortalPlaceholder } from "@/components/astrologer-portal-placeholder";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AstrologerPortalPlaceholder
      eyebrow="Today"
      title="Today Bookings"
      description="Review consultations scheduled for today and start sessions from your dashboard."
      emptyText="No bookings scheduled for today."
      actionHref="/astrologer/availability"
      actionLabel="Set Availability"
    />
  );
}