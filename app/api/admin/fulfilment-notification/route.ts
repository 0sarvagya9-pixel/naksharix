import { z } from "zod";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getAdminApiUser } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { notifyCustomerOfFulfilmentChange, isNotifiableFulfilmentStatus } from "@/lib/notifications/fulfilment-updates";

export const dynamic = "force-dynamic";

// An explicit owner-only resend of an existing status, never a new booking,
// payment, refund, receipt, or arbitrary email destination.
const inputSchema = z.object({
  kind: z.enum(["shop", "puja"]),
  id: z.string().min(4).max(140),
  expectedVersion: z.number().int().min(1)
}).strict();

export async function POST(request: Request) {
  try {
    const admin = await getAdminApiUser();
    if (!admin) return fail("Forbidden", 403);
    const input = await validateJson(request, inputSchema);
    const type = input.kind === "shop" ? "ShopOrder" : "PujaBookingRequest";

    // Cross-instance transactional lock and one-hour attempt budget. A retry
    // cannot silently multiply customer emails when two admins click together.
    const claim = await prisma.$transaction(async tx => {
      await tx.$queryRaw<Array<{ locked: string }>>`
        SELECT pg_advisory_xact_lock(
          hashtext(${type}), hashtext(${input.id})
        )::text AS locked
      `;
      const record = input.kind === "shop"
        ? await tx.shopOrder.findUnique({where:{id:input.id}, select:{userId:true,status:true,version:true}})
        : await tx.pujaBookingRequest.findUnique({where:{id:input.id}, select:{userId:true,status:true,version:true}});
      if (!record) return {kind: "missing" as const};
      if (record.version !== input.expectedVersion) return {kind: "stale" as const};
      if (!isNotifiableFulfilmentStatus(input.kind,record.status)) return {kind: "unavailable" as const};
      const recent = await tx.adminActionLog.count({where:{
        action:"fulfilment.email.retry.claim",
        targetType:type,
        targetId:input.id,
        createdAt:{gte:new Date(Date.now()-3600_000)}
      }});
      if(recent>=2) return {kind: "throttled" as const};
      await tx.adminActionLog.create({data:{
        adminId:admin.id,
        action:"fulfilment.email.retry.claim",
        targetType:type,targetId:input.id,
        metadata:{kind:input.kind,status:record.status,version:record.version}
      }});
      return {kind:"claimed" as const, status:record.status, userId:record.userId,version:record.version};
    });
    if(claim.kind==="missing")return fail("Fulfilment record not found.",404);
    if(claim.kind==="stale")return fail("Status changed. Refresh before retrying notification.",409);
    if(claim.kind==="unavailable")return fail("This status does not have a customer notification.",422);
    if(claim.kind==="throttled")return fail("Notification retry limit reached. Please try later.",429);

    const notification = await notifyCustomerOfFulfilmentChange({
      kind:input.kind,userId:claim.userId,reference:input.id,
      oldStatus:"__AUTHORIZED_ADMIN_RETRY__",status:claim.status
    });
    // Log only status/outcome, not names, emails, addresses, or sensitive ceremony details.
    await prisma.adminActionLog.create({data:{
      adminId:admin.id,
      action:"fulfilment.email.retry.outcome",targetType:type,targetId:input.id,
      metadata:{outcome:notification.outcome,status:claim.status,version:claim.version}
    }}).catch(()=>undefined);
    return ok({status:claim.status,notification});
  } catch(error) {return handleApiError(error);}
}
