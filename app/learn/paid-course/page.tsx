import type {Metadata} from "next";
import {redirect} from "next/navigation";
import {getCurrentUser} from "@/lib/auth/jwt";
import {Section} from "@/components/section";
import {PaidCourseWorkspace} from "@/components/paid-course-workspace";
import Link from "next/link";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Private Vedic Astrology Course",robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{orderId?:string}>}){
 const {orderId}=await searchParams;
 const valid=typeof orderId==="string"&&/^[a-zA-Z0-9_-]{1,100}$/.test(orderId);
 if(!await getCurrentUser())redirect("/login?redirectTo="+encodeURIComponent(valid?"/learn/paid-course?orderId="+orderId:"/digital-packages"));
 return <Section className="max-w-6xl"><div className="rounded-3xl bg-[#fff8ee] text-[#35242b] p-5 sm:p-8"><h1 className="font-cinzel text-3xl font-black text-[#70283d]">Vedic Astrology Foundations</h1><p className="my-5 leading-7">Private English self-study course with seven guided modules and a purchased workbook. No live instructor or accredited qualification.</p>{valid?<PaidCourseWorkspace orderId={orderId}/>:<Link href="/digital-packages" className="underline">Select a purchased course</Link>}</div></Section>;
}
