import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { marketingConsentVersion, marketingInterests } from "../lib/marketing-consent.ts";

const interestIds = new Set(marketingInterests.map(([id]) => id));
function mailbox(value) { return typeof value==="string" ? value.trim().toLowerCase() : ""; }
function validDate(value) { const d = new Date(value); return Number.isFinite(d.getTime()) && value != null; }
function reservedMailbox(email) {
  const host=email.split("@")[1]??"";
  return !host || /(^|\.)(invalid|test|example|localhost)$/.test(host) || /(^|\.)example\.(com|net|org)$/.test(host);
}

// The aggregate uses the provider snapshot supplied by an authorized operator.
// Nothing here obtains a credential, exports recipients, sends email or unblocks a contact.
export function reconcileMarketingConsent(records, snapshot, excludedEmails=[]) {
  if (!Number.isSafeInteger(snapshot?.listId) || snapshot.listId<=0 ||
      !validDate(snapshot.capturedAt) || Date.parse(snapshot.capturedAt)>Date.now() ||
      !Array.isArray(snapshot.contacts) || !Number.isSafeInteger(snapshot.count) || snapshot.count!==snapshot.contacts.length) {
    throw Error("Supply a dated, complete snapshot of one Brevo list with its declared total.");
  }
  const provider=new Map(), duplicate=new Set(), localCounts=new Map();
  for (const contact of snapshot.contacts) {
    const email=mailbox(contact?.email);
    if (!email) continue;
    if (provider.has(email)) duplicate.add(email);
    provider.set(email,contact);
  }
  for (const r of records) {
    const email=mailbox(r.emailAtConsent);
    localCounts.set(email,(localCounts.get(email)??0)+1);
  }
  const excluded=new Set(excludedEmails.map(mailbox).filter(Boolean));
  const reasons={},interests={};
  let providerSuppressionReview=0;
  for (const r of records) {
    const email=mailbox(r.emailAtConsent), p=provider.get(email);
    const listed=p && Array.isArray(p.listIds) && p.listIds.includes(snapshot.listId);
    const providerDenied=p?.emailBlacklisted===true || (Array.isArray(p?.listUnsubscribed)&&p.listUnsubscribed.includes(snapshot.listId));
    const providerAllows=p?.emailBlacklisted===false && Array.isArray(p.listUnsubscribed) && !providerDenied && listed && !duplicate.has(email);
    let reason;
    if (!r.user || r.user.role!=="USER" || excluded.has(email) || excluded.has(mailbox(r.user.email)) || reservedMailbox(email)) reason="excludedAccount";
    else if (r.revokedAt) reason="websiteWithdrawn";
    else if (!r.user.emailVerifiedAt && !r.user.emailVerified) reason="unverifiedAccount";
    else if (mailbox(r.user.email)!==email) reason="accountAddressChanged";
    else if (r.consentVersion!==marketingConsentVersion || !validDate(r.confirmedAt) || new Date(r.confirmedAt)>new Date() ||
      r.source!=="website-email-updates" || !interestIds.has(r.interest)) reason="consentRequiresReview";
    else if (localCounts.get(email)!==1 || duplicate.has(email)) reason="duplicateIdentity";
    else if (!p) reason="providerRecordMissing";
    else if (providerDenied) reason="providerSuppressed";
    else if (!providerAllows) reason="providerStateUnknown";
    else if (new Date(r.confirmedAt).getTime()>Date.parse(snapshot.capturedAt)) reason="websiteChangedAfterSnapshot";
    else { reason="matchedAtSnapshot"; interests[r.interest]=(interests[r.interest]??0)+1; }
    reasons[reason]=(reasons[reason]??0)+1;
    if (providerAllows && ["excludedAccount","websiteWithdrawn","unverifiedAccount","accountAddressChanged","consentRequiresReview","duplicateIdentity"].includes(reason)) {
      providerSuppressionReview++;
    }
  }
  const providerOnlyAddresses=[...provider.keys()].filter(email=>!localCounts.has(email)).length;
  return {listId:snapshot.listId,providerOnlyAddresses,providerSnapshotAt:snapshot.capturedAt,websiteConsentRows:records.length,providerListRows:snapshot.count,
    reasons,matchedBySelectedInterest:interests,providerSuppressionReview,sendAuthorized:false};
}

export async function auditConsentDatabase(prisma,snapshot,excludedEmails) {
  return prisma.$transaction(async tx=>{
    await tx.$executeRaw`SET TRANSACTION READ ONLY`;
    const records=await tx.marketingConsent.findMany({select:{emailAtConsent:true,source:true,interest:true,confirmedAt:true,
      revokedAt:true,consentVersion:true,user:{select:{email:true,emailVerified:true,emailVerifiedAt:true,role:true}}}});
    return reconcileMarketingConsent(records,snapshot,excludedEmails);
  },{isolationLevel:"RepeatableRead"});
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href===import.meta.url) {
  if (process.argv.length!==3) throw Error("Usage: node --experimental-strip-types scripts/audit-marketing-consent.mjs <private-snapshot.json>");
  const snapshot=JSON.parse(await fs.readFile(process.argv[2],"utf8"));
  const excluded=[process.env.ADMIN_EMAIL,process.env.EMAIL_QA_RECIPIENT,...(snapshot.excludedEmails??[])];
  const {PrismaClient}=await import("@prisma/client");
  const db=new PrismaClient();
  try { console.log(JSON.stringify(await auditConsentDatabase(db,snapshot,excluded),null,2)); }
  finally { await db.$disconnect(); }
}
