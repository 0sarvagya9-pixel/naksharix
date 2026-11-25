/** Fixed checked-in contract derived from the 17 reviewed Prisma release models
 * and the nine additive SQL migrations. Catalog metadata only, no data rows.
 * CHECK counts detect omissions but are not proof of exact check semantics.
 */
type Column={table:string;column:string;udt:string;nullable:boolean;precision:number|null};
type Index={table:string;columns:string[];unique:boolean;primary:boolean};
type ForeignKey={table:string;columns:string[];target:string;targetColumns:string[];onDelete:string;onUpdate:string};
type CheckCount={table:string;count:number};
export type ReleaseCatalog={tables:string[];columns:Column[];indexes:Index[];foreignKeys:ForeignKey[];checkCounts:CheckCount[];enumValues:string[]};
export const RELEASE_SCHEMA_EXPECTED:ReleaseCatalog={
 "tables": [
  "MarketingConsent",
  "AiCreditGrant",
  "AiCreditUse",
  "WebPushSubscription",
  "DigitalPackageOrder",
  "DigitalPackageItem",
  "BusinessTenant",
  "BusinessApiKey",
  "BusinessUsageMonth",
  "BusinessUsageCall",
  "ExpertServiceRequest",
  "AiMembership",
  "AiMembershipCycle",
  "ReferenceReminder",
  "DeferredServicePlan",
  "DeferredServiceAllocation",
  "DeferredServiceReceipt"
 ],
 "columns": [
  {
   "table": "MarketingConsent",
   "column": "userId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "MarketingConsent",
   "column": "emailAtConsent",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "MarketingConsent",
   "column": "interest",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "MarketingConsent",
   "column": "country",
   "udt": "text",
   "nullable": true,
   "precision": null
  },
  {
   "table": "MarketingConsent",
   "column": "locale",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "MarketingConsent",
   "column": "source",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "MarketingConsent",
   "column": "consentVersion",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "MarketingConsent",
   "column": "confirmedAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "MarketingConsent",
   "column": "revokedAt",
   "udt": "timestamp",
   "nullable": true,
   "precision": 3
  },
  {
   "table": "MarketingConsent",
   "column": "updatedAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "AiCreditGrant",
   "column": "paymentId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiCreditGrant",
   "column": "units",
   "udt": "int4",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiCreditGrant",
   "column": "remaining",
   "udt": "int4",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiCreditGrant",
   "column": "offerVersion",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiCreditGrant",
   "column": "validFrom",
   "udt": "timestamp",
   "nullable": true,
   "precision": 3
  },
  {
   "table": "AiCreditGrant",
   "column": "validUntil",
   "udt": "timestamp",
   "nullable": true,
   "precision": 3
  },
  {
   "table": "AiCreditGrant",
   "column": "suspendedAt",
   "udt": "timestamp",
   "nullable": true,
   "precision": 3
  },
  {
   "table": "AiCreditGrant",
   "column": "revokedAt",
   "udt": "timestamp",
   "nullable": true,
   "precision": 3
  },
  {
   "table": "AiCreditGrant",
   "column": "createdAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "AiCreditUse",
   "column": "id",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiCreditUse",
   "column": "userId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiCreditUse",
   "column": "requestId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiCreditUse",
   "column": "grantPaymentId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiCreditUse",
   "column": "status",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiCreditUse",
   "column": "expiresAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "AiCreditUse",
   "column": "finishedAt",
   "udt": "timestamp",
   "nullable": true,
   "precision": 3
  },
  {
   "table": "AiCreditUse",
   "column": "createdAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "WebPushSubscription",
   "column": "id",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "WebPushSubscription",
   "column": "userId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "WebPushSubscription",
   "column": "endpointDigest",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "WebPushSubscription",
   "column": "endpointCiphertext",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "WebPushSubscription",
   "column": "keyFingerprint",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "WebPushSubscription",
   "column": "consentVersion",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "WebPushSubscription",
   "column": "lastAcceptedAt",
   "udt": "timestamp",
   "nullable": true,
   "precision": 3
  },
  {
   "table": "WebPushSubscription",
   "column": "lastOutcome",
   "udt": "text",
   "nullable": true,
   "precision": null
  },
  {
   "table": "WebPushSubscription",
   "column": "createdAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "WebPushSubscription",
   "column": "updatedAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "DigitalPackageOrder",
   "column": "id",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DigitalPackageOrder",
   "column": "userId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DigitalPackageOrder",
   "column": "clientIntent",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DigitalPackageOrder",
   "column": "productKey",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DigitalPackageOrder",
   "column": "productVersion",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DigitalPackageOrder",
   "column": "pricePaise",
   "udt": "int4",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DigitalPackageOrder",
   "column": "consentVersion",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DigitalPackageOrder",
   "column": "inputDigest",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DigitalPackageOrder",
   "column": "status",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DigitalPackageOrder",
   "column": "expiresAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "DigitalPackageOrder",
   "column": "paymentId",
   "udt": "text",
   "nullable": true,
   "precision": null
  },
  {
   "table": "DigitalPackageOrder",
   "column": "createdAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "DigitalPackageOrder",
   "column": "updatedAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "DigitalPackageItem",
   "column": "id",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DigitalPackageItem",
   "column": "orderId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DigitalPackageItem",
   "column": "position",
   "udt": "int4",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DigitalPackageItem",
   "column": "kind",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DigitalPackageItem",
   "column": "privateInput",
   "udt": "jsonb",
   "nullable": true,
   "precision": null
  },
  {
   "table": "DigitalPackageItem",
   "column": "status",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DigitalPackageItem",
   "column": "leaseToken",
   "udt": "text",
   "nullable": true,
   "precision": null
  },
  {
   "table": "DigitalPackageItem",
   "column": "leaseUntil",
   "udt": "timestamp",
   "nullable": true,
   "precision": 3
  },
  {
   "table": "DigitalPackageItem",
   "column": "attempts",
   "udt": "int4",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DigitalPackageItem",
   "column": "pdfBytes",
   "udt": "bytea",
   "nullable": true,
   "precision": null
  },
  {
   "table": "DigitalPackageItem",
   "column": "pdfStorageKey",
   "udt": "text",
   "nullable": true,
   "precision": null
  },
  {
   "table": "DigitalPackageItem",
   "column": "pdfStorageDriver",
   "udt": "text",
   "nullable": true,
   "precision": null
  },
  {
   "table": "DigitalPackageItem",
   "column": "pdfChecksum",
   "udt": "text",
   "nullable": true,
   "precision": null
  },
  {
   "table": "DigitalPackageItem",
   "column": "pdfSize",
   "udt": "int4",
   "nullable": true,
   "precision": null
  },
  {
   "table": "DigitalPackageItem",
   "column": "generatedAt",
   "udt": "timestamp",
   "nullable": true,
   "precision": 3
  },
  {
   "table": "DigitalPackageItem",
   "column": "createdAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "DigitalPackageItem",
   "column": "updatedAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "BusinessTenant",
   "column": "id",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessTenant",
   "column": "ownerUserId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessTenant",
   "column": "displayName",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessTenant",
   "column": "brandName",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessTenant",
   "column": "contractReference",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessTenant",
   "column": "approvedById",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessTenant",
   "column": "status",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessTenant",
   "column": "contractExpiresAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "BusinessTenant",
   "column": "monthlyUnitLimit",
   "udt": "int4",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessTenant",
   "column": "unitPricePaise",
   "udt": "int4",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessTenant",
   "column": "scopes",
   "udt": "_text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessTenant",
   "column": "createdAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "BusinessTenant",
   "column": "updatedAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "BusinessApiKey",
   "column": "id",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessApiKey",
   "column": "tenantId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessApiKey",
   "column": "digest",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessApiKey",
   "column": "label",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessApiKey",
   "column": "scopes",
   "udt": "_text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessApiKey",
   "column": "expiresAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "BusinessApiKey",
   "column": "revokedAt",
   "udt": "timestamp",
   "nullable": true,
   "precision": 3
  },
  {
   "table": "BusinessApiKey",
   "column": "createdAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "BusinessUsageMonth",
   "column": "tenantId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessUsageMonth",
   "column": "period",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessUsageMonth",
   "column": "attemptedUnits",
   "udt": "int4",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessUsageMonth",
   "column": "completedUnits",
   "udt": "int4",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessUsageMonth",
   "column": "failedUnits",
   "udt": "int4",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessUsageMonth",
   "column": "unitPricePaise",
   "udt": "int4",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessUsageMonth",
   "column": "createdAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "BusinessUsageMonth",
   "column": "updatedAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "BusinessUsageCall",
   "column": "tenantId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessUsageCall",
   "column": "requestId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessUsageCall",
   "column": "period",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessUsageCall",
   "column": "keyId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessUsageCall",
   "column": "scope",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessUsageCall",
   "column": "units",
   "udt": "int4",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessUsageCall",
   "column": "state",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "BusinessUsageCall",
   "column": "createdAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "BusinessUsageCall",
   "column": "finishedAt",
   "udt": "timestamp",
   "nullable": true,
   "precision": 3
  },
  {
   "table": "ExpertServiceRequest",
   "column": "id",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "ExpertServiceRequest",
   "column": "userId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "ExpertServiceRequest",
   "column": "clientIntent",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "ExpertServiceRequest",
   "column": "kind",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "ExpertServiceRequest",
   "column": "question",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "ExpertServiceRequest",
   "column": "language",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "ExpertServiceRequest",
   "column": "sourceReportId",
   "udt": "text",
   "nullable": true,
   "precision": null
  },
  {
   "table": "ExpertServiceRequest",
   "column": "sourceChecksum",
   "udt": "text",
   "nullable": true,
   "precision": null
  },
  {
   "table": "ExpertServiceRequest",
   "column": "consentVersion",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "ExpertServiceRequest",
   "column": "status",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "ExpertServiceRequest",
   "column": "astrologerProfileId",
   "udt": "text",
   "nullable": true,
   "precision": null
  },
  {
   "table": "ExpertServiceRequest",
   "column": "quoteVersion",
   "udt": "int4",
   "nullable": false,
   "precision": null
  },
  {
   "table": "ExpertServiceRequest",
   "column": "pricePaise",
   "udt": "int4",
   "nullable": true,
   "precision": null
  },
  {
   "table": "ExpertServiceRequest",
   "column": "expertFeePaise",
   "udt": "int4",
   "nullable": true,
   "precision": null
  },
  {
   "table": "ExpertServiceRequest",
   "column": "dueAt",
   "udt": "timestamp",
   "nullable": true,
   "precision": 3
  },
  {
   "table": "ExpertServiceRequest",
   "column": "providerAcceptedAt",
   "udt": "timestamp",
   "nullable": true,
   "precision": 3
  },
  {
   "table": "ExpertServiceRequest",
   "column": "paymentId",
   "udt": "text",
   "nullable": true,
   "precision": null
  },
  {
   "table": "ExpertServiceRequest",
   "column": "sourceReadAt",
   "udt": "timestamp",
   "nullable": true,
   "precision": 3
  },
  {
   "table": "ExpertServiceRequest",
   "column": "sourceReadChecksum",
   "udt": "text",
   "nullable": true,
   "precision": null
  },
  {
   "table": "ExpertServiceRequest",
   "column": "response",
   "udt": "text",
   "nullable": true,
   "precision": null
  },
  {
   "table": "ExpertServiceRequest",
   "column": "completedAt",
   "udt": "timestamp",
   "nullable": true,
   "precision": 3
  },
  {
   "table": "ExpertServiceRequest",
   "column": "settlementStatus",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "ExpertServiceRequest",
   "column": "settlementReference",
   "udt": "text",
   "nullable": true,
   "precision": null
  },
  {
   "table": "ExpertServiceRequest",
   "column": "settledAt",
   "udt": "timestamp",
   "nullable": true,
   "precision": 3
  },
  {
   "table": "ExpertServiceRequest",
   "column": "createdAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "ExpertServiceRequest",
   "column": "updatedAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "AiMembership",
   "column": "id",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiMembership",
   "column": "userId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiMembership",
   "column": "clientIntent",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiMembership",
   "column": "version",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiMembership",
   "column": "planId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiMembership",
   "column": "pricePaise",
   "udt": "int4",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiMembership",
   "column": "unitsPerCycle",
   "udt": "int4",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiMembership",
   "column": "totalCycles",
   "udt": "int4",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiMembership",
   "column": "approvedModel",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiMembership",
   "column": "termsVersion",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiMembership",
   "column": "liveMode",
   "udt": "bool",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiMembership",
   "column": "providerSubscriptionId",
   "udt": "text",
   "nullable": true,
   "precision": null
  },
  {
   "table": "AiMembership",
   "column": "hostedUrl",
   "udt": "text",
   "nullable": true,
   "precision": null
  },
  {
   "table": "AiMembership",
   "column": "state",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiMembership",
   "column": "providerState",
   "udt": "text",
   "nullable": true,
   "precision": null
  },
  {
   "table": "AiMembership",
   "column": "lastProviderCheckedAt",
   "udt": "timestamp",
   "nullable": true,
   "precision": 3
  },
  {
   "table": "AiMembership",
   "column": "cancellationRequestedAt",
   "udt": "timestamp",
   "nullable": true,
   "precision": 3
  },
  {
   "table": "AiMembership",
   "column": "createdAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "AiMembership",
   "column": "updatedAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "AiMembershipCycle",
   "column": "id",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiMembershipCycle",
   "column": "membershipId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiMembershipCycle",
   "column": "cycleNumber",
   "udt": "int4",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiMembershipCycle",
   "column": "periodStart",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "AiMembershipCycle",
   "column": "periodEnd",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "AiMembershipCycle",
   "column": "providerInvoiceId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiMembershipCycle",
   "column": "paymentId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "AiMembershipCycle",
   "column": "createdAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "ReferenceReminder",
   "column": "id",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "ReferenceReminder",
   "column": "userId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "ReferenceReminder",
   "column": "orderId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "ReferenceReminder",
   "column": "eventId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "ReferenceReminder",
   "column": "eventDate",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "ReferenceReminder",
   "column": "leadDays",
   "udt": "int4",
   "nullable": false,
   "precision": null
  },
  {
   "table": "ReferenceReminder",
   "column": "dueAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "ReferenceReminder",
   "column": "consentVersion",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "ReferenceReminder",
   "column": "recipientDigest",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "ReferenceReminder",
   "column": "status",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "ReferenceReminder",
   "column": "claimedAt",
   "udt": "timestamp",
   "nullable": true,
   "precision": 3
  },
  {
   "table": "ReferenceReminder",
   "column": "acceptedAt",
   "udt": "timestamp",
   "nullable": true,
   "precision": 3
  },
  {
   "table": "ReferenceReminder",
   "column": "createdAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "ReferenceReminder",
   "column": "updatedAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "DeferredServicePlan",
   "column": "id",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DeferredServicePlan",
   "column": "kind",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DeferredServicePlan",
   "column": "target",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DeferredServicePlan",
   "column": "label",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DeferredServicePlan",
   "column": "providerRef",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DeferredServicePlan",
   "column": "evidenceRef",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DeferredServicePlan",
   "column": "termsRef",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DeferredServicePlan",
   "column": "capacity",
   "udt": "int4",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DeferredServicePlan",
   "column": "startsAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "DeferredServicePlan",
   "column": "endsAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "DeferredServicePlan",
   "column": "state",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DeferredServicePlan",
   "column": "reviewedById",
   "udt": "text",
   "nullable": true,
   "precision": null
  },
  {
   "table": "DeferredServicePlan",
   "column": "reviewedAt",
   "udt": "timestamp",
   "nullable": true,
   "precision": 3
  },
  {
   "table": "DeferredServicePlan",
   "column": "createdAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "DeferredServicePlan",
   "column": "updatedAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "DeferredServiceAllocation",
   "column": "id",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DeferredServiceAllocation",
   "column": "planId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DeferredServiceAllocation",
   "column": "ticketId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DeferredServiceAllocation",
   "column": "userId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DeferredServiceAllocation",
   "column": "units",
   "udt": "int4",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DeferredServiceAllocation",
   "column": "completedUnits",
   "udt": "int4",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DeferredServiceAllocation",
   "column": "state",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DeferredServiceAllocation",
   "column": "version",
   "udt": "int4",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DeferredServiceAllocation",
   "column": "holdUntil",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "DeferredServiceAllocation",
   "column": "acceptedAt",
   "udt": "timestamp",
   "nullable": true,
   "precision": 3
  },
  {
   "table": "DeferredServiceAllocation",
   "column": "canceledAt",
   "udt": "timestamp",
   "nullable": true,
   "precision": 3
  },
  {
   "table": "DeferredServiceAllocation",
   "column": "createdAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "DeferredServiceAllocation",
   "column": "updatedAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "DeferredServiceReceipt",
   "column": "id",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DeferredServiceReceipt",
   "column": "allocationId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DeferredServiceReceipt",
   "column": "operationId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DeferredServiceReceipt",
   "column": "evidenceRef",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DeferredServiceReceipt",
   "column": "units",
   "udt": "int4",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DeferredServiceReceipt",
   "column": "occurredAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  },
  {
   "table": "DeferredServiceReceipt",
   "column": "actorId",
   "udt": "text",
   "nullable": false,
   "precision": null
  },
  {
   "table": "DeferredServiceReceipt",
   "column": "createdAt",
   "udt": "timestamp",
   "nullable": false,
   "precision": 3
  }
 ],
 "indexes": [
  {
   "table": "MarketingConsent",
   "columns": [
    "userId"
   ],
   "unique": true,
   "primary": true
  },
  {
   "table": "MarketingConsent",
   "columns": [
    "revokedAt",
    "confirmedAt"
   ],
   "unique": false,
   "primary": false
  },
  {
   "table": "AiCreditGrant",
   "columns": [
    "paymentId"
   ],
   "unique": true,
   "primary": true
  },
  {
   "table": "AiCreditUse",
   "columns": [
    "id"
   ],
   "unique": true,
   "primary": true
  },
  {
   "table": "AiCreditUse",
   "columns": [
    "userId",
    "requestId"
   ],
   "unique": true,
   "primary": false
  },
  {
   "table": "AiCreditUse",
   "columns": [
    "userId",
    "createdAt"
   ],
   "unique": false,
   "primary": false
  },
  {
   "table": "AiCreditUse",
   "columns": [
    "userId",
    "status",
    "expiresAt"
   ],
   "unique": false,
   "primary": false
  },
  {
   "table": "WebPushSubscription",
   "columns": [
    "id"
   ],
   "unique": true,
   "primary": true
  },
  {
   "table": "WebPushSubscription",
   "columns": [
    "endpointDigest"
   ],
   "unique": true,
   "primary": false
  },
  {
   "table": "WebPushSubscription",
   "columns": [
    "userId",
    "createdAt"
   ],
   "unique": false,
   "primary": false
  },
  {
   "table": "DigitalPackageOrder",
   "columns": [
    "id"
   ],
   "unique": true,
   "primary": true
  },
  {
   "table": "DigitalPackageOrder",
   "columns": [
    "paymentId"
   ],
   "unique": true,
   "primary": false
  },
  {
   "table": "DigitalPackageOrder",
   "columns": [
    "userId",
    "clientIntent"
   ],
   "unique": true,
   "primary": false
  },
  {
   "table": "DigitalPackageOrder",
   "columns": [
    "userId",
    "createdAt"
   ],
   "unique": false,
   "primary": false
  },
  {
   "table": "DigitalPackageOrder",
   "columns": [
    "userId",
    "status"
   ],
   "unique": false,
   "primary": false
  },
  {
   "table": "DigitalPackageItem",
   "columns": [
    "id"
   ],
   "unique": true,
   "primary": true
  },
  {
   "table": "DigitalPackageItem",
   "columns": [
    "orderId",
    "position"
   ],
   "unique": true,
   "primary": false
  },
  {
   "table": "DigitalPackageItem",
   "columns": [
    "orderId",
    "status"
   ],
   "unique": false,
   "primary": false
  },
  {
   "table": "BusinessTenant",
   "columns": [
    "id"
   ],
   "unique": true,
   "primary": true
  },
  {
   "table": "BusinessTenant",
   "columns": [
    "ownerUserId",
    "status"
   ],
   "unique": false,
   "primary": false
  },
  {
   "table": "BusinessApiKey",
   "columns": [
    "id"
   ],
   "unique": true,
   "primary": true
  },
  {
   "table": "BusinessApiKey",
   "columns": [
    "digest"
   ],
   "unique": true,
   "primary": false
  },
  {
   "table": "BusinessApiKey",
   "columns": [
    "tenantId",
    "revokedAt"
   ],
   "unique": false,
   "primary": false
  },
  {
   "table": "BusinessUsageMonth",
   "columns": [
    "tenantId",
    "period"
   ],
   "unique": true,
   "primary": true
  },
  {
   "table": "BusinessUsageCall",
   "columns": [
    "tenantId",
    "requestId"
   ],
   "unique": true,
   "primary": true
  },
  {
   "table": "BusinessUsageCall",
   "columns": [
    "tenantId",
    "period"
   ],
   "unique": false,
   "primary": false
  },
  {
   "table": "ExpertServiceRequest",
   "columns": [
    "id"
   ],
   "unique": true,
   "primary": true
  },
  {
   "table": "ExpertServiceRequest",
   "columns": [
    "paymentId"
   ],
   "unique": true,
   "primary": false
  },
  {
   "table": "ExpertServiceRequest",
   "columns": [
    "settlementReference"
   ],
   "unique": true,
   "primary": false
  },
  {
   "table": "ExpertServiceRequest",
   "columns": [
    "userId",
    "clientIntent"
   ],
   "unique": true,
   "primary": false
  },
  {
   "table": "ExpertServiceRequest",
   "columns": [
    "userId",
    "status"
   ],
   "unique": false,
   "primary": false
  },
  {
   "table": "ExpertServiceRequest",
   "columns": [
    "astrologerProfileId",
    "status"
   ],
   "unique": false,
   "primary": false
  },
  {
   "table": "ExpertServiceRequest",
   "columns": [
    "status",
    "createdAt"
   ],
   "unique": false,
   "primary": false
  },
  {
   "table": "AiMembership",
   "columns": [
    "id"
   ],
   "unique": true,
   "primary": true
  },
  {
   "table": "AiMembership",
   "columns": [
    "providerSubscriptionId"
   ],
   "unique": true,
   "primary": false
  },
  {
   "table": "AiMembership",
   "columns": [
    "userId",
    "clientIntent"
   ],
   "unique": true,
   "primary": false
  },
  {
   "table": "AiMembership",
   "columns": [
    "userId",
    "state"
   ],
   "unique": false,
   "primary": false
  },
  {
   "table": "AiMembershipCycle",
   "columns": [
    "id"
   ],
   "unique": true,
   "primary": true
  },
  {
   "table": "AiMembershipCycle",
   "columns": [
    "providerInvoiceId"
   ],
   "unique": true,
   "primary": false
  },
  {
   "table": "AiMembershipCycle",
   "columns": [
    "paymentId"
   ],
   "unique": true,
   "primary": false
  },
  {
   "table": "AiMembershipCycle",
   "columns": [
    "membershipId",
    "cycleNumber"
   ],
   "unique": true,
   "primary": false
  },
  {
   "table": "AiMembershipCycle",
   "columns": [
    "membershipId",
    "periodStart"
   ],
   "unique": true,
   "primary": false
  },
  {
   "table": "AiMembershipCycle",
   "columns": [
    "membershipId",
    "periodEnd"
   ],
   "unique": false,
   "primary": false
  },
  {
   "table": "ReferenceReminder",
   "columns": [
    "id"
   ],
   "unique": true,
   "primary": true
  },
  {
   "table": "ReferenceReminder",
   "columns": [
    "userId",
    "eventId"
   ],
   "unique": true,
   "primary": false
  },
  {
   "table": "ReferenceReminder",
   "columns": [
    "status",
    "dueAt"
   ],
   "unique": false,
   "primary": false
  },
  {
   "table": "ReferenceReminder",
   "columns": [
    "orderId"
   ],
   "unique": false,
   "primary": false
  },
  {
   "table": "DeferredServicePlan",
   "columns": [
    "id"
   ],
   "unique": true,
   "primary": true
  },
  {
   "table": "DeferredServicePlan",
   "columns": [
    "kind",
    "state",
    "endsAt"
   ],
   "unique": false,
   "primary": false
  },
  {
   "table": "DeferredServiceAllocation",
   "columns": [
    "id"
   ],
   "unique": true,
   "primary": true
  },
  {
   "table": "DeferredServiceAllocation",
   "columns": [
    "ticketId"
   ],
   "unique": true,
   "primary": false
  },
  {
   "table": "DeferredServiceAllocation",
   "columns": [
    "planId",
    "state",
    "holdUntil"
   ],
   "unique": false,
   "primary": false
  },
  {
   "table": "DeferredServiceAllocation",
   "columns": [
    "userId",
    "createdAt"
   ],
   "unique": false,
   "primary": false
  },
  {
   "table": "DeferredServiceReceipt",
   "columns": [
    "id"
   ],
   "unique": true,
   "primary": true
  },
  {
   "table": "DeferredServiceReceipt",
   "columns": [
    "operationId"
   ],
   "unique": true,
   "primary": false
  },
  {
   "table": "DeferredServiceReceipt",
   "columns": [
    "allocationId",
    "evidenceRef"
   ],
   "unique": true,
   "primary": false
  },
  {
   "table": "DeferredServiceReceipt",
   "columns": [
    "allocationId",
    "occurredAt"
   ],
   "unique": false,
   "primary": false
  }
 ],
 "foreignKeys": [
  {
   "table": "MarketingConsent",
   "columns": [
    "userId"
   ],
   "target": "User",
   "targetColumns": [
    "id"
   ],
   "onDelete": "c",
   "onUpdate": "c"
  },
  {
   "table": "AiCreditGrant",
   "columns": [
    "paymentId"
   ],
   "target": "Payment",
   "targetColumns": [
    "id"
   ],
   "onDelete": "c",
   "onUpdate": "c"
  },
  {
   "table": "AiCreditUse",
   "columns": [
    "userId"
   ],
   "target": "User",
   "targetColumns": [
    "id"
   ],
   "onDelete": "c",
   "onUpdate": "c"
  },
  {
   "table": "AiCreditUse",
   "columns": [
    "grantPaymentId"
   ],
   "target": "AiCreditGrant",
   "targetColumns": [
    "paymentId"
   ],
   "onDelete": "c",
   "onUpdate": "c"
  },
  {
   "table": "WebPushSubscription",
   "columns": [
    "userId"
   ],
   "target": "User",
   "targetColumns": [
    "id"
   ],
   "onDelete": "c",
   "onUpdate": "c"
  },
  {
   "table": "DigitalPackageOrder",
   "columns": [
    "userId"
   ],
   "target": "User",
   "targetColumns": [
    "id"
   ],
   "onDelete": "c",
   "onUpdate": "c"
  },
  {
   "table": "DigitalPackageOrder",
   "columns": [
    "paymentId"
   ],
   "target": "Payment",
   "targetColumns": [
    "id"
   ],
   "onDelete": "n",
   "onUpdate": "c"
  },
  {
   "table": "DigitalPackageItem",
   "columns": [
    "orderId"
   ],
   "target": "DigitalPackageOrder",
   "targetColumns": [
    "id"
   ],
   "onDelete": "c",
   "onUpdate": "c"
  },
  {
   "table": "BusinessTenant",
   "columns": [
    "ownerUserId"
   ],
   "target": "User",
   "targetColumns": [
    "id"
   ],
   "onDelete": "c",
   "onUpdate": "c"
  },
  {
   "table": "BusinessApiKey",
   "columns": [
    "tenantId"
   ],
   "target": "BusinessTenant",
   "targetColumns": [
    "id"
   ],
   "onDelete": "c",
   "onUpdate": "c"
  },
  {
   "table": "BusinessUsageMonth",
   "columns": [
    "tenantId"
   ],
   "target": "BusinessTenant",
   "targetColumns": [
    "id"
   ],
   "onDelete": "c",
   "onUpdate": "c"
  },
  {
   "table": "BusinessUsageCall",
   "columns": [
    "tenantId"
   ],
   "target": "BusinessTenant",
   "targetColumns": [
    "id"
   ],
   "onDelete": "c",
   "onUpdate": "c"
  },
  {
   "table": "ExpertServiceRequest",
   "columns": [
    "userId"
   ],
   "target": "User",
   "targetColumns": [
    "id"
   ],
   "onDelete": "c",
   "onUpdate": "c"
  },
  {
   "table": "ExpertServiceRequest",
   "columns": [
    "astrologerProfileId"
   ],
   "target": "AstrologerProfile",
   "targetColumns": [
    "id"
   ],
   "onDelete": "n",
   "onUpdate": "c"
  },
  {
   "table": "ExpertServiceRequest",
   "columns": [
    "paymentId"
   ],
   "target": "Payment",
   "targetColumns": [
    "id"
   ],
   "onDelete": "n",
   "onUpdate": "c"
  },
  {
   "table": "AiMembership",
   "columns": [
    "userId"
   ],
   "target": "User",
   "targetColumns": [
    "id"
   ],
   "onDelete": "r",
   "onUpdate": "c"
  },
  {
   "table": "AiMembershipCycle",
   "columns": [
    "membershipId"
   ],
   "target": "AiMembership",
   "targetColumns": [
    "id"
   ],
   "onDelete": "c",
   "onUpdate": "c"
  },
  {
   "table": "AiMembershipCycle",
   "columns": [
    "paymentId"
   ],
   "target": "Payment",
   "targetColumns": [
    "id"
   ],
   "onDelete": "c",
   "onUpdate": "c"
  },
  {
   "table": "ReferenceReminder",
   "columns": [
    "userId"
   ],
   "target": "User",
   "targetColumns": [
    "id"
   ],
   "onDelete": "c",
   "onUpdate": "c"
  },
  {
   "table": "ReferenceReminder",
   "columns": [
    "orderId"
   ],
   "target": "DigitalPackageOrder",
   "targetColumns": [
    "id"
   ],
   "onDelete": "c",
   "onUpdate": "c"
  },
  {
   "table": "DeferredServiceAllocation",
   "columns": [
    "planId"
   ],
   "target": "DeferredServicePlan",
   "targetColumns": [
    "id"
   ],
   "onDelete": "r",
   "onUpdate": "c"
  },
  {
   "table": "DeferredServiceAllocation",
   "columns": [
    "ticketId"
   ],
   "target": "SupportTicket",
   "targetColumns": [
    "id"
   ],
   "onDelete": "c",
   "onUpdate": "c"
  },
  {
   "table": "DeferredServiceAllocation",
   "columns": [
    "userId"
   ],
   "target": "User",
   "targetColumns": [
    "id"
   ],
   "onDelete": "c",
   "onUpdate": "c"
  },
  {
   "table": "DeferredServiceReceipt",
   "columns": [
    "allocationId"
   ],
   "target": "DeferredServiceAllocation",
   "targetColumns": [
    "id"
   ],
   "onDelete": "c",
   "onUpdate": "c"
  }
 ],
 "checkCounts": [
  {
   "table": "MarketingConsent",
   "count": 0
  },
  {
   "table": "AiCreditGrant",
   "count": 2
  },
  {
   "table": "AiCreditUse",
   "count": 1
  },
  {
   "table": "WebPushSubscription",
   "count": 0
  },
  {
   "table": "DigitalPackageOrder",
   "count": 2
  },
  {
   "table": "DigitalPackageItem",
   "count": 4
  },
  {
   "table": "BusinessTenant",
   "count": 3
  },
  {
   "table": "BusinessApiKey",
   "count": 0
  },
  {
   "table": "BusinessUsageMonth",
   "count": 2
  },
  {
   "table": "BusinessUsageCall",
   "count": 2
  },
  {
   "table": "ExpertServiceRequest",
   "count": 7
  },
  {
   "table": "AiMembership",
   "count": 4
  },
  {
   "table": "AiMembershipCycle",
   "count": 2
  },
  {
   "table": "ReferenceReminder",
   "count": 2
  },
  {
   "table": "DeferredServicePlan",
   "count": 3
  },
  {
   "table": "DeferredServiceAllocation",
   "count": 3
  },
  {
   "table": "DeferredServiceReceipt",
   "count": 1
  }
 ],
 "enumValues": [
  "AI_CREDITS",
  "DIGITAL_PACKAGE",
  "EXPERT_SERVICE",
  "AI_MEMBERSHIP"
 ]
};
export const RELEASE_CATALOG_SQL="SELECT json_build_object(\n 'tables',(SELECT COALESCE(json_agg(table_name),'[]'::json) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'),\n 'columns',(SELECT COALESCE(json_agg(json_build_object('table',table_name,'column',column_name,'udt',udt_name,'nullable',is_nullable='YES','precision',datetime_precision)),'[]'::json) FROM information_schema.columns WHERE table_schema='public'),\n 'indexes',(SELECT COALESCE(json_agg(json_build_object('table',c.relname,'columns',ARRAY(SELECT a.attname::text FROM unnest(i.indkey::smallint[]) WITH ORDINALITY AS k(attnum,ord) JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum=k.attnum WHERE k.ord<=i.indnkeyatts ORDER BY k.ord),'unique',i.indisunique,'primary',i.indisprimary)),'[]'::json) FROM pg_index i JOIN pg_class c ON c.oid=i.indrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND i.indisvalid AND i.indisready AND i.indpred IS NULL AND i.indexprs IS NULL),\n 'foreignKeys',(SELECT COALESCE(json_agg(json_build_object('table',c.relname,'columns',ARRAY(SELECT a.attname::text FROM unnest(k.conkey) WITH ORDINALITY AS u(attnum,ord) JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum=u.attnum ORDER BY u.ord),'target',t.relname,'targetColumns',ARRAY(SELECT a.attname::text FROM unnest(k.confkey) WITH ORDINALITY AS u(attnum,ord) JOIN pg_attribute a ON a.attrelid=t.oid AND a.attnum=u.attnum ORDER BY u.ord),'onDelete',k.confdeltype::text,'onUpdate',k.confupdtype::text)),'[]'::json) FROM pg_constraint k JOIN pg_class c ON c.oid=k.conrelid JOIN pg_class t ON t.oid=k.confrelid JOIN pg_namespace n ON n.oid=c.relnamespace JOIN pg_namespace tn ON tn.oid=t.relnamespace WHERE n.nspname='public' AND tn.nspname='public' AND k.contype='f' AND k.convalidated),\n 'checkCounts',(SELECT COALESCE(json_agg(json_build_object('table',x.name,'count',x.count)),'[]'::json) FROM (SELECT c.relname AS name,count(*)::int AS count FROM pg_constraint k JOIN pg_class c ON c.oid=k.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND k.contype='c' AND k.convalidated GROUP BY c.relname) x),\n 'enumValues',(SELECT COALESCE(json_agg(e.enumlabel),'[]'::json) FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typname='PaymentPurpose')\n) AS catalog";
const same=(a:string[],b:string[])=>a.length===b.length&&a.every((v,i)=>v===b[i]);
export function compareReleaseCatalog(actual:ReleaseCatalog|null){
 const e=RELEASE_SCHEMA_EXPECTED;
 const missingTables=e.tables.filter(t=>!actual?.tables.includes(t));
 const missingColumns=e.columns.filter(c=>!actual?.columns.some(a=>a.table===c.table&&a.column===c.column&&a.udt===c.udt&&a.nullable===c.nullable&&(c.precision===null||c.precision===a.precision))).map(c=>c.table+"."+c.column);
 const missingIndexes=e.indexes.filter(c=>!actual?.indexes.some(a=>a.table===c.table&&a.unique===c.unique&&a.primary===c.primary&&same(a.columns,c.columns))).map(c=>c.table+"("+c.columns.join(",")+")");
 const missingForeignKeys=e.foreignKeys.filter(c=>!actual?.foreignKeys.some(a=>a.table===c.table&&a.target===c.target&&a.onDelete===c.onDelete&&a.onUpdate===c.onUpdate&&same(a.columns,c.columns)&&same(a.targetColumns,c.targetColumns))).map(c=>c.table+"("+c.columns.join(",")+")");
 const missingCheckTables=e.checkCounts.filter(c=>c.count>(actual?.checkCounts.find(a=>a.table===c.table)?.count??0)).map(c=>c.table);
 const missingEnums=e.enumValues.filter(v=>!actual?.enumValues.includes(v));
 const checked={tables:e.tables.length,columns:e.columns.length,indexes:e.indexes.length,foreignKeys:e.foreignKeys.length,checkTables:e.checkCounts.filter(c=>c.count>0).length,enumValues:e.enumValues.length};
 const missing={tables:missingTables,columns:missingColumns,indexes:missingIndexes,foreignKeys:missingForeignKeys,checkTables:missingCheckTables,enumValues:missingEnums};
 const missingCount=Object.values(missing).reduce((n,a)=>n+a.length,0);
 return {ready:actual!==null&&missingCount===0,checked,missingCount,missing};
}
