import "server-only";
import {PDFDocument,StandardFonts,rgb} from "pdf-lib";
import {assembleAutomaticPaidReport} from "@/lib/reports/automatic-report-content";
import {autoReportSlugSet} from "@/lib/reports/automatic-report-input";
import {generatePremiumReportPdf} from "@/lib/reports/premium-report-generation-service";
import {getManualReportCheckout} from "@/lib/reports/checkout-catalogue";
// Only fixed fictional demonstration inputs; no account, payment or stored report lookup.
export async function buildFictionalReportSample(slug:string):Promise<Uint8Array>{
 if(!autoReportSlugSet.has(slug)||!getManualReportCheckout(slug))throw Error("UNKNOWN_SAMPLE");
 const birth={name:"Fictional Sample A",gender:"female",dateOfBirth:"1992-05-18",timeOfBirth:"08:15",birthPlace:"Delhi, India (example)",latitude:28.6139,longitude:77.209,timezone:5.5};
 const partner={...birth,name:"Fictional Sample B",gender:"male",dateOfBirth:"1991-11-23",timeOfBirth:"17:20",birthPlace:"Mumbai, India (example)",latitude:19.076,longitude:72.8777};
 const extra={confirmed:true as const,partner,partnerPermission:true,romanName:"Fictional Sample A",candidateNames:["Sample Asha","Sample Anya"]};
 const {title,content}=await assembleAutomaticPaidReport({slug,birth,extra,question:"Fictional demonstration only. No actual customer's birth details.",language:"en",now:new Date("2026-11-24T12:00:00Z")});
 const result=await generatePremiumReportPdf({requestId:"public-sample-"+slug,templateId:slug,status:"ready_for_generation",content,automatedInputValidated:true,reportTitle:"FICTIONAL SAMPLE | "+title,customerName:birth.name,language:"en"});
 if(!result.generated)throw Error("SAMPLE_RENDER_UNAVAILABLE");
 const source=await PDFDocument.load(result.bytes);
 if(source.getPageCount()<1)throw Error("EMPTY_SAMPLE");
 const sample=await PDFDocument.create();
 // Include the cover and first interior pages of the actual renderer.
 const pages=await sample.copyPages(source,Array.from({length:Math.min(3,source.getPageCount())},(_,i)=>i));
 const font=await sample.embedFont(StandardFonts.HelveticaBold);
 for(const page of pages){
  sample.addPage(page);
  const {width,height}=page.getSize();
  const label="FICTIONAL SAMPLE - NOT A PERSONAL REPORT";
  const size=10;
  page.drawRectangle({x:0,y:height-25,width,height:25,color:rgb(.34,.10,.18)});
  page.drawText(label,{x:Math.max(10,(width-font.widthOfTextAtSize(label,size))/2),y:height-16,size,font,color:rgb(1,1,1)});
 }
 sample.setTitle("NAKSHARIX | FICTIONAL SAMPLE | "+title);
 sample.setAuthor("NAKSHARIX");
 sample.setSubject("Selected pages from the actual report renderer with fixed fictional inputs; independently certified chart accuracy is not claimed.");
 return sample.save();
}
