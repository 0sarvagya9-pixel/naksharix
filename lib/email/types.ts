import "server-only";

export type EmailProvider = "disabled" | "smtp" | "ses";

export type EmailReadiness = {
  provider: EmailProvider;
  emailEnabled: boolean;
  missing: string[];
  deliveryMode: "disabled" | "smtp_email" | "resend_api" | "ses_ready_shell";
  reason: string;
};

export type EmailSendResult = {
  sent: boolean;
  reason: string;
  missing: string[];
};
