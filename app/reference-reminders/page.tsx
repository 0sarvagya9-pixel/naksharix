import type {Metadata} from "next";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {getCurrentUser} from "@/lib/auth/jwt";
import {Section} from "@/components/section";
import {ReferenceReminderWorkspace} from "@/components/reference-reminder-workspace";
import {normalizeLocale} from "@/lib/i18n";
import {reminderCopy} from "@/lib/calendar/reminder-copy";
export const dynamic="force-dynamic";
async function labels(){return reminderCopy(normalizeLocale((await cookies()).get("naksharix-language")?.value));}
export async function generateMetadata():Promise<Metadata>{const copy=await labels();return {title:copy.title+" | Naksharix",robots:{index:false,follow:false}};}
export default async function ReferenceRemindersPage(){if(!await getCurrentUser())redirect("/login?redirectTo=%2Freference-reminders");const copy=await labels();return <Section className="max-w-5xl"><main className="rounded-3xl border border-[#e7cda3] bg-[#fff8ee] p-5 text-[#35242b] sm:p-8"><h1 className="font-cinzel text-3xl font-bold text-[#70283d]">{copy.title}</h1><p className="mt-3 leading-7">{copy.intro}</p><ReferenceReminderWorkspace/></main></Section>;}
