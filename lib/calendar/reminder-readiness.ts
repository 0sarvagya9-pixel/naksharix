import "server-only";
import {prisma} from "@/lib/db";
import {env} from "@/lib/env";
import {getEmailReadiness} from "@/lib/email/email-service";
export async function reminderSchemaReady(){try{const [r]=await prisma.$queryRaw<{ready:boolean}[]>`SELECT to_regclass('public."ReferenceReminder"') IS NOT NULL AS ready`;return r?.ready===true;}catch{return false;}}
export async function reminderServiceReady(now=new Date()){return env.PREMIUM_REMINDERS_ENABLED==="true"&&now<new Date("2028-01-01T00:00:00Z")&&getEmailReadiness().emailEnabled&&await reminderSchemaReady();}
