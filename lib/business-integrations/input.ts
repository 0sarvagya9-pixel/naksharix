import {z} from "zod";
import {businessScopes} from "@/lib/business-integrations/contract";
import {canonicalWidgetOrigin} from "@/lib/business-integrations/widget-origin";
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>{const n=Date.parse(v+"T00:00:00Z");return Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===v&&v>="1900-01-01"&&v<="2100-12-31";});
const coordinates={latitude:z.number().finite().min(-89).max(89),longitude:z.number().finite().min(-180).max(180),offsetMinutes:z.number().int().min(-720).max(840)};
const birth=z.object({date,time:z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),...coordinates}).strict();
export const businessPanchangLocation=z.object({date,...coordinates}).strict();
const panchang=businessPanchangLocation;
const common={requestId:z.string().uuid()};
export const businessCalculationSchema=z.discriminatedUnion("scope",[
 z.object({...common,scope:z.literal("chart"),subjectPermission:z.literal(true),birth}).strict(),
 z.object({...common,scope:z.literal("matching"),subjectPermission:z.literal(true),first:birth,second:birth}).strict(),
 z.object({...common,scope:z.literal("panchang"),location:panchang}).strict(),
 z.object({...common,scope:z.literal("panchang-widget"),location:panchang,browserOrigin:z.string().max(253).refine(v=>canonicalWidgetOrigin(v)===v).optional()}).strict()
]);
export type BusinessCalculation=z.infer<typeof businessCalculationSchema>;
export const scopeList=z.array(z.enum(businessScopes)).min(1).max(4).refine(v=>new Set(v).size===v.length);
export const tenantSchema=z.object({ownerEmail:z.string().email().max(254),displayName:z.string().trim().min(2).max(80),brandName:z.string().trim().min(2).max(80),contractReference:z.string().trim().min(5).max(120),contractExpiresAt:date,monthlyUnitLimit:z.number().int().min(1).max(1000000),unitPricePaise:z.number().int().min(0).max(100000),scopes:scopeList,ownerConfirmed:z.literal(true)}).strict();
export const keySchema=z.object({tenantId:z.string().min(1).max(100),label:z.string().trim().min(2).max(60),scopes:scopeList}).strict();
