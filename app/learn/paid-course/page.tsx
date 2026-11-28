import type {Metadata} from "next";
import {redirect} from "next/navigation";
import {cookies} from "next/headers";
import {getCurrentUser} from "@/lib/auth/jwt";
import {Section} from "@/components/section";
import {PaidCourseWorkspace} from "@/components/paid-course-workspace";
import {normalizeLocale} from "@/lib/i18n";
import {courseCustomerCopy} from "@/lib/learning/course-customer-copy";
import Link from "next/link";
export const dynamic="force-dynamic";
async function copy(){return courseCustomerCopy(normalizeLocale((await cookies()).get("naksharix-language")?.value));}
export async function generateMetadata():Promise<Metadata>{const c=await copy();return {title:c.title+" | Naksharix",robots:{index:false,follow:false}};}
export default async function Page({searchParams}:{searchParams:Promise<{orderId?:string}>}){
 const {orderId}=await searchParams;
 const valid=typeof orderId==="string"&&/^[a-zA-Z0-9_-]{1,100}$/.test(orderId);
 if(!await getCurrentUser())redirect("/login?redirectTo="+encodeURIComponent(valid?"/learn/paid-course?orderId="+orderId:"/digital-packages"));
 const c=await copy();
 return <Section className="max-w-6xl"><div className="rounded-3xl bg-[#fff8ee] text-[#35242b] p-5 sm:p-8"><h1 className="font-cinzel text-3xl font-black text-[#70283d]">{c.title}</h1><p className="my-5 leading-7">{c.intro}</p>{valid?<PaidCourseWorkspace orderId={orderId}/>:<Link href="/digital-packages" className="underline">{c.select}</Link>}</div></Section>;
}
