import "server-only";
import { ReportQualityError } from "./report-quality";
import { PDFDocument, StandardFonts, PDFOperator, PDFOperatorNames, PDFName, PDFHexString, rgb, type PDFPage,type PDFFont,type PDFEmbeddedPage,type RGB } from "pdf-lib";
import type { PremiumReportContentResult } from "@/lib/reports/premium-report-content-engine";
import type { EditorialCard,EditorialInsights } from "@/lib/reports/editorial-insights";
import type {DepthChapter} from "@/lib/reports/editorial-depth";
import {editorialTerm,editorialDate,EDITORIAL_HOUSE_TABLE_FRACTIONS} from "@/lib/reports/editorial-display";
import {planEditorialTableFragment,groupEditorialCardBodies} from "@/lib/reports/editorial-layout";

type R=Record<string,unknown>;
const obj=(v:unknown):R=>v!==null&&typeof v==="object"&&!Array.isArray(v)?v as R:{};
const list=(v:unknown):unknown[]=>Array.isArray(v)?v:[];
const records=(v:unknown):R[]=>list(v).map(obj);
const s=(v:unknown):string=>typeof v==="string"?v:typeof v==="number"?String(v):typeof v==="boolean"?(v?"Yes":"No"):Array.isArray(v)?v.map(s).join(", "):"";
const shown=(v:unknown)=>s(v)||"Not available";
const number=(v:unknown)=>typeof v==="number"&&Number.isFinite(v)?v:0;
const label=(v:string)=>v.replace(/([a-z])([A-Z])/g,"$1 $2").replace(/[-_]/g," ").replace(/^./,x=>x.toUpperCase());
const deg=(v:unknown)=>typeof v==="number"&&Number.isFinite(v)?v.toFixed(4)+"°":"-";
const clean=(v:string)=>v.normalize("NFC").replace(/[\r]/g,"").replace(/[–—−]/g,"-").replace(/[‘’′]/g,"'").replace(/[“”]/g,'"').replace(/\u00a0/g," ").replace(/[^\u0009\u000A\u0020-\u007E\u00A1-\u00FF\u0900-\u097F\u200C\u200D\u20B9]/gu,"?");
const C=(v:string)=>rgb(parseInt(v.slice(0,2),16)/255,parseInt(v.slice(2,4),16)/255,parseInt(v.slice(4,6),16)/255);
const W=595.28,H=841.89,M=44,CW=W-2*M,BOTTOM=H-66;
const iv=C("FFFDF7"),white=C("FFFFFF"),ink=C("201B29"),muted=C("594A60"),wine=C("240D3D"),accentPurple=C("34134C"),gold=C("C69A4D"),goldText=C("795526"),light=C("DCC9A6"),sand=C("F6ECD8"),green=C("4B255E"),glow=C("F1D08C"),pale=C("F8F1E4");
const shortPlanets:Record<string,string>={Sun:"Su",Moon:"Mo",Mars:"Ma",Mercury:"Me",Jupiter:"Ju",Venus:"Ve",Saturn:"Sa",Rahu:"Ra",Ketu:"Ke"};
const houseCoords=[[.5,.25],[.25,.087],[.087,.25],[.25,.5],[.087,.75],[.25,.91],[.5,.75],[.75,.91],[.913,.75],[.75,.5],[.913,.25],[.75,.087]];
type FontKind="body"|"bold"|"title";
export async function renderEditorialReport(pdf:PDFDocument,content:PremiumReportContentResult,request:{requestId:string;templateId:string;reportTitle?:string;customerName?:string;language?:"en"|"hi"|"hinglish"},fonts:{latin:PDFFont;indic:PDFFont;title?:PDFFont;indicTitle?:PDFFont;bold?:PDFFont;indicBold?:PDFFont},art:{cover:PDFEmbeddedPage;lotus:PDFEmbeddedPage}){
 const lang=request.language??"en",tr=(en:string,hi:string,hinglish=en)=>lang==="hi"?hi:lang==="hinglish"?hinglish:en;
 const term=(v:string)=>editorialTerm(v,lang),display=(v:unknown)=>term(shown(v));
 const date=(v:unknown)=>editorialDate(shown(v),lang);
 const field=(v:string)=>term(label(v));
 const serif=fonts.title??await pdf.embedFont(StandardFonts.TimesRoman),bold=fonts.bold??await pdf.embedFont(StandardFonts.HelveticaBold);
 const segmenter=new Intl.Segmenter("hi",{granularity:"grapheme"});
 const glyphs=(v:string)=>Array.from(segmenter.segment(clean(v)),x=>x.segment);
 function runs(v:string,kind:FontKind){
  const result:{font:PDFFont;text:string}[]=[];
  for(const part of glyphs(v)){const font=/[\u0900-\u097F\u200C\u200D\u20B9]/u.test(part)?(kind==="title"?fonts.indicTitle??fonts.indic:kind==="bold"?fonts.indicBold??fonts.indic:fonts.indic):kind==="title"?serif:kind==="bold"?bold:fonts.latin;
   const last=result[result.length-1];if(last?.font===font)last.text+=part;else result.push({font,text:part});
  }return result;
 }
 // Customer text is cached only for this render and never shared between requests.
 const widths=new Map<string,number>();
 function measure(v:string,size:number,kind:FontKind="body"){
  const key=kind+"|"+v;let unitWidth=widths.get(key);
  if(unitWidth===undefined){unitWidth=runs(v,kind).reduce((n,r)=>n+r.font.widthOfTextAtSize(r.text,1),0);widths.set(key,unitWidth);}
  return unitWidth*size;
 }
 function wrap(v:string,width:number,size:number,kind:FontKind="body"):string[]{
  const out:string[]=[];
  for(const para of clean(v).split("\n")){
   let line="";
   for(const word of para.trim().split(/\s+/).filter(Boolean)){
    const proposal=line?line+" "+word:word;
    if(measure(proposal,size,kind)<=width){line=proposal;continue;}
    if(line){out.push(line);line="";}
    if(measure(word,size,kind)<=width){line=word;continue;}
    for(const ch of glyphs(word)){if(line&&measure(line+ch,size,kind)>width){out.push(line);line="";}line+=ch;}
   }
   out.push(line);
  }return out.length?out:[""];
 }
 let page:PDFPage,y=0,chapter="",heading="";
 const starts:{title:string;page:number}[]=[];
 const section=(key:string)=>content.sections.find(x=>x.key===key);
 const data=(key:string)=>section(key)?.data;
 const birth=obj(data("birth"));
 const dateNameOnly=birth.calculationBasis==="date_name_only";
 if(request.customerName!==undefined && request.customerName.normalize("NFC")!==s(birth.name).normalize("NFC"))throw new ReportQualityError("REPORT_CUSTOMER_IDENTITY_MISMATCH");
 if(dateNameOnly && !["numerology-lo-shu-report","name-correction-report"].includes(request.templateId))throw new ReportQualityError("REPORT_CALCULATION_BASIS_MISMATCH");
 // Preserve supported identities and user wording. Unknown scripts require a
 // reviewed font/script path, not a PDF in which the customer's name is "??".
 const partner=obj(data("partner")),partnerBirth=obj(partner.birth),question=obj(data("your-question"));
 const customerFields=[birth.name,birth.birthPlace,birth.romanName,partner.name,partnerBirth.birthPlace,question.submittedQuestion];
 const latinCharacters=new Set(fonts.latin.getCharacterSet());
 const indicCharacters=new Set(fonts.indic.getCharacterSet());
 for(const value of customerFields){
  if(typeof value!=="string")continue;
  const printable=clean(value.replace(/\?/g,""));
  if(printable.includes("?") || Array.from(printable).some(char=>{
    const code=char.codePointAt(0)!;
    return !/\s/u.test(char) && !latinCharacters.has(code) && !indicCharacters.has(code);
  }))throw new ReportQualityError("REPORT_CUSTOMER_SCRIPT_REVIEW_REQUIRED");
 }
 const insights=obj(data("editorial-insights")) as unknown as EditorialInsights;
 if(!birth.name||!insights.overview||!Array.isArray(insights.cards)||!Array.isArray(insights.plan))throw new ReportQualityError("REPORT_EDITORIAL_CONTENT_INCOMPLETE");
 function rect(x:number,top:number,w:number,h:number,color:RGB,border?:RGB){page.drawRectangle({x,y:H-top-h,width:w,height:h,color,...(border?{borderColor:border,borderWidth:.65}:{})})}
 function rule(x:number,top:number,x2:number,top2:number,color:RGB=light,width=.7){page.drawLine({start:{x,y:H-top},end:{x:x2,y:H-top2},color,thickness:width})}
 function tx(x:number,top:number,v:string,size=10,kind:FontKind="body",color:RGB=ink,align:"left"|"center"|"right"="left"){
  let dx=x-(align==="center"?measure(v,size,kind)/2:align==="right"?measure(v,size,kind):0);
  // Shaping changes glyph order for some Indic clusters. Preserve the logical
  // source string for selection, search and assistive PDF consumers.
  const indic=/[\u0900-\u097f]/u.test(v);
  if(indic)page.pushOperators(PDFOperator.of(PDFOperatorNames.BeginMarkedContentSequence,[
   PDFName.of("Span"),"<< /ActualText "+PDFHexString.fromText(v).toString()+" >>"
  ]));
  for(const r of runs(v,kind)){if(r.text)page.drawText(r.text,{x:dx,y:H-top-size,font:r.font,size,color});dx+=r.font.widthOfTextAtSize(r.text,size);}
  if(indic)page.pushOperators(PDFOperator.of(PDFOperatorNames.EndMarkedContent));
 }
 function fixed(x:number,top:number,v:string,width:number,size=10.5,kind:FontKind="body",color:RGB=ink,leading=size*1.45,align:"left"|"center"="left"){
  const ls=wrap(v,width,size,kind);ls.forEach((line,i)=>tx(align==="center"?x+width/2:x,top+i*leading,line,size,kind,color,align));return ls.length*leading;
 }
 const caps=(x:number,top:number,v:string,color:RGB=goldText,size=8.6,align:"left"|"center"|"right"="left")=>tx(x,top,v.toUpperCase(),size,"bold",color,align);
 function brand(top:number){
  page.drawPage(art.lotus,{x:M,y:H-top-21,width:30,height:21});
  tx(M+36,top+2,"NAKSHARIX",11,"title",wine);
 }
 function interior(kicker:string,title:string,sub="",continuation=false){
  kicker=term(kicker);chapter=kicker;heading=title;page=pdf.addPage([W,H]);rect(0,0,W,H,iv);brand(24);
  caps(W-M,32,tr("PRIVATE REPORT","निजी रिपोर्ट","NIJI REPORT"),muted,8,"right");rule(M,68,W-M,68,gold,1);
  if(!continuation)starts.push({title,page:pdf.getPageCount()});
  caps(M,84,kicker);y=102+fixed(M,102,title+(continuation?tr(" (continued)"," (जारी)"):""),CW,25,"title",wine,30)+8;
  if(sub)y+=fixed(M,y,sub,CW,10.1,"body",muted,14.7)+15;
 }
 let firstSpecialist=true;
 function specialist(kicker:string,title:string,minBody=145){
  kicker=term(kicker);
  const headingHeight=wrap(title,CW,18,"title").length*22+43;
  if(firstSpecialist||y+headingHeight+minBody>BOTTOM){firstSpecialist=false;interior(kicker,title);return}
  chapter=kicker;heading=title;starts.push({title,page:pdf.getPageCount()});rule(M,y+2,W-M,y+2,gold,.65);y+=14;caps(M,y,kicker, goldText,8);y+=15;
  y+=fixed(M,y,title,CW,18,"title",wine,22)+13;
 }
 function kundliChapter(kicker:string,title:string,intro:string){
  // Reuse an otherwise sparse continuation page when the next opening
  // paragraph and its chart or table can be kept together.
  if(y<420){
   firstSpecialist=false;
   specialist(kicker,title,300);
   paragraph(intro,10.1,muted,"body",12);
  }else interior(kicker,title,intro);
 }
 function ensure(h:number){if(h>BOTTOM-160)throw new ReportQualityError("REPORT_EDITORIAL_BLOCK_TOO_TALL");if(y+h>BOTTOM)interior(chapter,heading,"",true)}
 function paragraph(v:string,size=13.2,color:RGB=ink,kind:FontKind="body",after=10){const ls=wrap(v,CW,size,kind);for(const line of ls){ensure(size*1.58);tx(M,y,line,size,kind,color);y+=size*1.58;}y+=after}
 function subhead(v:string){ensure(32);caps(M,y,v);y+=22}
 function note(v:string){if(!v)return;const ls=wrap(v,CW-24,9.1),height=ls.length*13+22;if(height>290){paragraph(v,9.1,muted);return;}ensure(height);rect(M,y,CW,height,sand);fixed(M+12,y+10,v,CW-24,9.1,"body",muted,13);y+=height+12}
 function cardRows(cards:EditorialCard[],columns=2,accent=false){
  const gap=13,w=(CW-(columns-1)*gap)/columns;
  for(let i=0;i<cards.length;i+=columns){
   const batch=cards.slice(i,i+columns);
   const heights=batch.map(c=>12+wrap(c.label,w-26,8,"bold").length*11+8+wrap(c.title,w-26,16,"title").length*20+8+wrap(c.body,w-26,13.2).length*20.86+14);
   const h=Math.max(...heights,94);
   if(h>BOTTOM-160){for(const c of batch){subhead(c.label);paragraph(c.title,16,wine,"title",4);paragraph(c.body);}continue;}
   ensure(h+11);
   batch.forEach((c,j)=>{const x=M+j*(w+gap);rect(x,y,w,h,accent?accentPurple:white,accent?undefined:light);let top=y+13;top+=fixed(x+13,top,c.label.toUpperCase(),w-26,8,"bold",accent?glow:goldText,11)+8;top+=fixed(x+13,top,c.title,w-26,16,"title",accent?iv:wine,20)+8;fixed(x+13,top,c.body,w-26,13.2,"body",accent?iv:ink,20.86)});
   y+=h+13;
  }
 }
 function table(headers:string[],rows:string[][],fractions:number[],size=9.4,minHeight=30,cellPadding=9){
  if(!rows.length)return;
  headers=headers.map(term);
  const sum=fractions.reduce((a,b)=>a+b,0),widths=fractions.map(f=>CW*f/sum),lineHeight=size*1.45;
  const headerHeight=Math.max(...headers.map((v,i)=>wrap(v.toUpperCase(),widths[i]-2*cellPadding,8,"bold").length*11))+17;
  const prepared=rows.map(row=>row.map((v,j)=>wrap(v,widths[j]-2*cellPadding,size,j===0?"bold":"body")));
  const continuationTop=()=>102+wrap(heading+tr(" (continued)"," (जारी)"),CW,25,"title").length*30+8;
  const freshHeight=()=>BOTTOM-continuationTop()-headerHeight;
  const header=()=>{rect(M,y,CW,headerHeight,accentPurple);let x=M;headers.forEach((v,i)=>{fixed(x+cellPadding,y+8,v.toUpperCase(),widths[i]-2*cellPadding,8,"bold",iv,11);x+=widths[i]});y+=headerHeight;};
  const firstLines=Math.max(...prepared[0].map(v=>v.length)),firstHeight=Math.max(minHeight,firstLines*lineHeight+16);
  const reserve=firstHeight<=freshHeight()?firstHeight:Math.max(minHeight,lineHeight+16);
  if(y+headerHeight+reserve>BOTTOM)interior(chapter,heading,"",true);
  header();let i=0;
  for(const columns of prepared){
   let consumed=0;const max=Math.max(...columns.map(v=>v.length));
   while(consumed<max){
    const fragment=planEditorialTableFragment(max-consumed,BOTTOM-y,freshHeight(),lineHeight,minHeight);
    if(fragment.kind==="page_break"){
     interior(chapter,heading,"",true);header();continue;
    }
    const take=fragment.lines,h=fragment.height;
    rect(M,y,CW,h,i%2===0?white:C("F7F0E4"));let x=M;
    columns.forEach((lines,j)=>{lines.slice(consumed,consumed+take).forEach((v,k)=>tx(x+cellPadding,y+8+k*lineHeight,v,size,j===0?"bold":"body",j===0?wine:ink));x+=widths[j]});
    y+=h;consumed+=take;
   }i++;
  }rule(M,y,W-M,y,gold);y+=16;
 }
 function tiles(values:{label:string;value:string;sub?:string}[]){
  values=values.map(v=>({...v,label:term(v.label),value:term(v.value)}));
  const n=values.length,w=(CW-(n-1)*10)/n;
  const sizes=values.map(v=>v.value.length>18?13:v.value.length>12?16:21);
  const height=Math.max(89,...values.map((v,i)=>wrap(v.label.toUpperCase(),w-20,8,"bold").length*11+wrap(v.value,w-20,sizes[i],"title").length*(sizes[i]+4)+wrap(v.sub??"",w-20,8.5).length*12+30));
  ensure(height+13);
  values.forEach((v,i)=>{const x=M+i*(w+10);rect(x,y,w,height,white,light);let t=y+11;t+=fixed(x+10,t,v.label.toUpperCase(),w-20,8,"bold",goldText,11)+9;t+=fixed(x+10,t,v.value,w-20,sizes[i],"title",wine,sizes[i]+4)+8;if(v.sub)fixed(x+10,t,v.sub,w-20,8.5,"body",muted,12)});
  y+=height+16;
 }
 function motionLabel(r:R){return r.motionState==="near_station"?term("Near station"):r.retrograde===true?term("Retrograde"):r.retrograde===false?term("Direct"):tr("Unavailable","उपलब्ध नहीं","Available nahi")}
 function planetTable(rows:R[]){if(!rows.length)return;table(["Graha",tr("Sign","राशि"),tr("House","भाव"),tr("Degree","अंश"),tr("Nakshatra","नक्षत्र"),tr("Motion","गति")],rows.map(r=>[display(r.planet),display(r.sign),shown(r.house),deg(r.degree),display(r.nakshatra),motionLabel(r)]),[1,1.05,.55,.8,1.4,1.05],9.2,33)}
 function houseTable(rows:R[]){if(!rows.length)return;table([tr("House","भाव"),tr("Sign","राशि"),tr("Planets","ग्रह"),tr("Reflection theme","चिंतन विषय")],rows.map(r=>[shown(r.house),display(r.sign),list(r.planets).map(p=>term(typeof p==="string"?p:s(obj(p).planet))).join(", ")||"-",s(r.title)+"\n"+s(r.compact??r.interpretation)]),[...EDITORIAL_HOUSE_TABLE_FRACTIONS],8.5,36)}
 function chart(x:number,top:number,size:number,houses:R[]){
  rect(x,top,size,size,white,gold);
  const shade=(poly:number[][],col:RGB)=>{const p=poly.map(([a,b],i)=>(i?"L":"M")+" "+(a*size)+" "+(b*size)).join(" ")+" Z";page.drawSvgPath(p,{x,y:H-top,color:col});};
  shade([[.5,0],[.75,.25],[.5,.5],[.25,.25]],sand);shade([[.5,.5],[.75,.25],[1,.5],[.75,.75]],pale);
  for(const [a,b,c,d] of [[0,0,1,1],[0,1,1,0],[.5,0,1,.5],[1,.5,.5,1],[.5,1,0,.5],[0,.5,.5,0]])rule(x+a*size,top+b*size,x+c*size,top+d*size,gold,.75);
  for(let i=0;i<12;i++){const h=houses.find(r=>number(r.house)===i+1);const [a,b]=houseCoords[i];const cx=x+a*size,cy=top+b*size;const ps=list(h?.planets).map(p=>typeof p==="string"?p:s(obj(p).planet)).map(p=>shortPlanets[p]??p.slice(0,2));tx(cx,cy-10,String(i+1)+" "+s(h?.sign).slice(0,3),7.4,"bold",muted,"center");const groups=[];for(let j=0;j<ps.length;j+=3)groups.push(ps.slice(j,j+3).join(" "));(groups.length?groups:["-"]).forEach((v,j)=>tx(cx,cy+1+j*8,v,8.2,"bold",wine,"center"))}
 }
 function charts(a:R[],b:R[],aLabel:string,bLabel:string){if(a.length!==12||b.length!==12)throw new ReportQualityError("REPORT_CHART_HOUSES_INCOMPLETE");const size=(CW-22)/2-6;ensure(size+94);caps(M,y,term(aLabel));caps(M+CW/2+11,y,term(bLabel));y+=18;tx(M,y,display(a.find(r=>number(r.house)===1)?.sign)+" "+tr("ascendant","लग्न","lagna"),14,"title",wine);tx(M+CW/2+11,y,display(b.find(r=>number(r.house)===1)?.sign)+" "+tr("ascendant","लग्न","lagna"),14,"title",wine);y+=23;chart(M+3,y,size,a);chart(M+CW/2+14,y,size,b);y+=size+15;paragraph(Object.entries(shortPlanets).map(([planet,code])=>code+" "+term(planet)).join(" · ")+".",9,muted)}
 function periodCards(d:R){
  const a=obj(d.currentMajor??d.major),b=obj(d.currentSubPeriod??d.sub);
  const make=(r:R,k:string)=>({label:term(k),title:display(r.planet),body:r.planet?date(r.startsAt)+" - "+date(r.endsAt):tr("No active period available.","वर्तमान दशा उपलब्ध नहीं।")});
  cardRows([make(a,tr("Current Mahadasha","वर्तमान महादशा")),make(b,tr("Current Antardasha","वर्तमान अंतर्दशा"))],2,true);
  const boundary=(r:R,field:"startsAt"|"endsAt")=>Date.parse(s(r[field+"Utc"])||s(r[field]));
  const rows=records(a.antardashas),from=boundary(a,"startsAt"),until=boundary(a,"endsAt"),now=Date.parse(s(d.asOf)||s(birth.generatedOn));
  if(rows.length&&Number.isFinite(from)&&until>from){
   subhead(tr("Mahadasha / sub-period timeline","महादशा / उप-अवधि समयरेखा"));ensure(56);
   for(const [i,r] of rows.entries()){const x=M+CW*Math.max(0,(boundary(r,"startsAt")-from)/(until-from)),end=M+CW*Math.min(1,(boundary(r,"endsAt")-from)/(until-from));if(end<=x)continue;const current=now>=boundary(r,"startsAt")&&now<boundary(r,"endsAt");rect(x,y,end-x,23,current?green:[gold,sand,pale,C("B8ADA4")][i%4]);if(end-x>25)tx((x+end)/2,y+6,s(r.planet).slice(0,3),8,"bold",current?iv:ink,"center");}
   if(now>=from&&now<until){const x=M+CW*(now-from)/(until-from);rule(x,y-4,x,y+31,wine,1.4);caps(x,y+32,term("NOW"),wine,7,"center")}
   tx(M,y+26,s(a.startsAt).slice(0,4),8,"body",muted);tx(W-M,y+26,s(a.endsAt).slice(0,4),8,"body",muted,"right");y+=55;
   table([tr("Sub-period","उप-अवधि"),tr("From","से"),tr("To","तक"),tr("Status","स्थिति")],rows.map(r=>[display(r.planet),date(r.startsAt),date(r.endsAt),term(now>=boundary(r,"startsAt")&&now<boundary(r,"endsAt")?"Current":now>=boundary(r,"endsAt")?"Past":"Upcoming")]),[1,1.2,1.2,.8],9.2,25)
  }
  if(records(d.periods).length){
   subhead(tr("Full Mahadasha sequence","पूर्ण महादशा क्रम","Full Mahadasha sequence"));
   table([tr("Mahadasha","महादशा"),tr("From (UTC date)","से (UTC तिथि)"),tr("To (UTC date)","तक (UTC तिथि)"),tr("Years","वर्ष")],records(d.periods).map(r=>[display(r.planet),date(r.startsAt),date(r.endsAt),shown(r.durationYears)]),[1,1.2,1.2,.65],9.2,25);
   if(d.birthBalanceYears!=null)paragraph(tr("Remaining major-period years at birth: ","जन्म पर शेष महादशा वर्ष: ","Birth par remaining major-period years: ")+shown(d.birthBalanceYears),9,muted);
  }
  const upcoming=records(d.nextTwelveMonths);
  if(upcoming.length){
   subhead(tr("Antardasha intervals overlapping the next 12 months","अगले 12 माह से जुड़ी अंतर्दशा अवधियाँ","Next 12 months se judi Antardasha intervals"));
   table([tr("Major / sub","महादशा / अंतर्दशा"),tr("Start UTC","आरंभ UTC"),tr("End UTC","समाप्ति UTC")],upcoming.map(r=>[display(r.major)+" / "+display(r.planet),shown(r.startsAtUtc),shown(r.endsAtUtc)]),[1.1,1.55,1.55],8.9,30);
   paragraph(tr("Intervals retain their actual calculated boundaries, even when they start before today or extend beyond the 12-month horizon. They are not predicted life events.","अवधियों की वास्तविक गणना सीमाएँ बनी रहती हैं, भले ही आरंभ आज से पहले हो या अंत 12 माह के बाद हो। ये जीवन घटनाओं की भविष्यवाणियाँ नहीं हैं।","Actual calculated boundaries retain hoti hain, chahe start aaj se pehle ya end 12 months se baad ho. Yeh life event predictions nahi hain."),9,muted);
  }
  const pratyantar=records(d.pratyantarWindow);
  if(pratyantar.length){
   subhead(tr("Pratyantar periods overlapping the next 12 months","अगले 12 माह की प्रत्यंतर दशाएँ","Next 12 months ki pratyantar dasha"));
   table([tr("Major / sub / third","महा / अंतर / प्रत्यंतर","Maha / antar / pratyantar"),tr("Start UTC","आरंभ UTC"),tr("End UTC","समाप्ति UTC")],pratyantar.map(r=>[display(r.mahadashaLord)+" / "+display(r.antardashaLord)+" / "+display(r.lord),shown(r.startsAt),shown(r.endsAt)]),[1.35,1.35,1.35],8.6,28);
   paragraph(tr("Exact calculated third-level boundaries are shown for the named fixed-year convention. Selection does not reset a parent period; these intervals do not predict events.","निर्धारित वर्ष पद्धति की गणना से प्रत्यंतर की सीमाएँ दी गई हैं। अवधि चुनने से मूल दशा दोबारा आरंभ नहीं होती। ये घटनाओं की भविष्यवाणी नहीं हैं।","Named fixed-year method ki calculated boundaries hain; window selection parent dasha ko restart nahi karta. Yeh event predictions nahi hain."),9,muted);
  }
  const allSub=records(d.allAntardashas);
  if(allSub.length){
   subhead(tr("Full modeled Antardasha chronology","संपूर्ण गणितीय अंतर्दशा क्रम","Full modeled Antardasha sequence"));
   paragraph(tr("These are mathematical periods beginning at birth, not a lifespan estimate. The first elapsed parent is not restarted.","ये जन्म से आरंभ गणितीय अवधियाँ हैं, आयु का अनुमान नहीं। पहली बीती मूल दशा फिर से शुरू नहीं होती।","Yeh birth se modeled periods hain, lifespan estimate nahi. Pehli elapsed dasha reset nahi hoti."),9,muted);
   table([tr("Major / sub","महा / अंतर","Maha / antar"),tr("Start UTC","आरंभ UTC"),tr("End UTC","समाप्ति UTC")],allSub.map(r=>[display(r.major)+" / "+display(r.planet),shown(r.startsAtUtc),shown(r.endsAtUtc)]),[1.25,1.4,1.4],8.5,23);
  }
 }
 function numCard(r:R,k:string){return {label:term(s(r.label)||k),title:shown(r.value)+" / "+s(r.meaning),body:[s(r.guidance),s(r.strengths)?tr("Strength themes: ","गुण विषय: ")+s(r.strengths):"",s(r.growthAreas)?tr("Reflection areas: ","चिंतन क्षेत्र: ")+s(r.growthAreas):""].filter(Boolean).join("\n")}}
 function loShu(grid:R[]){if(grid.length!==9)return;subhead("LO SHU / "+tr("BIRTH-DATE DIGITS","जन्म तिथि के अंक"));const z=76,gap=5,gw=3*z+2*gap;ensure(3*z+2*gap+20);
  [4,9,2,3,5,7,8,1,6].forEach((n,i)=>{const g=grid.find(r=>number(r.number)===n),ct=number(g?.count),x=M+i%3*(z+gap),t=y+Math.floor(i/3)*(z+gap);rect(x,t,z,z,ct?green:sand);caps(x+9,t+7,String(n),ct?glow:muted,8);tx(x+z/2,t+25,ct?String(n).repeat(Math.min(ct,10)):"-",ct>4?12:22,"title",ct?iv:muted,"center");tx(x+z/2,t+57,ct?"x "+ct:tr("Not present","अनुपस्थित"),8.1,"body",ct?iv:muted,"center")});
  const present=grid.filter(r=>number(r.count)>0).map(r=>s(r.number)),absent=grid.filter(r=>!number(r.count)).map(r=>s(r.number));let t=y+6;const x=M+gw+20,w=CW-gw-20;caps(x,t,tr("Present digits","उपस्थित अंक"));t+=17;t+=fixed(x,t,present.join(" · ")||"-",w,21,"title",wine,24)+12;caps(x,t,tr("Not present","अनुपस्थित"));t+=16;t+=fixed(x,t,absent.join(" · ")||"-",w,17,"title",wine,21)+12;fixed(x,t,tr("Absent digits are not deficiencies. This is a symbolic tradition, not a measure of ability.","अनुपस्थित अंक किसी कमी का प्रमाण नहीं हैं। यह प्रतीकात्मक परंपरा है, क्षमता का माप नहीं।"),w,10,"body",muted,14.5);y+=gw+20;
 }
 function doshaCard(r:R,title:string):EditorialCard{const reference=["marsHouseFromLagna","marsHouseFromMoon","marsHouseFromVenus"].filter(k=>r[k]!=null).map(k=>field(k)+": "+s(r[k])).join(" · ");return {label:term(title),title:r.available===false?term("Not available"):r.present===true?(term(s(r.severity))||tr("Rule detected","नियम पाया गया","Niyam mila")):term("Not clearly detected"),body:[s(r.summary),reference,s(r.remedies)].filter(Boolean).join("\n")}}
 function dosha(r:R,title:string){if(Object.keys(r).length)cardRows([doshaCard(r,title)],1)}
 function panchangGrid(r:R){
  const fields=["tithi","paksha","vaar","yoga","karan","nakshatra","sunrise","sunset"];
  for(let i=0;i<fields.length;i+=4){const batch=fields.slice(i,i+4),w=CW/4;const heights=batch.map(k=>wrap(shown(r[k]),w-18,10,"bold").length*13+30);const height=Math.max(48,...heights);ensure(height);batch.forEach((k,j)=>{const x=M+j*w;rect(x,y,w-5,height-5,white,light);caps(x+8,y+8,field(k),goldText,8);fixed(x+8,y+23,shown(r[k]),w-18,10,"bold",ink,13)});y+=height}
  const others=["rahuKaal","choghadiya","muhurat"].map(k=>field(k)+": "+display(r[k]));paragraph(others.join(" · "),8.7,muted);
 }
 function snapshots(v:unknown){
  const rows=records(v);if(!rows.length)return;
  const flat=rows.flatMap(r=>Array.isArray(r.positions)?records(r.positions).map(p=>({...p,date:r.date})): [r]);
  if(!flat.length)return;
  const planets=[...new Set(flat.map(r=>s(r.planet)))];
  if(planets.length>1&&rows.some(r=>Array.isArray(r.positions))){
   table([tr("Date","तिथि"),...planets.map(term)],rows.map(r=>[date(r.date),...planets.map(p=>{const a=records(r.positions).find(t=>t.planet===p);return a?(lang==="hi"?display(a.sign):s(a.sign).slice(0,3))+" / "+deg(a.degree)+"\nH"+s(a.houseFromMoon)+(a.motionState==="near_station"?" S":a.retrograde===true?" R":a.retrograde===false?"":" ?"):"-"})]),[1.15,...planets.map(()=>1)],8.2,32,4);
   paragraph(tr("H = house from natal Moon; R = retrograde; S = near station; ? = unavailable. Motion is estimated at the snapshot, not an exact station prediction.","H = जन्म चंद्र से भाव; R = वक्री; S = स्थिरता के निकट; ? = अनुपलब्ध। गति उस समय का अनुमान है, सटीक स्थिरता की भविष्यवाणी नहीं।"),9,muted);
  }else table([tr("Date","तिथि"),"Graha / sign","Degree",tr("From Moon","चंद्र से"),tr("From Lagna","लग्न से"),tr("Phase / motion","चरण / गति")],flat.map(r=>[date(r.date),display(r.planet)+" / "+display(r.sign),deg(r.degree),shown(r.houseFromMoon),shown(r.houseFromAscendant),s(r.traditionalPhase)?term(s(r.traditionalPhase)):motionLabel(r)]),[1.05,1.15,.85,.75,.75,1.6],8.7,30);
 }
 function reflectionPlan(){
  const kicker=tr("REFLECTION PLAN","चिंतन योजना","CHINTAN YOJANA"),title=tr("Turn insight into action","चिंतन को कार्य में बदलें","Chintan se vyavaharik kadam"),intro=tr("Use this report as a structured reflection exercise, not a directive for major decisions.","इसे चिंतन के साधन की तरह उपयोग करें, बड़े निर्णयों के निर्देश की तरह नहीं।","Is report ko chintan ke liye use karein, bade decisions ka nirdesh na samjhein.");
  // Avoid leaving a nearly empty specialist continuation page immediately
  // before the reflection plan. Preserve dedicated Kundli chapters and keep
  // the original typography, margins and measured block pagination.
  if(request.templateId!=="premium-kundli"&&y<325&&insights.plan.length){
   const p=insights.plan[0],firstHeight=44+wrap(p.title,CW-35,16,"title").length*19+wrap(p.body,CW-35,10).length*14;
   if(firstHeight<=250&&y+wrap(title,CW,18,"title").length*22+43+wrap(intro,CW,10.1).length*15.2+12+firstHeight+10<=BOTTOM){
    specialist(kicker,title,firstHeight+wrap(intro,CW,10.1).length*15.2+22);
    paragraph(intro,10.1,muted,"body",12);
   }else interior(kicker,title,intro);
  }else interior(kicker,title,intro);
  for(const [i,p] of insights.plan.entries()){
   const titleLines=wrap(p.title,CW-35,16,"title"),bodyLines=wrap(p.body,CW-35,10);
   const height=32+titleLines.length*19+bodyLines.length*14+12;
   if(height>250){cardRows([p],1);continue}
   ensure(height+10);rect(M,y,CW,height,white,light);rect(M,y,5,height,i===1?green:gold);
   caps(M+17,y+9,p.label,goldText,8);fixed(M+17,y+24,p.title,CW-35,16,"title",wine,19);
   fixed(M+17,y+24+titleLines.length*19+4,p.body,CW-35,10,"body",ink,14);y+=height+10;
  }
  const q=obj(data("your-question"));if(s(q.submittedQuestion)){subhead(tr("Your submitted question","आपका प्रश्न"));paragraph(s(q.submittedQuestion),10,muted,"body",5)}
  subhead(insights.question.label);paragraph(insights.question.title,14,wine,"title",5);paragraph(insights.question.body,10,ink,"body",8);
  note(s(data("trust")));
 }
 // The approved ornament, celestial lotus and wheel contain no text or customer data.
 page=pdf.addPage([W,H]);page.drawPage(art.cover,{x:0,y:0,width:W,height:H});
 const title=request.reportTitle??label(request.templateId);
 const name=s(birth.name),place=s(birth.birthPlace),cx=W/2;
 const birthLine=dateNameOnly?date(birth.dateOfBirth):date(birth.dateOfBirth)+" | "+shown(birth.timeOfBirth)+" (UTC "+(number(birth.utcOffsetAtBirth)>=0?"+":"")+s(birth.utcOffsetAtBirth)+")";
 tx(cx,137,"NAKSHARIX",23,"title",glow,"center");
 tx(cx,174,tr("Astrology · Numerology · Personal study","ज्योतिष · अंक शास्त्र · व्यक्तिगत अध्ययन","Jyotish · Ank shastra · Vyaktigat adhyayan"),10,"body",glow,"center");
 let titleSize=30;
 while(titleSize>15 && wrap(title,CW-30,titleSize,"title").length*titleSize*1.24>66)titleSize-=1;
 const titleHeight=fixed(M+15,493,title,CW-30,titleSize,"title",iv,titleSize*1.24,"center");
 fixed(M+30,501+titleHeight,tr("Royal Edition","रॉयल संस्करण","Royal Edition"),CW-60,14,"body",glow,18,"center");
 tx(cx,597,tr("Prepared for","विशेष रूप से तैयार","Khaas taur par taiyar"),10.5,"body",glow,"center");
 const personalWidth=325,nameSize=measure(name,18,"title")<=personalWidth?18:13;
 const detail=[birthLine,place].filter(Boolean).join(" · ");
 const profileContinuation=wrap(name,personalWidth,nameSize,"title").length>1 || wrap(detail,personalWidth,10).length>2;
 if(profileContinuation){
  fixed(cx-personalWidth/2,622,tr("Full customer details in the profile chapter","पूरा नाम और जन्म विवरण परिचय अध्याय में हैं","Poora naam aur janm vivaran profile mein hain"),personalWidth,13,"body",iv,18,"center");
 }else{
  tx(cx,618,name,nameSize,"title",iv,"center");
  fixed(cx-personalWidth/2,646,detail,personalWidth,10,"body",glow,13,"center");
 }
 tx(cx,745,date(birth.generatedOn)+" · "+tr("Private Royal Edition","निजी रॉयल संस्करण","Niji Royal Edition"),9,"body",glow,"center");
 fixed(M+24,765,"Ref: "+request.requestId,CW-48,8,"body",iv,11,"center");

 const contentsPage=pdf.addPage([W,H]);
 if(dateNameOnly){
  interior(tr("YOUR PROFILE","आपकी प्रोफ़ाइल","Aapki profile"),tr("Your name and birth date","आपका नाम और जन्म तिथि","Aapka naam aur janm tithi"));
 }else{
 interior(tr("01 / YOUR PROFILE","01 / आपकी प्रोफ़ाइल","01 / AAPKI PROFILE"),tr("Your chart at a glance","आपकी कुंडली एक नज़र में","Aapki kundli ek nazar mein"),tr("A clear reading of the calculated birth chart, before the detailed tables.","विस्तृत गणनाओं से पहले जन्म कुंडली का संक्षिप्त परिचय।","Detailed tables se pehle ganit se bani janm kundli ka sankshipt parichay."));
 }
 if(profileContinuation){
  subhead(tr("Private birth details","निजी जन्म विवरण","Private janm vivaran"));
  paragraph(name,12,wine,"bold",5);paragraph(birthLine,10,ink,"body",5);paragraph(place,10,ink,"body",12);
 }
 if(!dateNameOnly)tiles([{label:"Lagna",value:shown(birth.ascendant)},{label:"Moon sign",value:shown(birth.moonSign)},{label:"Nakshatra",value:shown(birth.nakshatra),sub:birth.pada?term("Pada")+" "+s(birth.pada):""},{label:"Sun sign",value:shown(birth.sunSign)}]);
 cardRows([insights.overview],1,true);cardRows(insights.cards,2);
 if(dateNameOnly){
  interior(tr("CALCULATION RECORD","गणना विवरण","Calculation record"),tr("Name and date calculation method","नाम और तिथि की गणना विधि","Naam aur tithi ki calculation method"));
  table([tr("Parameter","विवरण"),tr("Confirmed input or method","पुष्ट विवरण या विधि","Confirmed input ya method")],[
   [tr("Birth date","जन्म तिथि","Janm tithi"),date(birth.dateOfBirth)],
   [tr("Confirmed Roman spelling","पुष्ट रोमन वर्तनी","Confirmed Roman spelling"),shown(birth.romanName)],
   [tr("Name method","नाम पद्धति","Naam method"),tr("Pythagorean A–Z; vowels A E I O U; master numbers 11, 22 and 33 retained.","पाइथागोरियन A–Z; स्वर A E I O U; 11, 22 और 33 मास्टर अंक सुरक्षित।","Pythagorean A–Z; vowels A E I O U; master numbers 11, 22 aur 33 retained.")],
   ...(request.templateId==="name-correction-report"?[[tr("Comparison method","तुलना विधि","Comparison method"),tr("Chaldean letter values 1–8; compound spelling total and single-digit root.","कैल्डियन अक्षर मान 1–8; वर्तनी का कुल योग और एकल मूल अंक।","Chaldean letter values 1–8; spelling ka total aur single-digit root.")]]:[]),
   [tr("Calendar cycles","कैलेंडर चक्र","Calendar cycles"),tr("January–December, reduced to a single digit.","जनवरी से दिसंबर तक, एक अंक में समापन।","January se December, single digit reduction.")]
  ],[1.4,2.6],11,29);
 }else{
 interior(tr("CALCULATION RECORD","गणना विवरण","Calculation record"),tr("Birth data and calculation method","जन्म विवरण और गणना विधि","Birth data aur calculation method"),tr("The reference record keeps the exact birth instant and the selected calculation conventions separate from interpretation.","इस गणना रिकॉर्ड में सटीक जन्म समय और चुनी गई विधि को व्याख्या से अलग रखा गया है।","Reference record exact birth instant aur calculation method ko interpretation se alag rakhta hai."));
 table([tr("Parameter","विवरण"),tr("Actual input or calculation","वास्तविक विवरण या गणना")],[[tr("UTC birth instant","UTC जन्म समय"),shown(birth.utcBirthInstant)],[tr("Latitude / longitude","अक्षांश / देशांतर"),shown(birth.latitude)+" / "+shown(birth.longitude)],[tr("Birth UTC offset","जन्म का UTC अंतर"),shown(birth.utcOffsetAtBirth)],[tr("Ayanamsha","अयनांश"),shown(birth.ayanamsa)+" / "+deg(birth.ayanamsaDegree)],[tr("Ascendant longitude","लग्न देशांतर"),deg(birth.ascendantLongitude)],[tr("House and node system","भाव और नोड पद्धति"),display(birth.houseSystem)+" / "+display(birth.nodeMode)]],[1.4,2.6],9,25);
 if(birth.transitTimeBasis==="civil_noon"){
  note(tr("Each transit snapshot uses 12:00 local time in ","हर गोचर गणना के लिए स्थानीय समय दोपहर 12:00 और समय क्षेत्र ","Har gochar ki ganana local dopahar 12:00 par is time zone mein hoti hai: ")+s(birth.transitTimezone)+tr(". The offset follows the rules for the snapshot date."," का उपयोग होता है। संबंधित तिथि के अनुसार UTC अंतर बदल सकता है।",". Har tareekh ka UTC offset us zone ke niyamon se milta hai."));
 }else if(birth.transitTimeBasis==="fixed_offset_noon"){
  const offset=Number(birth.transitTimezone);
  const value="UTC"+(offset>=0?"+":"")+String(offset);
  note(tr("Each transit snapshot uses 12:00 at the recorded fixed birth offset ","हर गोचर गणना के लिए दोपहर 12:00 और जन्म का दर्ज स्थिर UTC अंतर ","Har gochar ki ganana dopahar 12:00 par janm ke darj fixed offset ")+value+tr(". Seasonal clock changes are unavailable for this request."," लिया जाता है। इस अनुरोध के लिए मौसमी घड़ी परिवर्तन उपलब्ध नहीं हैं।"," par hoti hai. Is request mein seasonal clock changes ki jaankari uplabdh nahi hai."));
 }
 note(tr("Approximate birth times may alter house and divisional chart results. The supplied birth offset is used for the birth instant.","अनुमानित जन्म समय से भाव और वर्ग कुंडली बदल सकती है। दिए गए UTC अंतर से जन्म समय की गणना होती है।","Approximate birth time se bhav aur varga change ho sakte hain. Supplied UTC offset birth instant ke liye use hota hai."));
 }
 const slug=request.templateId;
 if(slug==="premium-kundli"){
  const h=obj(data("houses")),d1=records(h.lagna),d9=records(h.navamsa);
  interior("02 / NATAL ARCHITECTURE",tr("Your birth charts","आपकी जन्म कुंडली"),tr("North Indian house-fixed D1 and D9 diagrams. House numbers stay fixed; signs and planets vary with the input.","उत्तर भारतीय भाव-स्थिर D1 और D9 चित्र। भाव स्थिर हैं; राशियाँ और ग्रह जन्म विवरण पर निर्भर हैं।"));charts(d1,d9,"D1 / RASHI","D9 / NAVAMSA");note(tr("Diagrams are calculated from the internal Lahiri, whole-sign engine. No independent ephemeris certification is claimed.","चित्र आंतरिक लाहिड़ी गणना पर आधारित हैं। स्वतंत्र प्रमाणीकरण का दावा नहीं है।"));
  kundliChapter("03 / PLANETARY PLACEMENTS",tr("The nine grahas","नौ ग्रह"),tr("Degrees rounded to four decimal places.","अंश चार दशमलव स्थान तक।"));planetTable(records(data("planets")));subhead(tr("Traditional interpretation","पारंपरिक व्याख्या"));cardRows(insights.planetNotes.slice(0,2),2);
  kundliChapter("04 / LIFE AREAS",tr("Twelve houses, twelve lenses","बारह भाव, बारह दृष्टिकोण"),tr("Empty houses remain meaningful; traditional sign rulership provides context.","रिक्त भाव भी महत्वपूर्ण हैं; पारंपरिक राशि स्वामित्व संदर्भ देता है।"));houseTable(d1);
  kundliChapter("05 / TIMING FRAMEWORK",tr("Your current Dasha cycle","आपका वर्तमान दशा चक्र"),tr("Vimshottari periods are calculated timing frameworks, not promises of events.","विंशोत्तरी दशा गणना का समय-संदर्भ है, घटनाओं की गारंटी नहीं।"));periodCards(obj(data("dasha")));note(tr("Use timing as a reflection framework. Actual decisions depend on evidence and circumstances.","समय को चिंतन के संदर्भ में लें। निर्णय वास्तविक परिस्थितियों पर निर्भर हैं।"));
  kundliChapter("06 / TRADITIONAL INDICATORS",tr("Yogas, doshas & Panchang","योग, दोष और पंचांग"),tr("Rule-based indicators and birth Panchang; no prediction of misfortune.","नियम आधारित संकेत और जन्म पंचांग; दुर्भाग्य की भविष्यवाणी नहीं।"));const yd=obj(data("yoga-dosha")),yo=obj(yd.yoga),ds=obj(yd.dosha);const detected=records(yo.detected);if(detected.length)table([tr("Detected yoga","पाया गया योग"),tr("Rule basis & interpretation","नियम और व्याख्या")],detected.map(r=>[display(r.name),[s(r.basis).replace(/\b(?:Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu)\b/g,term),s(r.interpretation),term(s(r.caveat))].filter(Boolean).join("\n")]),[1,3.6],8.7,39);else paragraph(tr("No evaluated yoga is marked detected by the current rules.","वर्तमान नियमों में कोई योग पाया नहीं गया।"));subhead(tr("Dosha assessment","दोष का आकलन"));cardRows([doshaCard(obj(ds.manglik),"Manglik"),doshaCard(obj(ds.kaalSarp),"Kaal Sarp")],2);subhead(tr("Birth Panchang","जन्म पंचांग"));panchangGrid(obj(data("panchang")));note(s(yo.note)+" "+s(ds.notes));
  kundliChapter("07 / NUMEROLOGY",tr("Your numerical profile","आपकी अंक ज्योतिष प्रोफ़ाइल"),tr("Symbolic birth-date and name numbers. These are not measured personal traits.","प्रतीकात्मक जन्म तिथि और नाम अंक। ये व्यक्तित्व की वैज्ञानिक माप नहीं हैं।"));const n=obj(data("numerology"));const ns=[obj(n.birthNumber),obj(n.lifePath),...(n.nameNumber?[obj(n.nameNumber)]:[])];tiles(ns.map((r,i)=>({label:["Moolank","Bhagyank","Naamank"][i],value:shown(r.value),sub:s(r.meaning)})));if(s(n.nameNumberUnavailableReason))note(s(n.nameNumberUnavailableReason));loShu(records(n.grid));subhead(tr("Put the symbols into practice","अंकों को चिंतन में उपयोग करें"));table(["Number",tr("Meaning and reflection","अर्थ और चिंतन")],ns.map((r,i)=>[["Moolank","Bhagyank","Naamank"][i]+" "+shown(r.value),s(r.meaning)+" "+s(r.guidance)]),[1,3.6],9.3,35);
 }else{
  // Each specialist uses a semantic renderer, never a raw recursive JSON dump.
  for(const sec of content.sections){
   const k=sec.key,v=sec.data,r=obj(v);
   if(["birth","editorial-depth","editorial-insights","your-question","trust"].includes(k))continue;
   if(k==="partner"){
    specialist("02 / COMPATIBILITY",sec.title,345);paragraph(shown(r.name)+" · "+date(obj(r.birth).dateOfBirth)+" · "+shown(obj(r.birth).timeOfBirth)+" · "+shown(obj(r.birth).birthPlace),10.5,wine,"bold");charts(records(r.primaryHouses),records(r.houses),"PERSON 1 / D1","PERSON 2 / D1");planetTable(records(r.positions));
   }else if(k==="guna"){
    specialist("ASHTAKOOT / MATCHING",sec.title,210);const max=number(r.maxScore),total=number(r.totalScore);tiles([{label:"Guna Milan",value:total+" / "+max,sub:s(r.verdict)}]);ensure(30);rect(M,y,CW,16,sand);rect(M,y,CW*Math.min(1,Math.max(0,max?total/max:0)),16,green);y+=31;const factors=records(r.ashtakoot);table(["Koot","Score","Traditional rule"],factors.map(f=>[term(s(f.koot??f.name)),s(f.score)+" / "+s(f.maxScore),[s(f.brideValue)+" / "+s(f.groomValue),s(f.explanation??f.meaning)].filter(Boolean).join("\n")]),[1,.7,3],9.2,39);note(tr("A traditional compatibility score is not a decision about marriage, consent or personal worth.","पारंपरिक मिलान अंक विवाह, सहमति या व्यक्तिगत मूल्य का निर्णय नहीं हैं।"));
   }else if(k==="numerology-profile"||k==="birth-numerology"||k==="current-name"){
    specialist("NUMEROLOGY",sec.title,170);if(r.current)paragraph(s(r.current),18,wine,"title");cardRows(Object.entries(r).filter(([,value])=>obj(value).value!=null).map(([key,value])=>numCard(obj(value),label(key))),2);
   }else if(k==="lo-shu"){
    specialist("NUMEROLOGY",sec.title,300);loShu(records(r.grid));const repeated=records(r.repeated),missing=records(r.missing);if(repeated.length)table(["Repeated digit","Count","Reflection"],repeated.map(t=>[s(t.value),s(t.count),s(t.guidance)]),[1,1,3]);if(missing.length)table(["Not present","Reflection themes"],missing.map(t=>[s(t.value),s(t.guidance)]),[1,3]);
   }else if(k==="name-options"||k==="name-comparison"){
    specialist("NAME COMPARISON",sec.title,150);table(["Name", "Name number",k==="name-options"?"Traditional sound":"Soul / personality","Meaning / guidance"],records(v).map(t=>[shown(t.name),shown(obj(t.nameNumber).value),k==="name-options"?term(t.startsWithTraditionalSound?"Matches":"Alternative"):display(obj(t.soulUrge).value)+" / "+display(obj(t.personality).value),s(obj(t.nameNumber).meaning)+"\n"+s(obj(t.nameNumber).guidance)]),[1.2,.8,1.1,2.5],9,40);
   }else if(k==="naming"){
    specialist("NAMING TRADITION",sec.title,150);tiles([{label:"Nakshatra",value:shown(r.nakshatra)},{label:"Pada",value:shown(r.pada)},{label:"Traditional sound",value:shown(r.traditionalSound)}]);paragraph(tr("Alternative traditional sounds: ","अन्य पारंपरिक ध्वनियाँ: ")+s(r.otherSounds));
   }else if(k==="manglik"||k==="kaal-sarp"||k==="match-dosha"){
    specialist("TRADITIONAL RULES",sec.title,155);if(k==="match-dosha"){for(const [key,val] of Object.entries(r)){if(obj(val).present!==undefined){
      const heading=key==="brideManglik"?tr("Person 1 / Manglik","पहला व्यक्ति / मांगलिक","Person 1 / Manglik"):key==="groomManglik"?tr("Person 2 / Manglik","दूसरा व्यक्ति / मांगलिक","Person 2 / Manglik"):term(label(key));
      dosha(obj(val),heading);
    }else if(s(val))paragraph(field(key)+": "+s(val));}}else dosha(k==="kaal-sarp"?obj(r.assessment):r,sec.title);if(s(r.notes))note(s(r.notes));
   }else if(k.includes("dasha")||k==="relationship-timing"){
    specialist("TIMING FRAMEWORK",sec.title,170);periodCards(r);if(obj(r.birthNumber).value!=null||obj(r.lifePath).value!=null)cardRows([numCard(obj(r.birthNumber),"Birth number"),numCard(obj(r.lifePath),"Life path")],2);
   }else if(k==="current-transit"||k.includes("transits")||k.includes("months")){
    specialist("TRANSIT CHECKPOINTS",sec.title,140);snapshots(Array.isArray(v)?v:[r]);
   }else if(k.includes("houses")||k.endsWith("-context")&&Array.isArray(v)){
    specialist("LIFE AREAS",sec.title,140);houseTable(records(v));
   }else if(Array.isArray(v)&&records(v).every(p=>p.planet&&p.sign)&&v.length){
    specialist("PLANETARY PLACEMENTS",sec.title,110);planetTable(records(v));
   }else if(k==="sade-sati-basis"){
    specialist("SATURN / NATAL MOON",sec.title,110);tiles([{label:"Natal Moon",value:shown(r.natalMoon)},{label:"Natal Saturn",value:shown(obj(r.natalSaturn).sign),sub:term("House")+" "+shown(obj(r.natalSaturn).house)}]);
   }else if(Array.isArray(v)&&v.every(x=>typeof x==="string")){
    specialist("PRACTICAL GUIDANCE",sec.title,140);cardRows(v.map((x,i)=>({label:tr("Reflection ","चिंतन ")+(i+1),title:sec.title,body:s(x)})),1);
   }else if(k==="compatibility-guidance"){
    specialist("RELATIONSHIP REFLECTION",sec.title,140);for(const key of ["moon","nakshatra","practicalGuidance","limitations"]){if(s(r[key]))paragraph(field(key)+": "+s(r[key]))}
   }else{
    // Unknown structured content must be reviewed, not silently flattened.
    throw new ReportQualityError("REPORT_EDITORIAL_UNKNOWN_SECTION_"+k);
   }
   if(sec.limitations.length)note(sec.limitations.map(term).join(" "));
  }
  if(insights.planetNotes.length){specialist("PERSONAL INTERPRETATION",tr("What your placements suggest for reflection","ग्रह स्थितियों से चिंतन के विषय"),145);cardRows(insights.planetNotes,2)}
 }
 const depth=data("editorial-depth") as DepthChapter[]|undefined;
 if(depth){for(const part of depth){
  const cards=groupEditorialCardBodies(part.cards).map(group=>group.members.length===1?group.members[0]:{
   label:tr("Shared explanation","साझा व्याख्या","Shared explanation")+" / "+group.members.length,
   title:group.members.map(c=>c.label+" — "+c.title).join("\n"),
   body:group.body
  });
  // Keep the existing chapter order and titles; start inline if the
  // introduction and first card both fit. This avoids sparse carry-over pages.
  const first=cards[0];
  if(!first)continue;
  const introHeight=wrap(part.intro,CW,10.1).length*15.15+12;
  const firstHeight=12+wrap(first.label,CW-26,8,"bold").length*11+8+wrap(first.title,CW-26,16,"title").length*20+8+wrap(first.body,CW-26,13.2).length*20.86+14;
  if(firstHeight+introHeight<=BOTTOM-240){
   specialist(tr("DETAILED READING","विस्तृत विवेचन","Detailed reading"),part.title,firstHeight+introHeight+14);
   paragraph(part.intro,10.1,muted,"body",12);
  }else interior(tr("DETAILED READING","विस्तृत विवेचन","Detailed reading"),part.title,part.intro);
  cardRows(cards,1);
 }}
 reflectionPlan();
 {const saved=page;page=contentsPage;rect(0,0,W,H,iv);brand(24);caps(W-M,32,tr("PRIVATE REPORT","निजी रिपोर्ट","NIJI REPORT"),muted,8,"right");rule(M,68,W-M,68,gold,1);caps(M,84,tr("YOUR READING GUIDE","पठन मार्गदर्शिका"));fixed(M,104,tr("Contents","विषय सूची"),CW,29,"title",wine,35);let top=155;
 for(const item of starts){const lines=wrap(item.title,CW-58,10.2,"bold"),height=lines.length*14+10;if(top+height>BOTTOM)throw new ReportQualityError("REPORT_CONTENTS_OVERFLOW");tx(M,top,String(item.page).padStart(2,"0"),10,"bold",goldText);fixed(M+38,top,item.title,CW-58,10.2,"bold",ink,14);top+=height;rule(M+38,top-5,W-M,top-5,light);}page=saved;}
 const pages=pdf.getPages();pages.forEach((p,i)=>{if(i===0)return;page=p;rule(M,H-44,W-M,H-44,gold);tx(M,H-34,"NAKSHARIX / care@naksharix.com",7.7,"bold",muted);tx(W-M,H-34,String(i+1).padStart(2,"0")+" / "+String(pages.length).padStart(2,"0"),8.3,"bold",muted,"right")});
}
