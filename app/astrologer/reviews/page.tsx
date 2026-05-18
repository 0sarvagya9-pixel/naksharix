import { AstrologerPortalPlaceholder } from "@/components/astrologer-portal-placeholder";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AstrologerPortalPlaceholder
      eyebrow="Reviews"
      title="Reviews and Rating"
      description="Monitor client feedback, rating quality, and consultation experience."
      emptyText="No reviews yet."
      actionHref="/astrologer/dashboard"
      actionLabel="Back to dashboard"
    />
  );
}