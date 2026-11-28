import "server-only";
import {PDFDocument,StandardFonts,rgb,type PDFFont,type PDFPage} from "pdf-lib";
import {assembleAutomaticPaidReport} from "@/lib/reports/automatic-report-content";
import {generatePremiumReportPdf} from "@/lib/reports/premium-report-generation-service";
import {reportItemSchema,nameItemSchema} from "@/lib/digital-packages/input";
import {compareBusinessNames} from "@/lib/digital-packages/business-names";
import {referenceReminderEvents} from "@/lib/calendar/reminder-contract";
import {studyChapters,marriageChapters,type WorkbookChapter} from "@/lib/digital-packages/workbooks";

const INK=rgb(.19,.15,.17),WINE=rgb(.42,.13,.22),GOLD=rgb(.7,.52,.24),PAPER=rgb(.99,.97,.94),MUTED=rgb(.35,.30,.32),WHITE=rgb(1,1,1);
const W=595.28,H=841.89,LEFT=48,RIGHT=48,WIDTH=W-LEFT-RIGHT;
async function simpleDocument(title:string,write:(doc:ReturnType<typeof createWriter>)=>void){
 const pdf=await PDFDocument.create();
 pdf.setTitle("Naksharix | "+title);pdf.setAuthor("Naksharix");pdf.setLanguage("en-IN");
 const regular=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold);
 const doc=createWriter(pdf,regular,bold,title);write(doc);doc.finish();
 return Buffer.from(await pdf.save({useObjectStreams:true}));
}
function createWriter(pdf:PDFDocument,regular:PDFFont,bold:PDFFont,title:string){
 let page:PDFPage,y=0;
 const ascii=(s:string)=>s.replace(/[–—]/g,"-").replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[^\x20-\x7e\n]/g,"?");
 function start(){
  page=pdf.addPage([W,H]);page.drawRectangle({x:0,y:0,width:W,height:H,color:PAPER});
  page.drawRectangle({x:0,y:H-60,width:W,height:60,color:WINE});
  page.drawRectangle({x:LEFT,y:H-63,width:WIDTH,height:2,color:GOLD});
  page.drawText("NAKSHARIX  /  DIGITAL LIBRARY",{x:LEFT,y:H-36,size:12,font:bold,color:WHITE});y=H-99;
 }
 function wrap(text:string,font:PDFFont,size:number){
  const lines:string[]=[];let line="";
  for(const word of ascii(text).split(/\s+/).filter(Boolean)){
   if(font.widthOfTextAtSize(word,size)>WIDTH){if(line){lines.push(line);line="";}let chunk="";for(const c of word){if(font.widthOfTextAtSize(chunk+c,size)>WIDTH){lines.push(chunk);chunk="";}chunk+=c;}line=chunk;continue;}
   const next=line?line+" "+word:word;if(font.widthOfTextAtSize(next,size)>WIDTH){lines.push(line);line=word;}else line=next;
  }
  if(line)lines.push(line);return lines;
 }
 function paragraph(text:string,size=11,heavy=false,color=INK){
  const font=heavy?bold:regular;for(const line of wrap(text,font,size)){if(y<75)start();page.drawText(line,{x:LEFT,y,size,font,color});y-=size*1.5;}y-=9;
 }
 function heading(text:string){if(y<130)start();paragraph(text,17,true,WINE);}
 function newPage(){start();}
 start();heading(title);
 function finish(){const pages=pdf.getPages();pages.forEach((p,i)=>{p.drawLine({start:{x:LEFT,y:49},end:{x:W-RIGHT,y:49},thickness:.7,color:GOLD});p.drawText("www.naksharix.com | Reflective education",{x:LEFT,y:32,size:8,font:regular,color:MUTED});p.drawText(String(i+1)+" / "+pages.length,{x:W-RIGHT-45,y:32,size:8,font:regular,color:MUTED});});}
 return {paragraph,heading,newPage,finish};
}
function workbook(title:string,chapters:WorkbookChapter[]){
 return simpleDocument(title,doc=>{
  doc.paragraph("Original Naksharix study material. For reflective learning, not a scientific prediction, professional qualification or substitute for qualified advice.");
  doc.heading("How to use this workbook");doc.paragraph("Read one chapter, complete its exercise independently, then compare with the answer explanation. Mark uncertain inputs and distinguish arithmetic, tradition and evidence.");
  doc.heading("Contents");chapters.forEach(c=>doc.paragraph(c.title));
  for(const c of chapters){doc.newPage();doc.heading(c.title);c.body.forEach(p=>doc.paragraph(p));doc.heading("Practice");doc.paragraph(c.exercise);doc.paragraph("Your notes:");for(let i=0;i<3;i++)doc.paragraph("________________________________________________________________");
   doc.heading("Answer explanation");doc.paragraph(c.answer);}
 });
}
export async function renderPackageItem(item:{id:string;kind:string;privateInput:unknown},referenceDate:Date){
 if(item.kind==="reference-calendar-2027")return simpleDocument("2027 India-reference Calendar",doc=>{doc.paragraph("Reviewed dates only. Verify the local Panchang and current official notices. No booking or guaranteed muhurat. Manage optional reminders in your private account at www.naksharix.com/reference-reminders.");for(const e of referenceReminderEvents()){doc.paragraph(e.date+" | "+e.name,11,true);doc.paragraph("Reference: "+e.sourceUrl,9);}});
 if(item.kind==="study-workbook")return workbook("Understanding Your Kundli",studyChapters);
 if(item.kind==="marriage-workbook")return workbook("Marriage Planning Workbook",marriageChapters);
 if(item.kind==="business-name"){
  const rows=compareBusinessNames(nameItemSchema.parse(item.privateInput).names);
  return simpleDocument("Business Name Numerology",doc=>{
   doc.paragraph("Two traditional letter-number mappings are compared using only the Roman letters you submitted. Spaces, punctuation and case do not affect the sums. Compound totals are retained; roots are reduced to a single digit, without special master-number exceptions.");
   doc.paragraph("Pythagorean: repeating A-Z values 1 to 9. Chaldean: 1 AIJQY; 2 BKR; 3 CGLS; 4 DMT; 5 EHNX; 6 UVW; 7 OZ; 8 FP. These are symbolic conventions, not evidence of commercial success.");
   doc.heading("Comparison summary");rows.forEach(row=>doc.paragraph(row.name+" | Pythagorean "+row.pythagoreanTotal+" / "+row.pythagoreanRoot+" | Chaldean "+row.chaldeanTotal+" / "+row.chaldeanRoot,11,true));
   for(const row of rows){doc.newPage();doc.heading(row.name);doc.paragraph("Pythagorean total "+row.pythagoreanTotal+"; reduced root "+row.pythagoreanRoot+".");
    doc.paragraph("Chaldean total "+row.chaldeanTotal+"; reduced root "+row.chaldeanRoot+".");
    doc.paragraph("Pythagorean letter calculation: "+row.breakdown.map(x=>x.letter+"="+x.pythagorean).join(" + "));
    doc.paragraph("Chaldean letter calculation: "+row.breakdown.map(x=>x.letter+"="+x.chaldean).join(" + "));
    doc.paragraph("Reflection: consider whether the spelling is easy to remember and pronounce, clear for your audience, and appropriate for the proposed service. A number is not a ranking of commercial prospects.");
   }
   doc.newPage();doc.heading("Practical name selection checklist");
   ["Pronounce each candidate aloud and ask independent readers to spell it.","Search the relevant trademark register and business-name register with qualified assistance where needed.","Check domain and social-name availability; this report does not verify them.","Check language meanings, accessibility, and potential confusion with other brands.","Test the names with actual customers. Evaluate clarity, trust and memorability independently of numerology."].forEach(t=>doc.paragraph(t));
   doc.paragraph("No name is guaranteed to bring money, luck, legal registration or trademark availability. Final decisions require real research.");
  });
 }
 const input=reportItemSchema.parse(item.privateInput);
 const assembled=await assembleAutomaticPaidReport({slug:item.kind,...input,now:referenceDate});
 const result=await generatePremiumReportPdf({requestId:"package-"+item.id,templateId:item.kind,status:"ready_for_generation",content:assembled.content,automatedInputValidated:true,reportTitle:assembled.title,customerName:input.birth.name,language:input.language});
 if(!result.generated)throw Error("PACKAGE_RENDER_UNAVAILABLE");
 return result.bytes;
}
