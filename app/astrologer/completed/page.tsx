import { AstrologerPortalPlaceholder } from "@/components/astrologer-portal-placeholder";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AstrologerPortalPlaceholder
      eyebrow="Completed"
      title="Completed Consultations"
      description="Review completed sessions and client follow-up history."
      emptyText="No completed consultations yet."
      actionHref="/astrologer/dashboard"
      actionLabel="Back to dashboard"
    />
  );
}