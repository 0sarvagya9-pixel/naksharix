import {z} from "zod";
import {expertKinds,EXPERT_TERMS_VERSION} from "@/lib/expert-services/contract";
const id=z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/);
export const requestSchema=z.object({clientIntent:z.string().uuid(),kind:z.enum(expertKinds),question:z.string().trim().min(20).max(1600),language:z.enum(["en","hi","hinglish"]),sourceReportId:id.optional(),consent:z.literal(true),consentVersion:z.literal(EXPERT_TERMS_VERSION)}).strict().refine(x=>(x.kind==="REPORT_REVIEW")===Boolean(x.sourceReportId),"Select a purchased report only for report review.");
export const adminSchema=z.discriminatedUnion("action",[
 z.object({action:z.literal("ASSIGN"),id,profileId:id,pricePaise:z.number().int().min(100).max(10000000),expertFeePaise:z.number().int().positive().max(10000000),dueAt:z.string().datetime(),confirmed:z.literal(true)}).strict(),
 z.object({action:z.literal("CANCEL"),id,confirmed:z.literal(true)}).strict(),
 z.object({action:z.literal("SETTLED"),id,reference:z.string().trim().min(8).max(100),confirmed:z.literal(true)}).strict()
]);
export const providerSchema=z.discriminatedUnion("action",[
 z.object({action:z.literal("ACCEPT"),id,quoteVersion:z.number().int().positive(),confirmed:z.literal(true)}).strict(),
 z.object({action:z.literal("DECLINE"),id,quoteVersion:z.number().int().positive()}).strict(),
 z.object({action:z.literal("DELIVER"),id,response:z.string().trim().min(120).max(12000),confirmedHumanReview:z.literal(true)}).strict()
]);
