import "server-only";
import { PDFDocument, StandardFonts, rgb, radians, type PDFPage,type PDFFont,type PDFImage,type RGB } from "pdf-lib";
import type { PremiumReportContentResult } from "@/lib/reports/premium-report-content-engine";
import type { EditorialCard,EditorialInsights } from "@/lib/reports/editorial-insights";

type R=Record<string,unknown>;
const obj=(v:unknown):R=>v!==null&&typeof v==="object"&&!Array.isArray(v)?v as R:{};
const list=(v:unknown):unknown[]=>Array.isArray(v)?v:[];
const records=(v:unknown):R[]=>list(v).map(obj);
const s=(v:unknown):string=>typeof v==="string"?v:typeof v==="number"?String(v):typeof v==="boolean"?(v?"Yes":"No"):Array.isArray(v)?v.map(s).join(", "):"";
const shown=(v:unknown)=>s(v)||"Not available";
const number=(v:unknown)=>typeof v==="number"&&Number.isFinite(v)?v:0;
const label=(v:string)=>v.replace(/([a-z])([A-Z])/g,"$1 $2").replace(/[-_]/g," ").replace(/^./,x=>x.toUpperCase());
const date=(v:unknown)=>{const t=s(v).slice(0,10);if(!/^\d{4}-\d\d-\d\d$/.test(t))return shown(v);return new Intl.DateTimeFormat("en-GB",{day:"2-digit",month:"short",year:"numeric",timeZone:"UTC"}).format(new Date(t+"T00:00:00Z"))};
const deg=(v:unknown)=>typeof v==="number"&&Number.isFinite(v)?v.toFixed(4)+"°":"-";
const clean=(v:string)=>v.replace(/[\r]/g,"").replace(/[–—−]/g,"-").replace(/[‘’′]/g,"'").replace(/[“”]/g,'"').replace(/\u00a0/g," ").replace(/[^\u0009\u000A\u0020-\u007E\u00A1-\u00FF\u0900-\u097F\u200C\u200D\u20B9]/gu,"?");
const C=(v:string)=>rgb(parseInt(v.slice(0,2),16)/255,parseInt(v.slice(2,4),16)/255,parseInt(v.slice(4,6),16)/255);
const W=595.28,H=841.89,M=44,CW=W-2*M,BOTTOM=H-66;
const navy=C("172437"),iv=C("FCF8F0"),white=C("FFFFFF"),ink=C("2B2330"),muted=C("665F67"),wine=C("56283C"),gold=C("B4894E"),light=C("E7D8C1"),sand=C("F2E8D6"),green=C("345E53"),glow=C("F4D89C"),pale=C("E9F0E9");
const shortPlanets:Record<string,string>={Sun:"Su",Moon:"Mo",Mars:"Ma",Mercury:"Me",Jupiter:"Ju",Venus:"Ve",Saturn:"Sa",Rahu:"Ra",Ketu:"Ke"};
const houseCoords=[[.5,.25],[.25,.087],[.087,.25],[.25,.5],[.087,.75],[.25,.91],[.5,.75],[.75,.91],[.913,.75],[.75,.5],[.913,.25],[.75,.087]];
type FontKind="body"|"bold"|"title";
export async function renderEditorialReport(pdf:PDFDocument,content:PremiumReportContentResult,request:{requestId:string;templateId:string;reportTitle?:string;customerName?:string;language?:"en"|"hi"|"hinglish"},fonts:{latin:PDFFont;indic:PDFFont},logo:PDFImage|null){
 const lang=request.language??"en",tr=(en:string,hi:string,hinglish=en)=>lang==="hi"?hi:lang==="hinglish"?hinglish:en;
 const serif=await pdf.embedFont(StandardFonts.TimesRoman),bold=await pdf.embedFont(StandardFonts.HelveticaBold);
 const segmenter=new Intl.Segmenter("hi",{granularity:"grapheme"});
 const glyphs=(v:string)=>Array.from(segmenter.segment(clean(v)),x=>x.segment);
 function runs(v:string,kind:FontKind){
  const result:{font:PDFFont;text:string}[]=[];
  for(const part of glyphs(v)){const font=/[\u0900-\u097F\u200C\u200D\u20B9]/u.test(part)?fonts.indic:kind==="title"?serif:kind==="bold"?bold:fonts.latin;
   const last=result[result.length-1];if(last?.font===font)last.text+=part;else result.push({font,text:part});
  }return result;
 }
 const measure=(v:string,size:number,kind:FontKind="body")=>runs(v,kind).reduce((n,r)=>n+r.font.widthOfTextAtSize(r.text,size),0);
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
 const insights=obj(data("editorial-insights")) as unknown as EditorialInsights;
 if(!birth.name||!insights.overview||!Array.isArray(insights.cards)||!Array.isArray(insights.plan))throw Error("REPORT_EDITORIAL_CONTENT_INCOMPLETE");
 function rect(x:number,top:number,w:number,h:number,color:RGB,border?:RGB){page.drawRectangle({x,y:H-top-h,width:w,height:h,color,...(border?{borderColor:border,borderWidth:.65}:{})})}
 function rule(x:number,top:number,x2:number,top2:number,color:RGB=light,width=.7){page.drawLine({start:{x,y:H-top},end:{x:x2,y:H-top2},color,thickness:width})}
 function tx(x:number,top:number,v:string,size=10,kind:FontKind="body",color:RGB=ink,align:"left"|"center"|"right"="left"){
  let dx=x-(align==="center"?measure(v,size,kind)/2:align==="right"?measure(v,size,kind):0);
  for(const r of runs(v,kind)){if(r.text)page.drawText(r.text,{x:dx,y:H-top-size,font:r.font,size,color});dx+=r.font.widthOfTextAtSize(r.text,size);}
 }
 function fixed(x:number,top:number,v:string,width:number,size=10.5,kind:FontKind="body",color:RGB=ink,leading=size*1.45,align:"left"|"center"="left"){
  const ls=wrap(v,width,size,kind);ls.forEach((line,i)=>tx(align==="center"?x+width/2:x,top+i*leading,line,size,kind,color,align));return ls.length*leading;
 }
 const caps=(x:number,top:number,v:string,color:RGB=gold,size=8.6,align:"left"|"center"|"right"="left")=>tx(x,top,v.toUpperCase(),size,"bold",color,align);
 function brand(top:number,dark=false){if(logo){const l=logo.scaleToFit(34,34);page.drawImage(logo,{x:M+1,y:H-top-l.height,width:l.width,height:l.height});}tx(M+42,top+3,"NAKSHARIX",13,"bold",dark?glow:wine);tx(M+42,top+20,"VEDIC ASTROLOGY",7,"body",dark?light:muted);}
 function interior(kicker:string,title:string,sub="",continuation=false){
  chapter=kicker;heading=title;page=pdf.addPage([W,H]);rect(0,0,W,H,iv);brand(24);
  caps(W-M,32,tr("PRIVATE REPORT","निजी रिपोर्ट"),muted,8,"right");rule(M,68,W-M,68,gold,1);
  if(!continuation)starts.push({title,page:pdf.getPageCount()});
  caps(M,84,kicker);y=102+fixed(M,102,title+(continuation?tr(" (continued)"," (जारी)"):""),CW,25,"title",wine,30)+8;
  if(sub)y+=fixed(M,y,sub,CW,10.1,"body",muted,14.7)+15;
 }
 let firstSpecialist=true;
 function specialist(kicker:string,title:string,minBody=145){
  const headingHeight=wrap(title,CW,18,"title").length*22+43;
  if(firstSpecialist||y+headingHeight+minBody>BOTTOM){firstSpecialist=false;interior(kicker,title);return}
  chapter=kicker;heading=title;rule(M,y+2,W-M,y+2,gold,.65);y+=14;caps(M,y,kicker, gold,8);y+=15;
  y+=fixed(M,y,title,CW,18,"title",wine,22)+13;
 }
 function ensure(h:number){if(h>BOTTOM-160)throw Error("REPORT_EDITORIAL_BLOCK_TOO_TALL");if(y+h>BOTTOM)interior(chapter,heading,"",true)}
 function paragraph(v:string,size=10.5,color:RGB=ink,kind:FontKind="body",after=10){const ls=wrap(v,CW,size,kind);for(const line of ls){ensure(size*1.5);tx(M,y,line,size,kind,color);y+=size*1.5;}y+=after}
 function subhead(v:string){ensure(32);caps(M,y,v);y+=22}
 function note(v:string){if(!v)return;const ls=wrap(v,CW-24,9.1),height=ls.length*13+22;if(height>290){paragraph(v,9.1,muted);return;}ensure(height);rect(M,y,CW,height,sand);fixed(M+12,y+10,v,CW-24,9.1,"body",muted,13);y+=height+12}
 function cardRows(cards:EditorialCard[],columns=2,accent=false){
  const gap=13,w=(CW-(columns-1)*gap)/columns;
  for(let i=0;i<cards.length;i+=columns){
   const batch=cards.slice(i,i+columns);
   const heights=batch.map(c=>12+wrap(c.label,w-26,8,"bold").length*11+8+wrap(c.title,w-26,16,"title").length*20+8+wrap(c.body,w-26,10).length*14.5+14);
   const h=Math.max(...heights,94);
   if(h>BOTTOM-160){for(const c of batch){subhead(c.label);paragraph(c.title,16,wine,"title",4);paragraph(c.body);}continue;}
   ensure(h+11);
   batch.forEach((c,j)=>{const x=M+j*(w+gap);rect(x,y,w,h,accent?wine:white,accent?undefined:light);let top=y+13;top+=fixed(x+13,top,c.label.toUpperCase(),w-26,8,"bold",accent?glow:gold,11)+8;top+=fixed(x+13,top,c.title,w-26,16,"title",accent?iv:wine,20)+8;fixed(x+13,top,c.body,w-26,10,"body",accent?iv:ink,14.5)});
   y+=h+13;
  }
 }
 function table(headers:string[],rows:string[][],fractions:number[],size=9.4,minHeight=30){
  const sum=fractions.reduce((a,b)=>a+b,0),widths=fractions.map(f=>CW*f/sum);
  const header=()=>{const h=Math.max(...headers.map((v,i)=>wrap(v.toUpperCase(),widths[i]-18,8,"bold").length*11))+17;ensure(h+minHeight);rect(M,y,CW,h,wine);let x=M;headers.forEach((v,i)=>{fixed(x+9,y+8,v.toUpperCase(),widths[i]-18,8,"bold",iv,11);x+=widths[i]});y+=h;};
  header();let i=0;
  for(const row of rows){const columns=row.map((v,j)=>wrap(v,widths[j]-18,size,j===0?"bold":"body"));
   let consumed=0;const max=Math.max(...columns.map(v=>v.length));
   while(consumed<max){
    if(y+minHeight>BOTTOM){interior(chapter,heading,"",true);header();}
    const capacity=Math.max(1,Math.floor((BOTTOM-y-16)/(size*1.45)));
    const take=Math.min(max-consumed,capacity,30),h=Math.max(minHeight,take*size*1.45+16);
    if(y+h>BOTTOM){interior(chapter,heading,"",true);header();continue}
    rect(M,y,CW,h,i%2===0?white:C("F7F0E4"));let x=M;
    columns.forEach((lines,j)=>{lines.slice(consumed,consumed+take).forEach((v,k)=>tx(x+9,y+8+k*size*1.45,v,size,j===0?"bold":"body",j===0?wine:ink));x+=widths[j]});
    y+=h;consumed+=take;
   }i++;
  }rule(M,y,W-M,y,gold);y+=16;
 }
 function tiles(values:{label:string;value:string;sub?:string}[]){
  const n=values.length,w=(CW-(n-1)*10)/n;
  const sizes=values.map(v=>v.value.length>18?13:v.value.length>12?16:21);
  const height=Math.max(89,...values.map((v,i)=>wrap(v.label.toUpperCase(),w-20,8,"bold").length*11+wrap(v.value,w-20,sizes[i],"title").length*(sizes[i]+4)+wrap(v.sub??"",w-20,8.5).length*12+30));
  ensure(height+13);
  values.forEach((v,i)=>{const x=M+i*(w+10);rect(x,y,w,height,white,light);let t=y+11;t+=fixed(x+10,t,v.label.toUpperCase(),w-20,8,"bold",gold,11)+9;t+=fixed(x+10,t,v.value,w-20,sizes[i],"title",wine,sizes[i]+4)+8;if(v.sub)fixed(x+10,t,v.sub,w-20,8.5,"body",muted,12)});
  y+=height+16;
 }
 function planetTable(rows:R[]){if(!rows.length)return;table(["Graha",tr("Sign","राशि"),tr("House","भाव"),tr("Degree","अंश"),tr("Nakshatra","नक्षत्र")],rows.map(r=>[shown(r.planet),shown(r.sign),shown(r.house),deg(r.degree),shown(r.nakshatra)]),[1.05,1.2,.65,.85,1.65],9.8,33)}
 function houseTable(rows:R[]){if(!rows.length)return;table([tr("House","भाव"),tr("Sign","राशि"),tr("Planets","ग्रह"),tr("Reflection theme","चिंतन विषय")],rows.map(r=>[shown(r.house),shown(r.sign),list(r.planets).map(p=>typeof p==="string"?p:s(obj(p).planet)).join(", ")||"-",s(r.title)+"\n"+s(r.compact??r.interpretation)]),[.56,.85,1.3,3.5],8.5,36)}
 function chart(x:number,top:number,size:number,houses:R[]){
  rect(x,top,size,size,white,gold);
  const shade=(poly:number[][],col:RGB)=>{const p=poly.map(([a,b],i)=>(i?"L":"M")+" "+(a*size)+" "+(b*size)).join(" ")+" Z";page.drawSvgPath(p,{x,y:H-top,color:col});};
  shade([[.5,0],[.75,.25],[.5,.5],[.25,.25]],sand);shade([[.5,.5],[.75,.25],[1,.5],[.75,.75]],pale);
  for(const [a,b,c,d] of [[0,0,1,1],[0,1,1,0],[.5,0,1,.5],[1,.5,.5,1],[.5,1,0,.5],[0,.5,.5,0]])rule(x+a*size,top+b*size,x+c*size,top+d*size,gold,.75);
  for(let i=0;i<12;i++){const h=houses.find(r=>number(r.house)===i+1);const [a,b]=houseCoords[i];const cx=x+a*size,cy=top+b*size;const ps=list(h?.planets).map(p=>typeof p==="string"?p:s(obj(p).planet)).map(p=>shortPlanets[p]??p.slice(0,2));tx(cx,cy-10,String(i+1)+" "+s(h?.sign).slice(0,3),7.4,"bold",muted,"center");const groups=[];for(let j=0;j<ps.length;j+=3)groups.push(ps.slice(j,j+3).join(" "));(groups.length?groups:["-"]).forEach((v,j)=>tx(cx,cy+1+j*8,v,8.2,"bold",wine,"center"))}
 }
 function charts(a:R[],b:R[],aLabel:string,bLabel:string){if(a.length!==12||b.length!==12)throw Error("REPORT_CHART_HOUSES_INCOMPLETE");const size=(CW-22)/2-6;ensure(size+94);caps(M,y,aLabel);caps(M+CW/2+11,y,bLabel);y+=18;tx(M,y,shown(a.find(r=>number(r.house)===1)?.sign)+" ascendant",14,"title",wine);tx(M+CW/2+11,y,shown(b.find(r=>number(r.house)===1)?.sign)+" ascendant",14,"title",wine);y+=23;chart(M+3,y,size,a);chart(M+CW/2+14,y,size,b);y+=size+15;paragraph("Su Sun · Mo Moon · Ma Mars · Me Mercury · Ju Jupiter · Ve Venus · Sa Saturn · Ra Rahu · Ke Ketu.",9,muted)}
 function periodCards(d:R){
  const a=obj(d.currentMajor??d.major),b=obj(d.currentSubPeriod??d.sub);
  const make=(r:R,k:string)=>({label:k,title:shown(r.planet),body:r.planet?date(r.startsAt)+" - "+date(r.endsAt):tr("No active period available.","वर्तमान दशा उपलब्ध नहीं।")});
  cardRows([make(a,tr("Current Mahadasha","वर्तमान महादशा")),make(b,tr("Current Antardasha","वर्तमान अंतर्दशा"))],2,true);
  const rows=records(a.antardashas),from=Date.parse(s(a.startsAt)),until=Date.parse(s(a.endsAt)),now=Date.parse(s(d.asOf)||s(birth.generatedOn));
  if(rows.length&&Number.isFinite(from)&&until>from){
   subhead(tr("Mahadasha / sub-period timeline","महादशा / उप-अवधि समयरेखा"));ensure(56);
   for(const [i,r] of rows.entries()){const x=M+CW*Math.max(0,(Date.parse(s(r.startsAt))-from)/(until-from)),end=M+CW*Math.min(1,(Date.parse(s(r.endsAt))-from)/(until-from));if(end<=x)continue;const current=now>=Date.parse(s(r.startsAt))&&now<Date.parse(s(r.endsAt));rect(x,y,end-x,23,current?green:[gold,sand,pale,C("B8ADA4")][i%4]);if(end-x>25)tx((x+end)/2,y+6,s(r.planet).slice(0,3),8,"bold",current?iv:ink,"center");}
   if(now>=from&&now<until){const x=M+CW*(now-from)/(until-from);rule(x,y-4,x,y+31,wine,1.4);caps(x,y+32,"NOW",wine,7,"center")}
   tx(M,y+26,s(a.startsAt).slice(0,4),8,"body",muted);tx(W-M,y+26,s(a.endsAt).slice(0,4),8,"body",muted,"right");y+=55;
   table([tr("Sub-period","उप-अवधि"),tr("From","से"),tr("To","तक"),tr("Status","स्थिति")],rows.map(r=>[shown(r.planet),date(r.startsAt),date(r.endsAt),now>=Date.parse(s(r.startsAt))&&now<Date.parse(s(r.endsAt))?"Current":now>=Date.parse(s(r.endsAt))?"Past":"Upcoming"]),[1,1.2,1.2,.8],9.2,25)
  }
  else if(records(d.periods).length)table(["Mahadasha","From","To"],records(d.periods).map(r=>[shown(r.planet),date(r.startsAt),date(r.endsAt)]),[1,1,1]);
 }
 function numCard(r:R,k:string){return {label:s(r.label)||k,title:shown(r.value)+" / "+s(r.meaning),body:[s(r.guidance),s(r.strengths)?tr("Strength themes: ","गुण विषय: ")+s(r.strengths):"",s(r.growthAreas)?tr("Reflection areas: ","चिंतन क्षेत्र: ")+s(r.growthAreas):""].filter(Boolean).join("\n")}}
 function loShu(grid:R[]){if(grid.length!==9)return;subhead("LO SHU / "+tr("BIRTH-DATE DIGITS","जन्म तिथि के अंक"));const z=76,gap=5,gw=3*z+2*gap;ensure(3*z+2*gap+20);
  [4,9,2,3,5,7,8,1,6].forEach((n,i)=>{const g=grid.find(r=>number(r.number)===n),ct=number(g?.count),x=M+i%3*(z+gap),t=y+Math.floor(i/3)*(z+gap);rect(x,t,z,z,ct?green:sand);caps(x+9,t+7,String(n),ct?glow:muted,8);tx(x+z/2,t+25,ct?String(n).repeat(Math.min(ct,10)):"-",ct>4?12:22,"title",ct?iv:muted,"center");tx(x+z/2,t+57,ct?"x "+ct:tr("Not present","अनुपस्थित"),8.1,"body",ct?iv:muted,"center")});
  const present=grid.filter(r=>number(r.count)>0).map(r=>s(r.number)),absent=grid.filter(r=>!number(r.count)).map(r=>s(r.number));let t=y+6;const x=M+gw+20,w=CW-gw-20;caps(x,t,tr("Present digits","उपस्थित अंक"));t+=17;t+=fixed(x,t,present.join(" · ")||"-",w,21,"title",wine,24)+12;caps(x,t,tr("Not present","अनुपस्थित"));t+=16;t+=fixed(x,t,absent.join(" · ")||"-",w,17,"title",wine,21)+12;fixed(x,t,tr("Absent digits are not deficiencies. This is a symbolic tradition, not a measure of ability.","अनुपस्थित अंक किसी कमी का प्रमाण नहीं हैं। यह प्रतीकात्मक परंपरा है, क्षमता का माप नहीं।"),w,10,"body",muted,14.5);y+=gw+20;
 }
 function doshaCard(r:R,title:string):EditorialCard{const reference=["marsHouseFromLagna","marsHouseFromMoon","marsHouseFromVenus"].filter(k=>r[k]!=null).map(k=>label(k)+": "+s(r[k])).join(" · ");return {label:title,title:r.present===true?(s(r.severity)||tr("Rule detected","नियम पाया गया")):tr("Not clearly detected","स्पष्ट रूप से नहीं पाया गया"),body:[s(r.summary),reference,s(r.remedies)].filter(Boolean).join("\n")}}
 function dosha(r:R,title:string){if(Object.keys(r).length)cardRows([doshaCard(r,title)],1)}
 function panchangGrid(r:R){
  const fields=["tithi","paksha","vaar","yoga","karan","nakshatra","sunrise","sunset"];
  for(let i=0;i<fields.length;i+=4){const batch=fields.slice(i,i+4),w=CW/4;const heights=batch.map(k=>wrap(shown(r[k]),w-18,10,"bold").length*13+30);const height=Math.max(48,...heights);ensure(height);batch.forEach((k,j)=>{const x=M+j*w;rect(x,y,w-5,height-5,white,light);caps(x+8,y+8,label(k),gold,8);fixed(x+8,y+23,shown(r[k]),w-18,10,"bold",ink,13)});y+=height}
  const others=["rahuKaal","choghadiya","muhurat"].map(k=>label(k)+": "+shown(r[k]));paragraph(others.join(" · "),8.7,muted);
 }
 function snapshots(v:unknown){
  const rows=records(v);if(!rows.length)return;
  const flat=rows.flatMap(r=>Array.isArray(r.positions)?records(r.positions).map(p=>({...p,date:r.date})): [r]);
  if(!flat.length)return;
  const planets=[...new Set(flat.map(r=>s(r.planet)))];
  if(planets.length>1&&rows.some(r=>Array.isArray(r.positions))){
   table([tr("Date","तिथि"),...planets],rows.map(r=>[date(r.date),...planets.map(p=>{const a=records(r.positions).find(t=>t.planet===p);return a?s(a.sign).slice(0,3)+" / "+deg(a.degree)+"\nH"+s(a.houseFromMoon)+(a.retrograde===true?" R":""):"-"})]),[1.15,...planets.map(()=>1)],8.2,32);
   paragraph(tr("H = house counted from natal Moon; R = retrograde at snapshot. Dates are sampling checkpoints, not exact event predictions.","H = जन्म चंद्र से भाव; R = उस तिथि पर वक्री। तिथियाँ गणना संदर्भ हैं, निश्चित भविष्यवाणियाँ नहीं।"),9,muted);
  }else table([tr("Date","तिथि"),"Graha / sign","Degree",tr("From Moon","चंद्र से"),tr("From Lagna","लग्न से"),tr("Phase / motion","चरण / गति")],flat.map(r=>[date(r.date),s(r.planet)+" / "+s(r.sign),deg(r.degree),shown(r.houseFromMoon),shown(r.houseFromAscendant),s(r.traditionalPhase)|| (r.retrograde===true?"Retrograde":"Direct")]),[1.05,1.15,.85,.75,.75,1.6],8.7,30);
 }
 function reflectionPlan(){
  interior(tr("REFLECTION PLAN","चिंतन योजना"),tr("Turn insight into action","चिंतन को कार्य में बदलें"),tr("Use this report as a structured reflection exercise, not a directive for major decisions.","इसे चिंतन के साधन की तरह उपयोग करें, बड़े निर्णयों के निर्देश की तरह नहीं।"));
  for(const [i,p] of insights.plan.entries()){
   const titleLines=wrap(p.title,CW-35,16,"title"),bodyLines=wrap(p.body,CW-35,10);
   const height=32+titleLines.length*19+bodyLines.length*14+12;
   if(height>250){cardRows([p],1);continue}
   ensure(height+10);rect(M,y,CW,height,white,light);rect(M,y,5,height,i===1?green:gold);
   caps(M+17,y+9,p.label,gold,8);fixed(M+17,y+24,p.title,CW-35,16,"title",wine,19);
   fixed(M+17,y+24+titleLines.length*19+4,p.body,CW-35,10,"body",ink,14);y+=height+10;
  }
  const q=obj(data("your-question"));if(s(q.submittedQuestion)){subhead(tr("Your submitted question","आपका प्रश्न"));paragraph(s(q.submittedQuestion),10,muted,"body",5)}
  subhead(insights.question.label);paragraph(insights.question.title,14,wine,"title",5);paragraph(insights.question.body,10,ink,"body",8);
  note(s(data("trust")));
 }
 // Dedicated cover, same navy/gold visual system as the owner design proof.
 page=pdf.addPage([W,H]);rect(0,0,W,H,navy);rect(0,0,W,8,gold);rect(M,36,CW,H-72,navy,C("7C694F"));brand(61,true);caps(W-M-14,69,"PERSONAL EDITION",glow,8,"right");
 const cx=W/2,cy=295;
 for(const r of [148,141,120,88,58,16])page.drawCircle({x:cx,y:H-cy,size:r,borderColor:r===148||r===120||r===58?gold:C("59616B"),borderWidth:r===148?1:.65});
 for(let i=0;i<24;i++){const a=i*Math.PI/12,r=i%2?141:132;rule(cx+r*Math.cos(a),cy+r*Math.sin(a),cx+148*Math.cos(a),cy+148*Math.sin(a),gold,.65)}
 for(let i=0;i<12;i++){const a=i*Math.PI/6,b=(i+1)*Math.PI/6;rule(cx+88*Math.cos(a),cy+88*Math.sin(a),cx+120*Math.cos(b),cy+120*Math.sin(b),gold,.65);rule(cx+120*Math.cos(a),cy+120*Math.sin(a),cx+88*Math.cos(b),cy+88*Math.sin(b),gold,.65)}
 for(let i=0;i<8;i++){const a=i*Math.PI/4;page.drawEllipse({x:cx+35*Math.cos(a),y:H-cy-35*Math.sin(a),xScale:23,yScale:10,rotate:radians(-a),borderColor:gold,borderWidth:.65})}
 caps(cx,466,tr("BIRTH CHART · LIFE THEMES · PERSONAL GUIDANCE","जन्म कुंडली · जीवन विषय · व्यक्तिगत मार्गदर्शन"),glow,8,"center");
 const shortTitles:Record<string,string>={"premium-kundli":"Premium Kundli","couple-kundli":"Couple Kundli","career-report":"Career Report","wealth-report":"Wealth Report","love-report":"Love & Relationship","baby-name-report":"Baby Name","sade-sati-report":"Sade Sati","manglik-kaal-sarp-report":"Manglik & Kaal Sarp","numerology-lo-shu-report":"Numerology & Lo Shu","name-correction-report":"Name Correction","yearly-horoscope-report":"Yearly Horoscope","transit-report":"Transit Report","rahu-ketu-report":"Rahu & Ketu","jupiter-transit-report":"Jupiter Transit","fortune-report":"Fortune Report"};
 const rawTitle=request.reportTitle??label(request.templateId);
 const title=lang!=="hi"&&!rawTitle.startsWith("QA DEMO")?(shortTitles[request.templateId]??rawTitle):rawTitle;
 const name=request.customerName??shown(birth.name),place=shown(birth.birthPlace);
 const titleSize=measure(title,40,"title")>CW-46?30:40,nameSize=name.length>55?15:21,placeSize=place.length>100?8.5:10;
 let coverY=491+fixed(M+23,491,title,CW-46,titleSize,"title",iv,titleSize+5,"center")+16;
 coverY+=fixed(M+39,coverY,tr("A personalized guide to traditional calculation, interpretation and thoughtful next steps.","पारंपरिक गणना, व्याख्या और विचारपूर्ण अगले कदमों की व्यक्तिगत मार्गदर्शिका।"),CW-78,11.4,"body",light,16,"center")+17;
 rule(M+50,coverY,W-M-50,coverY,gold);coverY+=16;caps(cx,coverY,tr("Prepared for","इनके लिए तैयार"),glow,8,"center");coverY+=18;
 coverY+=fixed(M+18,coverY,name,CW-36,nameSize,"title",iv,nameSize+4,"center")+8;
 coverY+=fixed(M+22,coverY,date(birth.dateOfBirth)+" | "+shown(birth.timeOfBirth)+" (UTC "+(number(birth.utcOffsetAtBirth)>=0?"+":"")+s(birth.utcOffsetAtBirth)+")",CW-44,10,"body",iv,14,"center")+3;
 coverY+=fixed(M+22,coverY,place,CW-44,placeSize,"body",light,placeSize*1.4,"center");
 // The same validated input can contain an unusually long name or place.
 // Continue those details on the private overview rather than clipping them.
 if(coverY>763)throw Error("REPORT_COVER_LAYOUT_OVERFLOW");
 caps(cx,767,"NAKSHARIX.COM",glow,8,"center");
 tx(cx,780,"Ref: "+request.requestId,7.1,"body",light,"center");

 interior(tr("01 / YOUR PROFILE","01 / आपकी प्रोफ़ाइल"),tr("Your chart at a glance","आपकी कुंडली एक नज़र में"),tr("A clear reading of the calculated birth chart, before the detailed tables.","विस्तृत गणनाओं से पहले जन्म कुंडली का संक्षिप्त परिचय।"));
 tiles([{label:"Lagna",value:shown(birth.ascendant)},{label:"Moon sign",value:shown(birth.moonSign)},{label:"Nakshatra",value:shown(birth.nakshatra),sub:birth.pada?"Pada "+s(birth.pada):""},{label:"Sun sign",value:shown(birth.sunSign)}]);
 cardRows([insights.overview],1,true);cardRows(insights.cards,2);
 const tocPage=page,tocY=y;let tocHeight=0;
 if(request.templateId==="premium-kundli"&&y+115<BOTTOM){subhead(tr("How to use this report","इस रिपोर्ट का उपयोग"));tocHeight=104;y+=104;}
 else {paragraph(tr("Your full report includes the specialist calculation, its traditional interpretation and a personal reflection plan.","इस रिपोर्ट में विषय की गणना, पारंपरिक व्याख्या और व्यक्तिगत चिंतन योजना है।"),9.7,muted);}
 const slug=request.templateId;
 if(slug==="premium-kundli"){
  const h=obj(data("houses")),d1=records(h.lagna),d9=records(h.navamsa);
  interior("02 / NATAL ARCHITECTURE",tr("Your birth charts","आपकी जन्म कुंडली"),tr("North Indian house-fixed D1 and D9 diagrams. House numbers stay fixed; signs and planets vary with the input.","उत्तर भारतीय भाव-स्थिर D1 और D9 चित्र। भाव स्थिर हैं; राशियाँ और ग्रह जन्म विवरण पर निर्भर हैं।"));charts(d1,d9,"D1 / RASHI","D9 / NAVAMSA");subhead(tr("What stands out","प्रमुख संकेत"));cardRows(insights.cards,2);note(tr("Diagrams are calculated from the internal Lahiri, whole-sign engine. No independent ephemeris certification is claimed.","चित्र आंतरिक लाहिड़ी गणना पर आधारित हैं। स्वतंत्र प्रमाणीकरण का दावा नहीं है।"));
  interior("03 / PLANETARY PLACEMENTS",tr("The nine grahas","नौ ग्रह"),tr("Degrees rounded to four decimal places.","अंश चार दशमलव स्थान तक।"));planetTable(records(data("planets")));subhead(tr("Traditional interpretation","पारंपरिक व्याख्या"));cardRows(insights.planetNotes.slice(0,2),2);
  interior("04 / LIFE AREAS",tr("Twelve houses, twelve lenses","बारह भाव, बारह दृष्टिकोण"),tr("Empty houses remain meaningful; traditional sign rulership provides context.","रिक्त भाव भी महत्वपूर्ण हैं; पारंपरिक राशि स्वामित्व संदर्भ देता है।"));houseTable(d1);
  interior("05 / TIMING FRAMEWORK",tr("Your current Dasha cycle","आपका वर्तमान दशा चक्र"),tr("Vimshottari periods are calculated timing frameworks, not promises of events.","विंशोत्तरी दशा गणना का समय-संदर्भ है, घटनाओं की गारंटी नहीं।"));periodCards(obj(data("dasha")));note(tr("Use timing as a reflection framework. Actual decisions depend on evidence and circumstances.","समय को चिंतन के संदर्भ में लें। निर्णय वास्तविक परिस्थितियों पर निर्भर हैं।"));
  interior("06 / TRADITIONAL INDICATORS",tr("Yogas, doshas & Panchang","योग, दोष और पंचांग"),tr("Rule-based indicators and birth Panchang; no prediction of misfortune.","नियम आधारित संकेत और जन्म पंचांग; दुर्भाग्य की भविष्यवाणी नहीं।"));const yd=obj(data("yoga-dosha")),yo=obj(yd.yoga),ds=obj(yd.dosha);const detected=records(yo.detected);if(detected.length)table([tr("Detected yoga","पाया गया योग"),tr("Rule basis & interpretation","नियम और व्याख्या")],detected.map(r=>[shown(r.name),[s(r.basis),s(r.interpretation),s(r.caveat)].filter(Boolean).join("\n")]),[1,3.6],8.7,39);else paragraph(tr("No evaluated yoga is marked detected by the current rules.","वर्तमान नियमों में कोई योग पाया नहीं गया।"));subhead(tr("Dosha assessment","दोष का आकलन"));cardRows([doshaCard(obj(ds.manglik),"Manglik"),doshaCard(obj(ds.kaalSarp),"Kaal Sarp")],2);subhead(tr("Birth Panchang","जन्म पंचांग"));panchangGrid(obj(data("panchang")));note(s(yo.note)+" "+s(ds.notes));
  interior("07 / NUMEROLOGY",tr("Your numerical profile","आपकी अंक ज्योतिष प्रोफ़ाइल"),tr("Symbolic birth-date and name numbers. These are not measured personal traits.","प्रतीकात्मक जन्म तिथि और नाम अंक। ये व्यक्तित्व की वैज्ञानिक माप नहीं हैं।"));const n=obj(data("numerology"));const ns=[obj(n.birthNumber),obj(n.lifePath),obj(n.nameNumber)];tiles(ns.map((r,i)=>({label:["Moolank","Bhagyank","Naamank"][i],value:shown(r.value),sub:s(r.meaning)})));loShu(records(n.grid));subhead(tr("Put the symbols into practice","अंकों को चिंतन में उपयोग करें"));table(["Number",tr("Meaning and reflection","अर्थ और चिंतन")],ns.map((r,i)=>[["Moolank","Bhagyank","Naamank"][i]+" "+shown(r.value),s(r.meaning)+" "+s(r.guidance)]),[1,3.6],9.3,35);
 }else{
  // Each specialist uses a semantic renderer, never a raw recursive JSON dump.
  for(const sec of content.sections){
   const k=sec.key,v=sec.data,r=obj(v);
   if(["birth","editorial-insights","your-question","trust"].includes(k))continue;
   if(k==="partner"){
    specialist("02 / COMPATIBILITY",sec.title,345);paragraph(shown(r.name)+" · "+date(obj(r.birth).dateOfBirth)+" · "+shown(obj(r.birth).timeOfBirth)+" · "+shown(obj(r.birth).birthPlace),10.5,wine,"bold");charts(records(r.primaryHouses),records(r.houses),"PERSON 1 / D1","PERSON 2 / D1");planetTable(records(r.positions));
   }else if(k==="guna"){
    specialist("ASHTAKOOT / MATCHING",sec.title,210);const max=number(r.maxScore),total=number(r.totalScore);tiles([{label:"Guna Milan",value:total+" / "+max,sub:s(r.verdict)}]);ensure(30);rect(M,y,CW,16,sand);rect(M,y,CW*Math.min(1,Math.max(0,max?total/max:0)),16,green);y+=31;const factors=records(r.ashtakoot);table(["Koot","Score","Traditional rule"],factors.map(f=>[s(f.koot??f.name),s(f.score)+" / "+s(f.maxScore),[s(f.brideValue)+" / "+s(f.groomValue),s(f.explanation??f.meaning)].filter(Boolean).join("\n")]),[1,.7,3],9.2,39);note(tr("A traditional compatibility score is not a decision about marriage, consent or personal worth.","पारंपरिक मिलान अंक विवाह, सहमति या व्यक्तिगत मूल्य का निर्णय नहीं हैं।"));
   }else if(k==="numerology-profile"||k==="birth-numerology"||k==="current-name"){
    specialist("NUMEROLOGY",sec.title,k==="lo-shu"?300:170);if(r.current)paragraph(s(r.current),18,wine,"title");cardRows(Object.entries(r).filter(([,value])=>obj(value).value!=null).map(([key,value])=>numCard(obj(value),label(key))),2);
   }else if(k==="lo-shu"){
    specialist("NUMEROLOGY",sec.title,k==="lo-shu"?300:170);loShu(records(r.grid));const repeated=records(r.repeated),missing=records(r.missing);if(repeated.length)table(["Repeated digit","Count","Reflection"],repeated.map(t=>[s(t.value),s(t.count),s(t.guidance)]),[1,1,3]);if(missing.length)table(["Not present","Reflection themes"],missing.map(t=>[s(t.value),s(t.guidance)]),[1,3]);
   }else if(k==="name-options"||k==="name-comparison"){
    specialist("NAME COMPARISON",sec.title,150);table(["Name", "Name number",k==="name-options"?"Traditional sound":"Soul / personality","Meaning / guidance"],records(v).map(t=>[shown(t.name),shown(obj(t.nameNumber).value),k==="name-options"?(t.startsWithTraditionalSound?"Matches":"Alternative"):shown(obj(t.soulUrge).value)+" / "+shown(obj(t.personality).value),s(obj(t.nameNumber).meaning)+"\n"+s(obj(t.nameNumber).guidance)]),[1.2,.8,1.1,2.5],9,40);
   }else if(k==="naming"){
    specialist("NAMING TRADITION",sec.title,150);tiles([{label:"Nakshatra",value:shown(r.nakshatra)},{label:"Pada",value:shown(r.pada)},{label:"Traditional sound",value:shown(r.traditionalSound)}]);paragraph(tr("Alternative traditional sounds: ","अन्य पारंपरिक ध्वनियाँ: ")+s(r.otherSounds));
   }else if(k==="manglik"||k==="kaal-sarp"||k==="match-dosha"){
    specialist("TRADITIONAL RULES",sec.title,155);if(k==="match-dosha"){for(const [key,val] of Object.entries(r)){if(obj(val).present!==undefined)dosha(obj(val),label(key));else if(s(val))paragraph(label(key)+": "+s(val));}}else dosha(k==="kaal-sarp"?obj(r.assessment):r,sec.title);if(s(r.notes))note(s(r.notes));
   }else if(k.includes("dasha")||k==="relationship-timing"){
    specialist("TIMING FRAMEWORK",sec.title,170);periodCards(r);if(obj(r.birthNumber).value!=null||obj(r.lifePath).value!=null)cardRows([numCard(obj(r.birthNumber),"Birth number"),numCard(obj(r.lifePath),"Life path")],2);
   }else if(k==="current-transit"||k.includes("transits")||k.includes("months")){
    specialist("TRANSIT CHECKPOINTS",sec.title,140);snapshots(Array.isArray(v)?v:[r]);
   }else if(k.includes("houses")||k.endsWith("-context")&&Array.isArray(v)){
    specialist("LIFE AREAS",sec.title,140);houseTable(records(v));
   }else if(Array.isArray(v)&&records(v).every(p=>p.planet&&p.sign)&&v.length){
    specialist("PLANETARY PLACEMENTS",sec.title,110);planetTable(records(v));
   }else if(k==="sade-sati-basis"){
    specialist("SATURN / NATAL MOON",sec.title,110);tiles([{label:"Natal Moon",value:shown(r.natalMoon)},{label:"Natal Saturn",value:shown(obj(r.natalSaturn).sign),sub:"House "+shown(obj(r.natalSaturn).house)}]);
   }else if(Array.isArray(v)&&v.every(x=>typeof x==="string")){
    specialist("PRACTICAL GUIDANCE",sec.title,140);cardRows(v.map((x,i)=>({label:tr("Reflection ","चिंतन ")+(i+1),title:sec.title,body:s(x)})),1);
   }else if(k==="compatibility-guidance"){
    specialist("RELATIONSHIP REFLECTION",sec.title,140);for(const key of ["moon","nakshatra","practicalGuidance","limitations"]){if(s(r[key]))paragraph(label(key)+": "+s(r[key]))}
   }else{
    // Unknown structured content must be reviewed, not silently flattened.
    throw Error("REPORT_EDITORIAL_UNKNOWN_SECTION_"+k);
   }
   if(sec.limitations.length)note(sec.limitations.join(" "));
  }
  if(insights.planetNotes.length){specialist("PERSONAL INTERPRETATION",tr("What your placements suggest for reflection","ग्रह स्थितियों से चिंतन के विषय"),145);cardRows(insights.planetNotes,2)}
 }
 reflectionPlan();
 if(tocHeight){const saved=page;page=tocPage;const list=starts.slice(1);list.forEach((p,i)=>{const x=M+i%2*(CW/2+6),top=tocY+22+Math.floor(i/2)*24;const w=CW/2-12;tx(x,top,String(p.page).padStart(2,"0"),8,"bold",gold);fixed(x+25,top,p.title,w-25,8.5,"bold",ink,11);rule(x,top+21,x+w,top+21,light)});page=saved}
 const pages=pdf.getPages();pages.forEach((p,i)=>{if(i===0)return;page=p;rule(M,H-44,W-M,H-44,gold);tx(M,H-34,"NAKSHARIX / care@naksharix.com",7.7,"bold",muted);tx(W-M,H-34,String(i+1).padStart(2,"0")+" / "+String(pages.length).padStart(2,"0"),8.3,"bold",muted,"right")});
}
