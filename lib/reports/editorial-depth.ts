import type {AstrologyLanguage,BirthChartData} from "@/lib/astrology/types";
import type {PremiumReportContentSection} from "./premium-report-content-engine";
import type {EditorialCard} from "./editorial-insights";
import {editorialTerm} from "./editorial-display";
import {isFullRomanNumerologyName,calculateRomanNameEvidence} from "./roman-name";
type L=readonly [string,string,string];
type R=Record<string,unknown>;
const object=(v:unknown):R=>v&&typeof v==="object"&&!Array.isArray(v)?v as R:{};
const rows=(v:unknown):R[]=>Array.isArray(v)?v.map(object):[];
const str=(v:unknown)=>typeof v==="string"||typeof v==="number"?String(v):"";
const rulers:Record<string,string>={Aries:"Mars",Taurus:"Venus",Gemini:"Mercury",Cancer:"Moon",Leo:"Sun",Virgo:"Mercury",Libra:"Venus",Scorpio:"Mars",Sagittarius:"Jupiter",Capricorn:"Saturn",Aquarius:"Saturn",Pisces:"Jupiter"};
const themes:L[]=[
 ["Identity and habits","पहचान और आदतें","Identity aur habits"],["Resources and family values","संसाधन और पारिवारिक मूल्य","Resources aur family values"],["Skills and communication","कौशल और संवाद","Skills aur communication"],["Home and security","घर और सुरक्षा","Home aur security"],["Study and creativity","अध्ययन और रचनात्मकता","Study aur creativity"],["Work routines and obligations","कार्य दिनचर्या और जिम्मेदारियाँ","Work routines aur obligations"],["Partnership and consent","साझेदारी और सहमति","Partnership aur consent"],["Shared resources and change","साझा संसाधन और परिवर्तन","Shared resources aur change"],["Values and mentors","मूल्य और मार्गदर्शन","Values aur mentors"],["Career and accountability","करियर और जवाबदेही","Career aur accountability"],["Cooperation and goals","सहयोग और लक्ष्य","Cooperation aur goals"],["Rest and expenses","विश्राम और खर्च","Rest aur expenses"]
];
const actions:L[]=[
 ["Define one habit and measure progress weekly.","एक आदत चुनें और साप्ताहिक प्रगति मापें।","Ek habit chunein aur weekly progress measure karein."],
 ["Separate essential spending from optional purchases; discuss family expectations.","जरूरी और वैकल्पिक खर्च अलग करें; पारिवारिक अपेक्षाओं पर बात करें।","Essential aur optional spending alag karein; family expectations discuss karein."],
 ["Complete a small project and request specific feedback on its communication.","एक छोटा प्रोजेक्ट पूरा करें और संवाद पर स्पष्ट प्रतिक्रिया लें।","Small project complete karein aur communication feedback lein."],
 ["Agree on home responsibilities with everyone affected by the decision.","घर की जिम्मेदारियों पर प्रभावित सभी लोगों से सहमति लें।","Home responsibilities par sabhi affected logon se agreement lein."],
 ["Compare a learning goal against an actual completed exercise.","सीखने के लक्ष्य की तुलना पूरे किए गए अभ्यास से करें।","Learning goal ko completed exercise se compare karein."],
 ["Review recurring commitments and workload; seek qualified advice for health concerns.","नियमित जिम्मेदारियाँ और कार्यभार देखें; स्वास्थ्य चिंता पर योग्य सलाह लें।","Recurring commitments review karein; health concern par qualified advice lein."],
 ["Discuss boundaries, observed behavior and mutual commitments; prioritize safety and consent.","सीमाओं, वास्तविक व्यवहार और साझा जिम्मेदारियों पर बात करें; सुरक्षा और सहमति प्राथमिक हैं।","Boundaries, actual behavior aur commitments discuss karein; safety aur consent priority hain."],
 ["List shared obligations and prepare a practical contingency plan.","साझा जिम्मेदारियाँ लिखें और वैकल्पिक योजना बनाएँ।","Shared obligations list karein aur contingency plan banayein."],
 ["Compare mentors or courses using evidence, time and cost.","प्रमाण, समय और खर्च से मार्गदर्शक या पाठ्यक्रम की तुलना करें।","Mentors ya courses evidence, time aur cost se compare karein."],
 ["Set a measurable deliverable and ask for feedback before making a career decision.","करियर निर्णय से पहले मापने योग्य कार्य तय करें और प्रतिक्रिया लें।","Career decision se pehle measurable deliverable tay karein aur feedback lein."],
 ["Choose one realistic cooperative goal and record actual contributions.","एक संभव साझा लक्ष्य चुनें और वास्तविक योगदान दर्ज करें।","Ek realistic shared goal chunein aur actual contributions note karein."],
 ["Reserve rest time and review avoidable expenses using actual records.","विश्राम का समय रखें और वास्तविक रिकॉर्ड से अनावश्यक खर्च देखें।","Rest ka time reserve karein aur actual records se avoidable expenses review karein."]
];
const focus:Record<string,number[]>={"premium-kundli":[1,2,3,4,5,6,7,8,9,10,11,12],"couple-kundli":[4,5,7,8,11],"career-report":[2,3,6,10,11],"wealth-report":[2,5,8,9,11,12],"love-report":[4,5,7,8,11],"fortune-report":[1,5,9,10,11],"yearly-horoscope-report":[1,2,4,5,6,7,9,10,11,12],"transit-report":[1,4,7,10],"sade-sati-report":[6,10,12],"rahu-ketu-report":[4,8,10],"jupiter-transit-report":[5,9,11],"manglik-kaal-sarp-report":[4,7,8]};
export type DepthChapter={key:string;title:string;intro:string;cards:EditorialCard[]};
export function buildReportDepth(chart:BirthChartData,slug:string,sections:PremiumReportContentSection[],locale:AstrologyLanguage,romanName:string):DepthChapter[]{
 const t=(v:L)=>v[locale==="hi"?1:locale==="hinglish"?2:0],term=(v:string)=>editorialTerm(v,locale);
 const house=(n:number)=>t(["House ","भाव ","Bhav "])+n,theme=(n:number)=>t(themes[n-1]??themes[0]),action=(n:number)=>t(actions[n-1]??actions[0]);
 const data=(k:string)=>sections.find(s=>s.key===k)?.data,result:DepthChapter[]=[];
 const add=(key:string,title:L,intro:L,cards:EditorialCard[])=>{if(cards.length)result.push({key,title:t(title),intro:t(intro),cards});};
 add("house-lords",["House rulers and linked life areas","भाव स्वामी और संबंधित जीवन विषय","Bhav lords aur linked life areas"],["The sign, its traditional ruler and its actual natal placement provide distinct reading lenses, not causal predictions.","राशि, पारंपरिक स्वामी और उसकी जन्म स्थिति अलग चिंतन दृष्टिकोण देते हैं, भविष्यवाणी नहीं।","Rashi, lord aur actual placement distinct reflection lenses hain, prediction nahi."],(focus[slug]??[]).map(n=>{
  const h=chart.housePositions.find(x=>x.house===n),lord=rulers[h?.sign??""],p=chart.planetPositions.find(x=>x.planet===lord);
  if(!h||!p?.house||p.house<1||p.house>12)throw Error("REPORT_HOUSE_LORD_INVALID");
  const occupants=chart.planetPositions.filter(x=>x.house===n).map(x=>term(x.planet));
  const evidence=house(n)+" / "+term(h.sign)+"; "+term(lord)+" / "+term(p.sign)+" / "+house(p.house);
  return {label:house(n)+" / "+term(h.sign),title:theme(n),body:evidence+"\n"+t(["Natal occupants: ","जन्म ग्रह: ","Natal grah: "])+(occupants.join(", ")||t(["None","कोई नहीं","Koi nahi"]))+". "+t(["The traditional ruler connects this topic with ","पारंपरिक स्वामी इस विषय को जोड़ता है: ","Traditional lord is topic ko jodta hai: "])+theme(p.house)+".\n"+t(["Practical check: ","व्यावहारिक जाँच: ","Practical check: "])+action(n)};
 }));
 if(slug==="premium-kundli")add("nine-grahas",["Individual graha calculation and context","प्रत्येक ग्रह की गणना और संदर्भ","Individual grah calculation aur context"],["Read D1 and D9 separately. This is not a complete planetary strength assessment.","D1 और D9 अलग समझें। यह संपूर्ण ग्रह बल आकलन नहीं है।","D1 aur D9 alag samjhein. Yeh complete grah strength assessment nahi hai."],chart.planetPositions.map(p=>{
  if(!p.house||!Number.isFinite(p.degree)||!Number.isFinite(p.absoluteLongitude))throw Error("REPORT_GRAHA_INVALID");
  const nav=chart.charts.navamsa.find(h=>(h.planets??[]).includes(p.planet));
  return {label:term(p.planet)+" / "+term(p.sign),title:house(p.house)+" / "+theme(p.house),body:t(["Calculated position: ","गणना की गई स्थिति: ","Calculated position: "])+Number(p.degree).toFixed(4)+"°, "+term(p.nakshatra??"")+", "+term("Pada")+" "+(p.pada??"-")+". D9: "+term(nav?.sign??"Not available")+". "+t(["Traditional sign ruler: ","पारंपरिक राशि स्वामी: ","Traditional rashi lord: "])+term(rulers[p.sign])+".\n"+action(p.house)};
 }));
 if(slug==="couple-kundli")add("matching-factors",["Eight factors: respectful discussion","आठ कारक: सम्मानपूर्ण संवाद","Aath factors: respectful discussion"],["The score describes a traditional rule. It does not establish relationship success, health or a person's worth.","अंक पारंपरिक नियम बताते हैं, संबंध की सफलता, स्वास्थ्य या व्यक्ति का मूल्य नहीं।","Score traditional rule batata hai, relationship success, health ya worth nahi."],rows(object(data("guna")).ashtakoot).map((r,i)=>{
  const prompts:L[]=[["Discuss roles without ranking people.","व्यक्तियों का मूल्यांकन किए बिना भूमिकाओं पर बात करें।","Roles discuss karein, people ko rank na karein."],["Discuss autonomy and shared decisions.","स्वायत्तता और साझा निर्णयों पर बात करें।","Autonomy aur shared decisions discuss karein."],["Compare actual routines and support needs.","वास्तविक दिनचर्या और सहयोग की जरूरतें देखें।","Actual routines aur support needs compare karein."],["Discuss privacy, comfort and consent.","निजता, सहजता और सहमति पर बात करें।","Privacy, comfort aur consent discuss karein."],["Discuss communication during disagreements.","मतभेद में संवाद पर बात करें।","Disagreement mein communication discuss karein."],["Observe how differences are handled.","मतभेद कैसे संभाले जाते हैं, देखें।","Differences kaise handle hote hain dekhein."],["Review shared family and financial plans.","साझा परिवार और धन की योजनाएँ देखें।","Shared family aur financial plans review karein."],["Do not infer health or genetic risk from Nadi; seek qualified medical advice.","नाड़ी से स्वास्थ्य या आनुवंशिक जोखिम न निकालें; योग्य चिकित्सा सलाह लें।","Nadi se health ya genetic risk infer na karein; qualified advice lein."]];
  return {label:(i+1)+" / "+term(str(r.koot??r.name)),title:str(r.score)+" / "+str(r.maxScore),body:t(["Recorded traditional result: ","दर्ज पारंपरिक परिणाम: ","Recorded traditional result: "])+str(r.result??r.explanation??r.meaning)+". "+t(prompts[i]??prompts[0])};
 }));

 if(slug==="couple-kundli"){
  const partner=object(data("partner")),partnerHouses=rows(partner.houses),partnerPlanets=rows(partner.positions);
  if(partnerHouses.length!==12||partnerPlanets.length!==9)throw Error("REPORT_PARTNER_CONTEXT_INCOMPLETE");
  add("two_person_house_context",["Two-person natal reference map","दो व्यक्तियों का जन्म भाव संदर्भ","Dono logon ka natal bhav context"],["Each chart has its own ascendant and house rulers. This comparison is a discussion aid, not an additional compatibility score or a judgment of either person.","प्रत्येक कुंडली का अपना लग्न और भाव स्वामी है। यह तुलना संवाद के लिए है, अतिरिक्त मिलान अंक या किसी व्यक्ति का मूल्यांकन नहीं।","Har chart ka apna lagna aur bhav lord hai. Yeh discussion aid hai, additional compatibility score ya kisi person ka judgment nahi."],(focus[slug]??[]).map(n=>{
   const first=chart.housePositions.find(h=>h.house===n),second=partnerHouses.find(h=>Number(h.house)===n);
   if(!first||!second)throw Error("REPORT_PARTNER_HOUSE_INVALID");
   const a=rulers[first.sign],b=rulers[str(second.sign)],ap=chart.planetPositions.find(p=>p.planet===a),bp=partnerPlanets.find(p=>p.planet===b);
   if(!a||!b||!ap?.house||!bp||!Number.isInteger(Number(bp.house))||Number(bp.house)<1||Number(bp.house)>12)throw Error("REPORT_PARTNER_HOUSE_LORD_INVALID");
   const ref=(sign:string,lord:string,placementSign:string,h:number)=>term(sign)+" / "+term(lord)+" / "+term(placementSign)+" / "+house(h)+" ("+theme(h)+")";
   return {label:house(n),title:theme(n),body:t(["Person 1: ","व्यक्ति 1: ","Person 1: "])+ref(first.sign,a,ap.sign,ap.house)+"\n"+t(["Person 2: ","व्यक्ति 2: ","Person 2: "])+ref(str(second.sign),b,str(bp.sign),Number(bp.house))+"\n"+t(["Discuss together: ","साथ मिलकर चर्चा करें: ","Saath discuss karein: "])+action(n)};
  }));
 }
 if(["premium-kundli","career-report","wealth-report","love-report","fortune-report"].includes(slug)){
  const groups=new Map<number,{house:number;lord:string}[]>();
  for(const n of focus[slug]??[]){
   const h=chart.housePositions.find(h=>h.house===n),lord=rulers[h?.sign??""],p=chart.planetPositions.find(p=>p.planet===lord);
   if(!p?.house||p.house<1||p.house>12)throw Error("REPORT_RULER_NETWORK_INVALID");
   groups.set(p.house,[...(groups.get(p.house)??[]),{house:n,lord}]);
  }
  // Grouped connections show the chart's synthesis rather than repeating
  // the same per-house descriptions or assigning an unsupported strength score.
  const cards=[...groups].filter(([,links])=>links.length>1).sort(([a],[b])=>a-b).map(([dest,links])=>({
   label:house(dest)+" / "+links.length+t([" linked topics"," जुड़े विषय"," linked topics"]),
   title:theme(dest),
   body:t(["Ruler links from the selected houses: ","चुने हुए भावों के स्वामी संबंध: ","Selected bhav lord links: "])+links.map(x=>house(x.house)+" ("+theme(x.house)+") → "+term(x.lord)).join("; ")+". "+t(["These rulers occupy the same destination house. The overlap is a traditional reading connection, not a measured strength or outcome.","ये स्वामी एक ही भाव में हैं। यह पारंपरिक संदर्भ है, मापा हुआ बल या परिणाम नहीं।","Yeh lords same destination bhav mein hain. Overlap traditional context hai, measured strength ya outcome nahi."])+"\n"+action(dest)
  }));
  if(!cards.length)cards.push({label:t(["Distinct ruler destinations","अलग स्वामी स्थितियाँ","Distinct lord destinations"]),title:t(["No shared destination in selected houses","चुने हुए भावों में साझा स्वामी स्थिति नहीं","Selected bhav mein shared destination nahi"]),body:t(["Each listed source house has a different ruler destination: ","सूची के प्रत्येक भाव के स्वामी का स्थित भाव अलग है: ","Har listed source bhav ka lord destination alag hai: "])+[...groups].map(([h,links])=>house(links[0].house)+" → "+house(h)).join("; ")+". "+t(["Treat these topics separately; absence of overlap is not a negative outcome.","इन विषयों को अलग देखें; साझा स्थिति न होना नकारात्मक परिणाम नहीं।","Topics alag dekhein; overlap na hona negative outcome nahi."])});
  add("ruler_network",["Combined house-ruler connections","संयुक्त भाव स्वामी संबंध","Combined bhav lord connections"],["This is a grouping of the actual natal rulership map, not a new yoga or strength certification.","यह वास्तविक जन्म स्वामी संबंधों का समूह है, नया योग या बल प्रमाणीकरण नहीं।","Yeh actual natal lord map ka grouping hai, new yoga ya strength certification nahi."],cards);
 }
 // Link actual calculated period lords with natal houses, without predicting events.
 const timingKey:Record<string,string>={"premium-kundli":"dasha","career-report":"career-dasha","wealth-report":"wealth-dasha","love-report":"relationship-timing","yearly-horoscope-report":"yearly-dasha","fortune-report":"fortune-dasha"};
 const upcoming=rows(object(data(timingKey[slug]??"")).nextTwelveMonths);
 if(upcoming.length)add("period-lord-context",["Upcoming period lords and natal context","आगामी दशा स्वामी और जन्म भाव","Upcoming dasha lords aur natal context"],["Each interval uses calculated UTC boundaries and actual natal placements. Interpretations are reflection prompts, not forecasts.","हर अवधि की गणना सीमाएँ और जन्म ग्रह स्थितियाँ दी गई हैं। व्याख्याएँ चिंतन के लिए हैं, भविष्यवाणी नहीं।","Har interval calculated UTC boundaries aur natal placements use karta hai. Vyakhya reflection ke liye hai, forecast nahi."],upcoming.map(r=>{
  const major=chart.planetPositions.find(p=>p.planet===str(r.major)),sub=chart.planetPositions.find(p=>p.planet===str(r.planet));
  const start=str(r.startsAtUtc),end=str(r.endsAtUtc);
  if(!major?.house||!sub?.house||major.house<1||major.house>12||sub.house<1||sub.house>12||!Number.isFinite(Date.parse(start))||!(Date.parse(end)>Date.parse(start)))throw Error("REPORT_PERIOD_CONTEXT_INVALID");
  const placement=(p:typeof major)=>term(p.planet)+" / "+term(p.sign)+" / "+house(p.house!)+" ("+theme(p.house!)+")";
  return {label:start+" – "+end,title:term(major.planet)+" / "+term(sub.planet),body:t(["Natal major-period lord: ","जन्म महादशा स्वामी: ","Natal mahadasha lord: "])+placement(major)+". "+t(["Natal sub-period lord: ","जन्म अंतर्दशा स्वामी: ","Natal antardasha lord: "])+placement(sub)+".\n"+t(["Practical reflection: ","व्यावहारिक चिंतन: ","Practical reflection: "])+action(sub.house)};
 }));
 if(["premium-kundli","numerology-lo-shu-report","name-correction-report","baby-name-report","fortune-report"].includes(slug)){
  const dob=chart.birthDetails.dateOfBirth,digits=dob.replace(/\D/g,"").split("").map(Number);
  const reduce=(n:number)=>{const steps=[n];while(n>9&&![11,22,33].includes(n)){n=String(n).split("").reduce((a,b)=>a+Number(b),0);steps.push(n);}return steps.join(" -> ");};
  const cards:EditorialCard[]=[{label:t(["CIVIL BIRTH DATE","स्थानीय जन्म तिथि","Civil birth date"]),title:dob,body:t(["Birth-day reduction: ","जन्म दिन की गणना: ","Birth day reduction: "])+reduce(Number(dob.slice(8,10)))+". "+digits.join(" + ")+" = "+reduce(digits.reduce((a,b)=>a+b,0))+". "+t(["The convention preserves 11, 22 and 33. Date digits are taken from the civil date, not converted to another timezone.","इस विधि में 11, 22 और 33 सुरक्षित रहते हैं। अंक स्थानीय जन्म तिथि से लिए जाते हैं, दूसरे समय क्षेत्र से नहीं।","Method 11, 22 aur 33 preserve karta hai. Digits civil date se hain, doosre timezone se nahi."])}];
  const names=slug==="baby-name-report"?rows(data("name-options")).map(x=>str(x.name)):slug==="name-correction-report"?rows(data("name-comparison")).map(x=>str(x.name)):slug==="fortune-report"?[]:[romanName];
  for(const name of [...new Set(names)].filter(isFullRomanNumerologyName)){
   const e=calculateRomanNameEvidence(name)!;
   const trace=(g:typeof e.vowels)=>g?g.letters.map(x=>x.letter+"="+x.value).join(", ")+"; "+g.steps.join(" -> "):term("Not available");
   cards.push({label:t(["LETTER VALUES","अक्षर मान","Letter values"]),title:name,body:t(["All letters: ","सभी अक्षर: ","All letters: "])+trace(e.all)+"\n"+t(["Vowels (A,E,I,O,U): ","स्वर (A,E,I,O,U): ","Vowels (A,E,I,O,U): "])+trace(e.vowels)+"\n"+t(["Consonants (including Y): ","व्यंजन (Y सहित): ","Consonants (Y samet): "])+trace(e.consonants)+". "+t(["Only A–Z count; empty groups have no number. This symbolic method cannot establish luck, ability or a child's future.","केवल A–Z गिने जाते हैं; खाली समूह का अंक नहीं है। यह विधि भाग्य, क्षमता या बच्चे का भविष्य सिद्ध नहीं करती।","Sirf A–Z count hote hain; empty group ka number nahi hai. Method luck, ability ya bachche ka future prove nahi karta."])});
  }
  add("numerology-arithmetic",["Reproduce your numerical results","अपनी अंक गणना दोहराएँ","Apni numerical calculation repeat karein"],["Arithmetic and spelling are shown explicitly; symbolic interpretations remain separate.","अंक और वर्तनी की गणना स्पष्ट है; प्रतीकात्मक व्याख्या अलग है।","Arithmetic aur spelling explicit hain; symbolic interpretation alag hai."],cards);
 }
 if(slug==="numerology-lo-shu-report"){
  const grid=rows(object(data("lo-shu")).grid),counts=new Map(grid.map(r=>[Number(r.number),Number(r.count)]));
  if(grid.length!==9||counts.size!==9||Array.from({length:9},(_,i)=>i+1).some(n=>!Number.isInteger(counts.get(n))||counts.get(n)!<0))throw Error("REPORT_LO_SHU_GRID_INVALID");
  const lines=[[4,9,2],[3,5,7],[8,1,6],[4,3,8],[9,5,1],[2,7,6],[4,5,6],[2,5,8]];
  add("lo_shu_geometry",["Birth-date grid line audit","जन्म तिथि अंक-पंक्ति विवरण","Birth-date grid line audit"],["These are eight geometric lines of the Lo Shu layout. Counts show only recorded birth-date digits, not personality defects or measured abilities.","ये लो शू की आठ ज्यामितीय रेखाएँ हैं। गिनती केवल जन्म तिथि के अंक बताती है, व्यक्तित्व की कमी या क्षमता नहीं।","Yeh Lo Shu layout ki aath geometric lines hain. Counts sirf birth-date digits hain, personality defects ya measured abilities nahi."],lines.map((line,i)=>{
   const present=line.filter(n=>counts.get(n)!>0),occurrences=line.reduce((s,n)=>s+counts.get(n)!,0);
   return {label:t(["Line ","रेखा ","Line "])+(i+1),title:line.join(" / "),body:t(["Digit frequencies: ","अंकों की आवृत्ति: ","Digit frequencies: "])+line.map(n=>n+" × "+counts.get(n)).join(", ")+". "+t(["Distinct occupied cells: ","उपस्थित खाने: ","Occupied cells: "])+present.length+"/3; "+t(["Total occurrences: ","कुल आवृत्ति: ","Total occurrences: "])+occurrences+". "+t(["Zero means that a digit does not appear in the entered civil date. It is not a deficiency or prediction.","शून्य का अर्थ है कि अंक दी गई स्थानीय जन्म तिथि में नहीं है। यह कमी या भविष्यवाणी नहीं।","Zero ka matlab digit entered civil date mein nahi hai. Yeh deficiency ya prediction nahi."])};
  }));
 }
 for(const key of ["yearly-months","transit-months","node-transits","jupiter-transits","sade-sati-months"]){
  const sample=rows(data(key));if(!sample.length)continue;
  const flat=sample.flatMap(r=>Array.isArray(r.positions)?rows(r.positions).map(p=>({...p,date:r.date})): [r]);
  const byPlanet=new Map<string,R[]>();for(const r of flat){const p=str(r.planet);if(!p)throw Error("REPORT_TRANSIT_PLANET_MISSING");byPlanet.set(p,[...(byPlanet.get(p)??[]),r]);}
  // Show actual changes between sampled endpoints; never infer an ingress
  // timestamp. Yearly report has one personalized checkpoint per month.
  if(slug==="yearly-horoscope-report"){
   add("monthly_natal_review",["Twelve monthly natal-reference reviews","बारह मासिक जन्म भाव संदर्भ","Barah monthly natal-reference reviews"],["Each dated card uses the actual monthly sample. The planet positions are computed; the prompts are optional reflections, not forecasts.","प्रत्येक दिनांकित कार्ड वास्तविक मासिक नमूने पर आधारित है। ग्रह स्थितियाँ गणितीय हैं; चिंतन सुझाव भविष्यवाणी नहीं।","Har dated card actual monthly sample par based hai. Graha positions computed hain; prompts reflection hain, forecast nahi."],sample.map((r,i)=>{
    const current=rows(r.positions),previous=i?rows(sample[i-1].positions):[];
    if(current.length!==5)throw Error("REPORT_YEARLY_CHECKPOINT_INVALID");
    const parts=current.map(p=>{
     const asc=Number(p.houseFromAscendant),moon=Number(p.houseFromMoon),before=previous.find(q=>q.planet===p.planet);
     if(!Number.isInteger(asc)||!Number.isInteger(moon)||asc<1||asc>12||moon<1||moon>12)throw Error("REPORT_TRANSIT_HOUSE_INVALID");
     return term(str(p.planet))+": "+term(str(p.sign))+" / "+house(asc)+" ("+theme(asc)+"); "+term("Moon sign")+" "+house(moon)+(before&&before.sign!==p.sign?" ["+term(str(before.sign))+" → "+term(str(p.sign))+"]":"");
    });
    const sun=current.find(p=>p.planet==="Sun");if(!sun)throw Error("REPORT_YEARLY_SUN_MISSING");
    return {label:str(r.date),title:theme(Number(sun.houseFromAscendant)),body:parts.join("\n")+"\n"+t(["Optional monthly review: ","वैकल्पिक मासिक समीक्षा: ","Optional monthly review: "])+action(Number(sun.houseFromAscendant))};
   }));
  }else{
   const cards:EditorialCard[]=[];
   for(const [p,items] of byPlanet){
    for(let i=1;i<items.length;i++){
     const a=items[i-1],b=items[i];
     if(a.sign===b.sign&&a.houseFromMoon===b.houseFromMoon&&a.houseFromAscendant===b.houseFromAscendant)continue;
     const oldHouse=Number(a.houseFromAscendant),newHouse=Number(b.houseFromAscendant),moon=Number(b.houseFromMoon);
     if([oldHouse,newHouse,moon].some(h=>!Number.isInteger(h)||h<1||h>12))throw Error("REPORT_TRANSIT_CHANGE_INVALID");
     cards.push({label:term(p)+" / "+str(a.date)+" – "+str(b.date),title:term(str(a.sign))+" → "+term(str(b.sign)),body:t(["Lagna-relative reference: ","लग्न से भाव संदर्भ: ","Lagna-relative bhav: "])+house(oldHouse)+" ("+theme(oldHouse)+") → "+house(newHouse)+" ("+theme(newHouse)+"); "+t(["Moon-relative reference at last sample: ","अंतिम नमूने का चंद्र भाव: ","Last sample ka Moon bhav: "])+house(moon)+". "+t(["This brackets a change between observations, not an exact event date. ","यह दो नमूनों के बीच परिवर्तन बताता है, सटीक घटना तिथि नहीं। ","Yeh observations ke beech change hai, exact event date nahi. "])+action(newHouse)});
    }
   }
   if(!cards.length)cards.push({label:t(["Sampled interval","नमूना अवधि","Sampled interval"]),title:str(sample[0].date)+" – "+str(sample.at(-1)?.date),body:t(["The reported signs and relative houses were unchanged at the sampled endpoints. Changes between endpoints are not ruled out. No ingress time is inferred.","नमूना बिंदुओं पर राशियाँ और भाव समान रहे। बीच में परिवर्तन की संभावना से इनकार नहीं किया गया है। सटीक गोचर समय नहीं निकाला गया।","Sample endpoints par signs aur houses unchanged the. Beech ka change rule out nahi hota. Exact ingress time infer nahi kiya."])});
   add("sampled_transition_windows",["Observed changes between checkpoints","नमूना तिथियों के बीच परिवर्तन","Sampled checkpoints ke beech changes"],["Only actual changes between published report samples are listed; no unsupported exact event timing.","केवल वास्तविक नमूना परिवर्तनों का विवरण है; बिना आधार सटीक घटना समय नहीं।","Sirf actual sample changes list hain; unsupported exact event timing nahi."],cards);
  }

  add("transit-context",["Observed monthly positions: two natal lenses","मासिक स्थितियाँ: दो जन्म संदर्भ","Monthly observations: two natal lenses"],["First and last sampled positions are compared. Intermediate samples are in the preceding tables. Noon is at the supplied birth UTC offset, not the future local DST offset. These are not exact ingress or station dates.","पहली और अंतिम नमूना स्थितियाँ तुलना में हैं। बीच की गणनाएँ पिछली तालिका में हैं। दोपहर जन्म के UTC अंतर पर है, भविष्य के डेलाइट सेविंग पर नहीं। ये सटीक गोचर तिथियाँ नहीं हैं।","First aur last sampled positions compare hote hain. Beech ki readings tables mein hain. Noon birth UTC offset par hai, future DST par nahi. Exact ingress ya station dates nahi."],[...byPlanet].map(([p,items])=>{
   const first=items[0],last=items[items.length-1],moon=Number(last.houseFromMoon),asc=Number(last.houseFromAscendant);
   if(!Number.isInteger(moon)||moon<1||moon>12||!Number.isInteger(asc)||asc<1||asc>12)throw Error("REPORT_TRANSIT_HOUSE_INVALID");
   const observed=items.map(x=>str(x.sign)).filter((x,i,a)=>i===0||a[i-1]!==x).map(term).join(" -> ");
   return {label:term(p)+" / "+str(first.date)+" – "+str(last.date),title:observed,body:t(["Observed sign sequence across ","नमूना राशियों का क्रम, ","Observed sign sequence, "])+items.length+t([" checkpoints. Last Moon-relative house: "," गणनाएँ। अंतिम चंद्र भाव: "," checkpoints. Last Moon bhav: "])+moon+" ("+theme(moon)+"); "+t(["Lagna-relative house: ","लग्न से भाव: ","Lagna bhav: "])+asc+" ("+theme(asc)+").\n"+action(moon)};
  }));
 }
 if(!result.length)throw Error("REPORT_DEPTH_EMPTY");
 return result;
}
