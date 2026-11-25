import {z} from "zod";
import {getCurrentUser} from "@/lib/auth/jwt";
import {fail,ok,handleApiError,validateJson} from "@/lib/api";
import {sharedRateLimitResponse} from "@/lib/security/rate-limit";
import {REMINDER_CONSENT_VERSION} from "@/lib/calendar/reminder-contract";
import {reminderAccount,scheduleReminder,cancelReminder} from "@/lib/calendar/reminder-ledger";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const schema=z.object({orderId:z.string().min(1).max(100),eventId:z.string().min(1).max(160),leadDays:z.union([z.literal(1),z.literal(7)]),consent:z.literal(true),consentVersion:z.literal(REMINDER_CONSENT_VERSION)}).strict();
export async function GET(){try{const user=await getCurrentUser();if(!user)return fail("Sign in to manage reminders.",401);const result=await reminderAccount(user.id);return result?ok(result):fail("Reminder registry unavailable.",503);}catch(e){return handleApiError(e);}}
export async function POST(request:Request){try{const user=await getCurrentUser();if(!user)return fail("Sign in to manage reminders.",401);const limit=await sharedRateLimitResponse("reference-reminder",user.id,10,60000);if(limit)return limit;const result=await scheduleReminder(user.id,await validateJson(request,schema));return result?ok({reminder:result}):fail("No eligible purchase, date, consent or reminder service.",409);}catch(e){return handleApiError(e);}}
export async function DELETE(request:Request){try{const user=await getCurrentUser();if(!user)return fail("Sign in to manage reminders.",401);const limit=await sharedRateLimitResponse("reference-reminder",user.id,10,60000);if(limit)return limit;const body=await validateJson(request,z.object({id:z.string().min(1).max(100)}).strict());return await cancelReminder(user.id,body.id)?ok({canceled:true}):fail("Reminder unavailable or already processing.",409);}catch(e){return handleApiError(e);}}
