import { z } from "zod";
import {createHash} from "node:crypto";
import { fail, handleApiError, ok, validateJson } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { notifySupportTeamOfNewTicket } from "@/lib/notifications/support-updates";

const createSchema = z.object({
  subject: z.string().trim().min(5).max(140),
  message: z.string().trim().min(10).max(2000),
  clientMutationId:z.string().uuid().transform(value=>value.toLowerCase()).optional()
}).strict();

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthenticated", 401);
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: user.id },
      select: {
        id: true, subject: true, status: true, priority: true,
        messages: true, createdAt: true, updatedAt: true
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });
    return ok({ tickets }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthenticated", 401);
    const input = await validateJson(request, createSchema);
    const select={id:true,userId:true,subject:true,status:true,priority:true,messages:true,createdAt:true,updatedAt:true} as const;
    // Scope the retry identity to the authenticated account. Existing clients
    // without an intent retain their old contract; the new UI always sends one.
    const id=input.clientMutationId?"support-"+createHash("sha256").update(JSON.stringify([user.id,input.clientMutationId])).digest("hex"):null;
    const existing=id?await prisma.supportTicket.findUnique({where:{id},select}):null;
    const sameIntent=(ticket:NonNullable<typeof existing>)=>{
      const initial=Array.isArray(ticket.messages)?ticket.messages[0]:null;
      return ticket.userId===user.id&&ticket.subject===input.subject&&initial!==null&&typeof initial==="object"&&!Array.isArray(initial)&&initial.author==="USER"&&initial.text===input.message;
    };
    const publicTicket=(ticket:NonNullable<typeof existing>)=>({id:ticket.id,subject:ticket.subject,status:ticket.status,priority:ticket.priority,messages:ticket.messages,createdAt:ticket.createdAt,updatedAt:ticket.updatedAt});
    if(existing){
      if(!sameIntent(existing))return fail("Support request reference is already used with different details.",409);
      return ok({ticket:publicTicket(existing),duplicate:true,clientMutationId:input.clientMutationId,notification:"not_needed"});
    }
    const limited = await rateLimit("support-create:" + user.id, 5, 3600);
    if (!limited.allowed) return fail("Too many support requests. Please try again later.", 429);
    const data={userId:user.id,subject:input.subject,status:"OPEN",priority:"NORMAL",messages:[{author:"USER",text:input.message,at:new Date().toISOString()}]};
    let ticket;
    if(id){
      // PostgreSQL uniqueness is the cross-instance guard, including concurrent
      // identical submissions. A replay may not overwrite the initial ticket.
      const created=await prisma.supportTicket.createMany({data:[{id,...data}],skipDuplicates:true});
      const stored=await prisma.supportTicket.findUniqueOrThrow({where:{id},select});
      if(!sameIntent(stored))return fail("Support request reference is already used with different details.",409);
      if(created.count!==1)return ok({ticket:publicTicket(stored),duplicate:true,clientMutationId:input.clientMutationId,notification:"not_needed"});
      ticket=stored;
    }else{
      ticket=await prisma.supportTicket.create({data,select});
    }
    // Notify the configured owner mailbox only after successful ticket creation.
    // Mail-provider downtime cannot invalidate or duplicate the saved ticket.
    const notification = await notifySupportTeamOfNewTicket(ticket.id);
    return ok({ ticket:publicTicket(ticket),notification,duplicate:false,clientMutationId:input.clientMutationId }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return handleApiError(error);
  }
}
