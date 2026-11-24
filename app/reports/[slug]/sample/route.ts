import {buildFictionalReportSample} from "@/lib/reports/fictional-sample";
import {AUTO_REPORT_SLUGS,autoReportSlugSet} from "@/lib/reports/automatic-report-input";
import {getActiveAstrologyProviderName} from "@/lib/astrology/provider";
export const runtime="nodejs";
export const dynamic="force-static";
export const dynamicParams=false;
export function generateStaticParams(){return getActiveAstrologyProviderName()==="own_engine"?AUTO_REPORT_SLUGS.map(slug=>({slug})):[];}
export async function GET(_request:Request,{params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 if(!autoReportSlugSet.has(slug))return new Response("Sample not found",{status:404});
 if(getActiveAstrologyProviderName()!=="own_engine")return new Response("Sample unavailable",{status:503});
 // Build fails visibly if a supported sample cannot be generated. No placeholder PDF.
 const bytes=await buildFictionalReportSample(slug);
 return new Response(new Uint8Array(bytes),{headers:{"Content-Type":"application/pdf","Content-Disposition":`inline; filename="naksharix-${slug}-fictional-sample.pdf"`,"X-Robots-Tag":"noindex, nofollow","X-Content-Type-Options":"nosniff","Cache-Control":"public, max-age=3600"}});
}
