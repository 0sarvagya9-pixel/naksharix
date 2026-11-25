import type {Metadata} from "next";
import {redirect} from "next/navigation";
import {getCurrentUser} from "@/lib/auth/jwt";
import {Section} from "@/components/section";
import {ReferenceReminderWorkspace} from "@/components/reference-reminder-workspace";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Private reference reminders | Naksharix",robots:{index:false,follow:false}};
export default async function ReferenceRemindersPage(){
 if(!await getCurrentUser())redirect("/login?redirectTo=%2Freference-reminders");
 return <Section className="max-w-5xl"><main className="rounded-3xl border border-[#e7cda3] bg-[#fff8ee] p-5 text-[#35242b] sm:p-8"><h1 className="font-cinzel text-3xl font-bold text-[#70283d]">2027 Reference Reminders</h1><p className="mt-3 leading-7">Choose optional email reminders for reviewed dates. Only verified purchases qualify; the free calendar remains available. No guaranteed inbox delivery or ceremony reservation.</p><ReferenceReminderWorkspace/></main></Section>;
}
