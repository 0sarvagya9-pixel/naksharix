import { AstrologerPortalPlaceholder } from "@/components/astrologer-portal-placeholder";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AstrologerPortalPlaceholder
      eyebrow="Payout"
      title="Payout Request"
      description="Request payouts for completed and eligible consultation earnings."
      emptyText="No payout request is available yet."
      actionHref="/astrologer/earnings"
      actionLabel="View Earnings"
    />
  );
}