import "server-only";
import {PDFDocument,StandardFonts,rgb,type PDFPage,type PDFFont} from "pdf-lib";
import {createHash} from "node:crypto";
import type {CanonicalChartResult} from "@/lib/astrology/ephemeris/types";
import {validPdfBrand} from "@/lib/business-integrations/contract";

const W=595.28,H=841.89,M=48,CW=W-2*M;
const ink=rgb(.18,.15,.18),wine=rgb(.44,.15,.24),gold=rgb(.66,.46,.18),pale=rgb(.98,.96,.92),muted=rgb(.33,.33,.38),white=rgb(1,1,1);
const degree=(n:unknown)=>typeof n==="number"&&Number.isFinite(n)?n.toFixed(3):"Unavailable";
const signs=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const planetNames=["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"];

function chartIsComplete(chart:CanonicalChartResult){
 return chart.planets.length===9&&new Set(chart.planets.map(p=>p.planet)).size===9&&planetNames.every(name=>chart.planets.some(p=>p.planet===name))&&
  chart.planets.every(p=>typeof p.absoluteLongitude==="number"&&Number.isFinite(p.absoluteLongitude)&&p.absoluteLongitude>=0&&p.absoluteLongitude<360&&
    !!p.sign&&signs.includes(p.sign)&&typeof p.house==="number"&&Number.isInteger(p.house)&&p.house>=1&&p.house<=12)&&
  !!chart.ascendant.sign&&signs.includes(chart.ascendant.sign)&&typeof chart.ascendant.absoluteLongitude==="number"&&Number.isFinite(chart.ascendant.absoluteLongitude)&&
  !!chart.nakshatra.name&&typeof chart.nakshatra.pada==="number"&&chart.nakshatra.pada>=1&&chart.nakshatra.pada<=4&&
  chart.houses?.length===12&&new Set(chart.houses.map(h=>h.house)).size===12&&chart.houses.every(h=>h.house>=1&&h.house<=12&&!!h.sign&&signs.includes(h.sign));
}

/** Server-owned, bounded numerical chart reference; no user-supplied logo,
 * personal name, URL, HTML, external fetch, report archive or predictive text. */
export async function renderPartnerChartPdf(chart:CanonicalChartResult,brand:string){
 if(!validPdfBrand(brand)||!chartIsComplete(chart))throw Error("PARTNER_CHART_PDF_INPUT_UNQUALIFIED");
 const pdf=await PDFDocument.create();
 pdf.setTitle(brand+" | Chart reference | Powered by Naksharix");
 pdf.setAuthor("Naksharix");
 pdf.setSubject("Private numerical chart reference; traditional framework, no predictive certification");
 pdf.setLanguage("en-IN");
 const regular=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold);
 const text=(page:PDFPage,value:string,x:number,y:number,maxWidth:number,size=11,font:PDFFont=regular,color=ink)=>{
  const actual=Math.min(size,size*maxWidth/Math.max(1,font.widthOfTextAtSize(value,size)));
  if(actual<8)throw Error("PARTNER_CHART_PDF_TEXT_OVERFLOW");
  page.drawText(value,{x,y,size:actual,font,color});
 };
 const paragraph=(page:PDFPage,value:string,x:number,y:number,width:number,size=10.5)=>{
  let line="",cursor=y;
  for(const word of value.split(/\s+/)){
   const proposal=line?line+" "+word:word;
   if(line&&regular.widthOfTextAtSize(proposal,size)>width){text(page,line,x,cursor,width,size,regular,muted);cursor-=size*1.5;line=word;}else line=proposal;
  }
  if(line){text(page,line,x,cursor,width,size,regular,muted);cursor-=size*1.5;}
  return cursor;
 };
 const base=(pageNumber:number,title:string)=>{
  const page=pdf.addPage([W,H]);
  page.drawRectangle({x:0,y:0,width:W,height:H,color:white});
  page.drawRectangle({x:0,y:H-124,width:W,height:124,color:wine});
  page.drawRectangle({x:0,y:H-128,width:W,height:4,color:gold});
  // Up to 80 approved ASCII characters, wrap the brand without losing its spelling.
  let line="",y=H-41;
  for(const word of brand.split(" ")){const proposal=line?line+" "+word:word;if(line&&bold.widthOfTextAtSize(proposal,17)>CW){text(page,line,M,y,CW,17,bold,white);y-=21;line=word;}else line=proposal;}
  if(line)text(page,line,M,y,CW,17,bold,white);
  text(page,title,M,H-101,CW,23,bold,white);
  page.drawLine({start:{x:M,y:47},end:{x:W-M,y:47},color:gold,thickness:.7});
  text(page,"PRIVATE REFERENCE  /  Powered by Naksharix",M,29,CW-70,9,bold,muted);
  text(page,pageNumber+" / 2",W-M-42,29,42,9,regular,muted);
  return page;
 };
 const p=base(1,"Birth chart reference");
 const b=chart.normalizedInput;
 text(p,"01  /  CALCULATION INPUT",M,H-158,CW,11,bold,wine);
 text(p,"Date: "+b.dateOfBirth+"   Time: "+b.timeOfBirth+"   UTC offset: "+String(b.timezone),M,H-181,CW,11);
 text(p,"Latitude: "+Number(b.latitude).toFixed(4)+"    Longitude: "+Number(b.longitude).toFixed(4),M,H-201,CW,11);
 text(p,"Lahiri sidereal / Whole-sign houses",M,H-222,CW,11,bold);
 text(p,"Ascendant: "+chart.ascendant.sign+"  "+degree(chart.ascendant.absoluteLongitude)+" deg",M,H-249,CW,12,bold,wine);
 text(p,"Moon: "+chart.moon.sign+"  |  "+chart.nakshatra.name+" / Pada "+chart.nakshatra.pada,M,H-269,CW,11);
 const col=[M+11,M+108,M+230,M+345,M+421];
 const headerY=H-305;
 p.drawRectangle({x:M,y:headerY-8,width:CW,height:28,color:wine});
 ["Planet","Sign","Longitude (deg)","House","Motion"].forEach((label,i)=>text(p,label,col[i],headerY,Math.max(45,(col[i+1]??W-M)-col[i]-7),10,bold,white));
 chart.planets.forEach((planet,i)=>{
  const y=headerY-28-i*31;
  if(i%2===0)p.drawRectangle({x:M,y:y-9,width:CW,height:31,color:pale});
  const row=[planet.planet,planet.sign!,degree(planet.absoluteLongitude),String(planet.house),planet.retrograde===true?"Retrograde":planet.retrograde===false?"Direct":"Not stated"];
  row.forEach((v,j)=>text(p,v,col[j],y,Math.max(45,(col[j+1]??W-M)-col[j]-7),10.5,j===0?bold:regular));
 });
 paragraph(p,"Numerical positions are internal calculations, not externally certified for this individual chart. Rahu uses the mean lunar node; Ketu is opposite Rahu. Sign labels near boundaries may be sensitive to method and birth-time precision.",M,H-639,CW);
 const p2=base(2,"Twelve-house overview");
 text(p2,"02  /  WHOLE-SIGN HOUSE MAP",M,H-158,CW,11,bold,wine);
 paragraph(p2,"The following grid shows the calculated sign and planet placement for each house. It does not claim to predict life outcomes.",M,H-180,CW);
 const gap=10,cellW=(CW-2*gap)/3,cellH=92,top=H-225;
 const houses=[...chart.houses!].sort((a,b)=>a.house-b.house);
 houses.forEach((house,i)=>{
  const x=M+(i%3)*(cellW+gap),y=top-Math.floor(i/3)*(cellH+gap)-cellH;
  p2.drawRectangle({x,y,width:cellW,height:cellH,color:pale,borderColor:gold,borderWidth:.55});
  text(p2,"HOUSE "+house.house,x+10,y+cellH-19,cellW-20,10,bold,wine);
  text(p2,house.sign!,x+10,y+cellH-40,cellW-20,14,bold);
  paragraph(p2,house.planets.length?house.planets.join(", "):"No planet listed",x+10,y+cellH-59,cellW-20,10);
 });
 text(p2,"03  /  SCOPE AND PRIVACY",M,H-659,CW,11,bold,wine);
 paragraph(p2,"Prepared for an authorized partner calculation. No personal name or contact information was requested. Astrology is a traditional interpretive framework, not a scientifically established prediction or substitute for medical, legal, financial or relationship decisions. Verify time, coordinates and calculation assumptions before use.",M,H-680,CW,10);
 const bytes=Buffer.from(await pdf.save({useObjectStreams:true}));
 if(bytes.length>128*1024||bytes.subarray(0,5).toString("ascii")!=="%PDF-")throw Error("PARTNER_CHART_PDF_SIZE_OR_FORMAT");
 return {mimeType:"application/pdf" as const,fileName:"naksharix-chart-reference.pdf",language:"en" as const,pages:2,byteLength:bytes.length,sha256:createHash("sha256").update(bytes).digest("hex"),pdfBase64:bytes.toString("base64"),scope:"Numerical chart reference; not a professional or predictive certification"};
}
