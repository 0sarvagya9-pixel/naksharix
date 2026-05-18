import { AstrologerPortalPlaceholder } from "@/components/astrologer-portal-placeholder";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AstrologerPortalPlaceholder
      eyebrow="Requests"
      title="Pending Requests"
      description="Accept, reject, or reschedule client consultation requests when bookings are available."
      emptyText="No pending requests."
      actionHref="/astrologer/dashboard"
      actionLabel="Back to dashboard"
    />
  );
}