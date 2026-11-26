import "server-only";
import { buildReportBinding } from "./report-quality";
import { LUNAR_FRAME_VERSION } from "@/lib/astrology/own-engine/lahiri-moon";
import {calculateVimshottariDasha,resolveDashaBirthInstant} from "@/lib/astrology/core-calculations";
import {calculateVimshottariPratyantarWindow} from "@/lib/astrology/premium-engine/dasha";
import { buildEditorialInsights,editorialHouse,YEARLY_PLANNING_HOUSES } from "@/lib/reports/editorial-insights";
import {buildReportDepth} from "@/lib/reports/editorial-depth";
import { getNamingSounds } from "./naming-sounds";
import { buildDateNameReport } from "./date-name-report";
import {buildCalendarDepth} from "./numerology-calendar-depth";
import {isFullRomanNumerologyName,calculateRomanNameEvidence} from "@/lib/reports/roman-name";
import { getAstrologyProvider,getActiveAstrologyProviderName } from "@/lib/astrology/provider";
import { calculateInternalTransitSnapshot } from "@/lib/astrology/transit/engine";
import { buildPremiumCompatibilityReport } from "@/lib/matching/kundli-matching";
import { calculateNumerologyReport } from "@/lib/numerology";
import { getManualReport } from "@/lib/manual-catalogue";
import { checkAutomaticInputs, checkDateNameReportInputs, matchesBirthZone, type ReportBirthDetails,type AutomaticReportExtra } from "@/lib/reports/automatic-report-input";
import type { AstrologyBirthInput,AstrologyLanguage,BirthChartData } from "@/lib/astrology/types";
import type { PremiumReportContentResult,PremiumReportContentSection } from "@/lib/reports/premium-report-content-engine";

const SIGNS=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const BOUNDARY="Calculated by the Naksharix internal Lahiri/whole-sign engine. Not independently ephemeris-certified. Astrology and numerology are traditional reflective frameworks, not scientifically established predictions or a substitute for professional advice.";
// Common example spellings, not guaranteed meanings, legal name changes or
// priest-certified naming prescriptions.
const NAME_EXAMPLES:Record<string,string[]>={
 Chu:["Chudamani"],Che:["Chetan","Chetna"],Cho:["Cholan"],La:["Lavanya","Lakshya"],Li:["Lina","Likhit"],Lu:["Luv"],Le:["Lekha"],Lo:["Lokesh"],
 A:["Aarav","Anaya"],I:["Ishaan","Ira"],U:["Uma","Uday"],E:["Esha","Eshan"],O:["Ojas","Om"],Va:["Varun","Vani"],Vi:["Vihaan","Vidya"],Vu:["Vumika"],
 Ve:["Ved","Vedika"],Vo:["Vora"],Ka:["Kavya","Karan"],Ki:["Kiran","Kiaan"],Ku:["Kunal","Kumud"],Gha:["Ghanshyam"],Na:["Naman","Navya"],Cha:["Chaitanya","Charvi"],
 Ke:["Keshav","Ketaki"],Ko:["Komal"],Ha:["Harsh","Hansa"],Hi:["Himanshu","Hiral"],Hu:["Huma"],He:["Hemant","Hema"],Ho:["Homa"],Da:["Daksh","Damini"],
 Di:["Divya","Dinesh"],Du:["Durga","Dushyant"],De:["Dev","Devika"],Do:["Dola"],Ma:["Madhav","Mahi"],Mi:["Mira","Mihir"],Mu:["Mukund","Mukti"],Me:["Meera","Mehul"],
 Mo:["Mohan","Moksha"],Ta:["Tanvi","Tarun"],Ti:["Tina","Tirth"],Tu:["Tulsi","Tushar"],Te:["Tejas","Tejal"],To:["Toshika"],Pa:["Parth","Pallavi"],Pi:["Piyush","Pihu"],
 Pu:["Puja","Punit"],Sha:["Shaurya","Shalini"],Tha:["Tharun"],Pe:["Pehli"],Po:["Poonam"],Ra:["Ravi","Radhika"],Ri:["Riya","Rishi"],Ru:["Rudra","Ruchi"],
 Re:["Reva","Reyansh"],Ro:["Rohan","Roshni"],Ni:["Nikhil","Nisha"],Nu:["Nutan"],Ne:["Neel","Neha"],No:["Nora"],Ya:["Yash","Yamini"],Yi:["Yisha"],Yu:["Yuvraj","Yukti"],
 Ye:["Yesh"],Yo:["Yogesh","Yogita"],Bha:["Bhavna","Bhavesh"],Bhi:["Bhima"],Bhu:["Bhuvan","Bhumi"],Dha:["Dhara","Dhruv"],Pha:["Phalguni"],Bhe:["Bherav"],Bho:["Bhoomi","Bhoj"],
 Ja:["Jai","Janvi"],Ji:["Jiya","Jitendra"],Ju:["Juhi"],Je:["Jeet"],Jo:["Jyoti"],Khi:["Khiraj"],Ga:["Gagan","Gauri"],Gi:["Gita","Girish"],Gu:["Guneet","Gulshan"],Ge:["Geeta"],
 Go:["Gopal","Gomati"],Sa:["Saanvi","Samar"],Si:["Siya","Siddharth"],Su:["Suhani","Surya"],Se:["Seema"],So:["Sonal","Soham"],Jha:["Jhanvi"],Chi:["Chirag","Chitra"]
};
type LocalText=[string,string,string];
const tr=(language:AstrologyLanguage,values:LocalText)=>values[language==="hi"?1:language==="hinglish"?2:0];
function asBirth(b:ReportBirthDetails,language:AstrologyLanguage):AstrologyBirthInput{
  return {...b,timezone:String(b.timezone),language};
}
function signIndex(sign:string|undefined|null){return SIGNS.indexOf(sign??"");}
function relativeHouse(sign:string|null|undefined,base:string|null|undefined){
  const i=signIndex(sign),j=signIndex(base);return i<0||j<0?null:(i-j+12)%12+1;
}
function compactPlanet(p:BirthChartData["planetPositions"][number]){
  return {planet:p.planet,sign:p.sign,house:p.house,degree:p.degree,nakshatra:p.nakshatra,pada:p.pada,retrograde:p.retrograde,speedDegreesPerDay:p.speedDegreesPerDay,motionState:p.motionState};
}
const PLANET_THEMES:Record<string,LocalText>={
 Sun:["leadership and responsibility","नेतृत्व और जिम्मेदारी","leadership aur responsibility"],Moon:["emotions and security","भावनाएँ और सुरक्षा","emotions aur security"],
 Mars:["initiative and conflict management","पहल और मतभेद प्रबंधन","initiative aur conflict management"],Mercury:["learning and communication","सीखना और संवाद","learning aur communication"],
 Jupiter:["learning, mentors and values","ज्ञान, मार्गदर्शन और मूल्य","learning, mentors aur values"],Venus:["relationships and creative expression","संबंध और रचनात्मकता","relationships aur creativity"],
 Saturn:["discipline and sustained effort","अनुशासन और निरंतर प्रयास","discipline aur steady effort"],Rahu:["ambition and unfamiliar experiences","महत्वाकांक्षा और नए अनुभव","ambition aur new experiences"],
 Ketu:["detachment and reflection","वैराग्य और आत्मचिंतन","detachment aur reflection"]
};
function monthDates(now:Date,count:number){
  const y=now.getUTCFullYear(),m=now.getUTCMonth();
  return Array.from({length:count},(_,i)=>new Date(Date.UTC(y,m+i,1)).toISOString().slice(0,10));
}
export async function assembleAutomaticPaidReport(input:{
  slug:string;birth:ReportBirthDetails|Pick<ReportBirthDetails,"name"|"dateOfBirth">;extra:AutomaticReportExtra;question:string;language:AstrologyLanguage;now?:Date
}):Promise<{title:string;content:PremiumReportContentResult}>{
  if(input.slug==="numerology-lo-shu-report"||input.slug==="name-correction-report"){
    const checked=checkDateNameReportInputs(input.slug,input.birth,input.extra);
    if(!checked.ok)throw new Error("REPORT_INPUT_INCOMPLETE");
    const asOf = input.now ?? new Date();
    const built = buildDateNameReport(input.slug,checked.birth,checked.extra,input.question,input.language,asOf);
    built.content.metadata.binding = buildReportBinding({...input, birth:checked.birth, extra:checked.extra}, built.content.sections, asOf, input.slug==="name-correction-report"?"date-name-pythagorean-chaldean-calendar-v1":"date-name-pythagorean-calendar-v1");
    return built;
  }
  const checked=checkAutomaticInputs(input.slug,input.birth,input.extra);
  if(!checked.ok)throw new Error("REPORT_INPUT_INCOMPLETE");
  if(getActiveAstrologyProviderName()!=="own_engine")throw new Error("REPORT_CALCULATION_PROVIDER_UNAVAILABLE");
  const report=getManualReport(input.slug);if(!report)throw new Error("REPORT_UNKNOWN");
  const l=input.language,now=input.now??new Date(),date=now.toISOString().slice(0,10);
  const birth=asBirth(checked.birth,l),provider=getAstrologyProvider();
  const chart=await provider.getBirthChart(birth) as BirthChartData;
  if(chart.calculationMeta?.provider!=="own_engine"||chart.planetPositions.length!==9||!chart.planetPositions.every(p=>typeof p.absoluteLongitude==="number"&&Number.isFinite(p.absoluteLongitude)&&signIndex(p.sign)>=0))
    throw new Error("REPORT_CALCULATION_INVALID");
  const sections:PremiumReportContentSection[]=[];
  const section=(key:string,title:LocalText,data:unknown,limitations:string[]=[],status:PremiumReportContentSection["status"]="available_unverified")=>{
    sections.push({key,title:tr(l,title),data,limitations,status});
  };
  const planet=(name:string)=>chart.planetPositions.find(p=>p.planet===name);
  const selected=(names:string[])=>chart.planetPositions.filter(p=>names.includes(p.planet)).map(compactPlanet);
  const houseReview=(nums:number[])=>nums.map(n=>editorialHouse(chart,n,l));
  const exactDasha=calculateVimshottariDasha(chart.planetPositions,resolveDashaBirthInstant(birth),l,now);
  const dasha={asOf:now.toISOString(),method:exactDasha.method,lunarFrame:LUNAR_FRAME_VERSION,currentMajor:exactDasha.currentMahadasha,currentSubPeriod:exactDasha.currentAntardasha,birthBalanceYears:exactDasha.birthBalanceYears,periods:exactDasha.mahadashas.map(p=>({planet:p.planet,startsAt:p.startsAt,endsAt:p.endsAt,startsAtUtc:p.startsAtUtc,endsAtUtc:p.endsAtUtc,durationYears:p.durationYears})),nextTwelveMonths:exactDasha.mahadashas.flatMap(m=>m.antardashas??[]).filter(p=>Date.parse(p.endsAtUtc??p.endsAt)>now.getTime()&&Date.parse(p.startsAtUtc??p.startsAt)<now.getTime()+365.2425*86400000).map(p=>({major:p.parentPlanet,planet:p.planet,startsAtUtc:p.startsAtUtc,endsAtUtc:p.endsAtUtc,startsAt:p.startsAt,endsAt:p.endsAt}))};
  const timingProducts=new Set(["premium-kundli","career-report","wealth-report","love-report","yearly-horoscope-report","fortune-report"]);
  const moonLongitude=planet("Moon")?.absoluteLongitude;
  const pratyantarWindow=timingProducts.has(input.slug)&&typeof moonLongitude==="number"?calculateVimshottariPratyantarWindow({moonLongitude,birthDateTime:resolveDashaBirthInstant(birth),from:now,to:new Date(now.getTime()+365.2425*86400000)}):[];
  const allAntardashas=input.slug==="premium-kundli"?exactDasha.mahadashas.flatMap(m=>(m.antardashas??[]).map(p=>({major:m.planet,planet:p.planet,startsAtUtc:p.startsAtUtc,endsAtUtc:p.endsAtUtc}))):[];
  const suppliedRoman=checked.extra.romanName||(input.slug==="fortune-report"?"":birth.name);
  // A non-Roman-only name does not establish a Pythagorean name number.
  const nameNumberAvailable=isFullRomanNumerologyName(suppliedRoman);
  const num=calculateNumerologyReport({name:suppliedRoman,dateOfBirth:birth.dateOfBirth,gender:birth.gender,asOf:now,locale:l});
  const includesTransits = ["sade-sati-report","yearly-horoscope-report","transit-report","rahu-ketu-report","jupiter-transit-report"].includes(input.slug);
  const savedZone = checked.extra.birthZone;
  // A historical request may only have a recorded birth offset. Never infer a zone from its place label.
  const transitZone = includesTransits && savedZone && !/^[+-]/.test(savedZone) && matchesBirthZone(checked.birth,savedZone)
    ? savedZone : undefined;
  const transitInput={latitude:birth.latitude,longitude:birth.longitude,timezone:transitZone ?? birth.timezone,place:birth.birthPlace,ayanamsa:"lahiri" as const};
  const snapshot=(on:string,names?:string[])=>{
    const data=calculateInternalTransitSnapshot({...transitInput,date:on});
    const rows=data.positions.filter(p=>!names||names.includes(p.planet)).map(p=>({planet:p.planet,sign:p.sign,degree:p.degree,retrograde:p.retrograde,speedDegreesPerDay:p.speedDegreesPerDay,motionState:p.motionState,houseFromAscendant:relativeHouse(p.sign,chart.avakhada.ascendant),houseFromMoon:relativeHouse(p.sign,chart.avakhada.moonSign)}));
    if(!rows.length||rows.some(p=>p.houseFromAscendant===null||p.houseFromMoon===null))throw new Error("REPORT_TRANSIT_INVALID");
    return {date:on,positions:rows};
  };
  section("birth",["Your birth details and calculation basis","आपके जन्म विवरण और गणना का आधार","Aapki birth details aur calculation basis"],{
    ...(includesTransits ? {transitTimeBasis:transitZone ? "civil_noon" : "fixed_offset_noon",transitTimezone:transitZone ?? birth.timezone} : {}),
    name:birth.name,dateOfBirth:birth.dateOfBirth,timeOfBirth:birth.timeOfBirth,birthPlace:birth.birthPlace,lunarFrame:chart.calculationMeta.lunarFrame,lunarMeanAyanamsaDegree:chart.calculationMeta.lunarMeanAyanamsaDegree,
    latitude:birth.latitude,longitude:birth.longitude,utcOffsetAtBirth:birth.timezone,utcBirthInstant:resolveDashaBirthInstant(birth).toISOString(),ayanamsaDegree:chart.calculationMeta.ayanamsaDegree,ascendantLongitude:chart.calculationMeta.ascendantLongitude,nodeMode:chart.calculationMeta.nodeMode,ascendant:chart.avakhada.ascendant,moonSign:chart.avakhada.moonSign,sunSign:chart.avakhada.sunSign,nakshatra:chart.avakhada.nakshatra,pada:planet("Moon")?.pada,ayanamsa:"Lahiri",houseSystem:"Whole sign",generatedOn:date
  },[BOUNDARY],"provider_verified");
  const question=input.question.trim();
  const insights=buildEditorialInsights(chart,input.slug,question,l);
  const reflection=(key:string,title:LocalText,notes:LocalText[])=>section(key,title,notes.map(n=>tr(l,n)));
  switch(input.slug){
    case "premium-kundli":
      section("planets",["Planet positions","ग्रह स्थिति","Grah positions"],chart.planetPositions.map(compactPlanet),[BOUNDARY],"provider_verified");
      section("houses",["Twelve houses and Navamsa","बारह भाव और नवांश","12 bhav aur Navamsa"],{lagna:houseReview([1,2,3,4,5,6,7,8,9,10,11,12]),navamsa:chart.charts.navamsa});
      section("dasha",["Vimshottari Dasha","विंशोत्तरी दशा","Vimshottari Dasha"],{...dasha,allAntardashas,pratyantarWindow});
      section("panchang",["Birth Panchang","जन्म पंचांग","Birth Panchang"],chart.panchang);
      section("yoga-dosha",["Traditional yoga and dosha indicators","पारंपरिक योग और दोष संकेत","Traditional yoga aur dosha"],{yoga:chart.yogaAnalysis,dosha:chart.doshaAnalysis},["Rule-based indicators, not guarantees or diagnoses."]);
      section("numerology",["Birth number and Lo Shu","मूलांक और लो शू","Moolank aur Lo Shu"],{birthNumber:num.moolank,lifePath:num.lifePath,nameNumber:nameNumberAvailable?num.nameNumber:null,nameNumberUnavailableReason:nameNumberAvailable?null:tr(l,["A complete A–Z name spelling was not supplied; a name number is not calculated.","A–Z अक्षरों में पूरा नाम नहीं दिया गया; नामांक की गणना नहीं की गई है।","A–Z mein poori spelling nahi di gayi; name number calculate nahi hua."]),grid:num.loShuGrid});
      break;
    case "couple-kundli":{
      if(!checked.extra.partner)throw new Error("REPORT_PARTNER_MISSING");
      const other=asBirth(checked.extra.partner,l),otherChart=await provider.getBirthChart(other) as BirthChartData;
      if(otherChart.calculationMeta?.provider!=="own_engine"||otherChart.planetPositions.length!==9)throw new Error("REPORT_PARTNER_CHART_INVALID");
      const match=buildPremiumCompatibilityReport(birth,other,chart,otherChart,l,"private-paid-report");
      if(match.gunaMilan.ashtakoot.length!==8||match.gunaMilan.ashtakoot.some(f=>f.available===false))throw new Error("REPORT_MATCH_FACTORS_INCOMPLETE");
      section("partner",["Second person's birth chart","दूसरे व्यक्ति की जन्म कुंडली","Second person ki birth chart"],{name:other.name,birth:otherChart.birthDetails,moon:otherChart.avakhada,positions:otherChart.planetPositions.map(compactPlanet),houses:otherChart.charts.lagna,primaryHouses:chart.charts.lagna});
      // The paid intake specifies Person 1 and Person 2. Preserve the matching engine's slot order.
      const orderedFactors=match.gunaMilan.ashtakoot.map(factor=>{
        if(factor.kootKey==="tara" && factor.details){
          const forward=factor.details.brideToGroom, reverse=factor.details.groomToBride;
          const explanation=tr(l,[
            `Tara count from Person 1 to Person 2 is ${forward}. The return count is ${reverse}.`,
            `पहले व्यक्ति से दूसरे तक तारा गिनती ${forward} है। दूसरे से पहले तक गिनती ${reverse} है।`,
            `Person 1 se Person 2 tak Tara count ${forward} hai. Vaapas ka count ${reverse} hai.`
          ]);
          return {...factor,explanation,meaning:explanation};
        }
        if(factor.kootKey==="varna"){
          const basis=tr(l,["This traditional rule compares Person 2’s Moon-sign class with Person 1’s.","इस पारंपरिक नियम में दूसरे व्यक्ति की चंद्र-राशि की श्रेणी की तुलना पहले व्यक्ति की श्रेणी से होती है।","Is paramparik rule mein Person 2 ki Chandra rashi ki shreni Person 1 ki shreni se compare hoti hai."]);
          return {...factor,basis,explanation:basis,meaning:basis};
        }
        return factor;
      });
      section("guna",["Ashtakoot / 36-point Guna Milan","अष्टकूट / 36 गुण मिलान","Ashtakoot / 36-point Guna Milan"],{...match.gunaMilan,ashtakoot:orderedFactors},["Traditional compatibility scoring is not a prediction of marriage success."]);
      section("match-dosha",["Manglik, Nadi and Bhakoot context","मांगलिक, नाड़ी और भकूट संदर्भ","Manglik, Nadi aur Bhakoot context"],match.doshaAnalysis);
      section("compatibility-guidance",["Relationship discussion guide","संबंध संवाद मार्गदर्शिका","Relationship discussion guide"],{moon:match.moonCompatibility,nakshatra:match.nakshatraCompatibility,practicalGuidance:match.practicalGuidance,limitations:match.limitationNotes});
      break;}
    case "career-report":
      section("career-houses",["Career, skill and work houses","करियर, कौशल और कार्य भाव","Career, skill aur work houses"],houseReview([2,3,6,10,11]));
      section("career-planets",["Professional indicators","व्यावसायिक ग्रह संकेत","Professional indicators"],selected(["Sun","Mercury","Saturn","Jupiter","Mars"]));
      section("career-dasha",["Current work timing framework","वर्तमान कार्य समय का संदर्भ","Current work timing framework"],{major:dasha.currentMajor,sub:dasha.currentSubPeriod,asOf:dasha.asOf,nextTwelveMonths:dasha.nextTwelveMonths,pratyantarWindow});
      reflection("career-plan",["90-day practical career plan","90 दिन की व्यावहारिक करियर योजना","90-day practical career plan"],[["Days 1–30: Choose one role-relevant skill, establish a baseline and set a measurable weekly learning target.","दिन 1–30: भूमिका से जुड़ा एक कौशल चुनें, शुरुआती स्तर दर्ज करें और साप्ताहिक लक्ष्य तय करें।","Din 1–30: Role se related ek skill chunein, baseline note karein aur weekly target set karein."],["Days 31–60: Complete a practical project, update your portfolio and seek specific feedback.","दिन 31–60: एक व्यावहारिक प्रोजेक्ट पूरा करें, पोर्टफोलियो सुधारें और स्पष्ट प्रतिक्रिया लें।","Din 31–60: Practical project complete karein, portfolio update karein aur specific feedback lein."],["Days 61–90: Compare results against your baseline, track real opportunities and revise the plan before a job change.","दिन 61–90: शुरुआती स्तर से प्रगति की तुलना करें, वास्तविक अवसर देखें और नौकरी बदलने से पहले योजना सुधारें।","Din 61–90: Baseline se progress compare karein, real opportunities track karein aur job change se pehle plan revise karein."]]);
      break;
    case "wealth-report":
      section("wealth-houses",["Income, resources and expenditure houses","आय, संसाधन और व्यय भाव","Income, resources aur expenditure houses"],houseReview([2,5,8,9,11,12]));
      section("wealth-planets",["Money-related traditional indicators","धन से जुड़े पारंपरिक संकेत","Money-related traditional indicators"],selected(["Jupiter","Venus","Mercury","Saturn"]));
      section("wealth-dasha",["Current Dasha context","वर्तमान दशा संदर्भ","Current Dasha context"],{major:dasha.currentMajor,sub:dasha.currentSubPeriod,asOf:dasha.asOf,nextTwelveMonths:dasha.nextTwelveMonths,pratyantarWindow});
      reflection("money-plan",["Financial reflection checklist","वित्तीय आत्मचिंतन सूची","Financial reflection checklist"],[["Track essential expenses and review your emergency reserve before discretionary spending.","जरूरी खर्च लिखें और आपातकालीन बचत की समीक्षा करें।","Essential expenses track karein aur emergency savings review karein."],["Do not make investment, borrowing or trading decisions from this chart; use qualified advice and actual financial data.","कुंडली के आधार पर निवेश, ऋण या ट्रेडिंग न करें; वास्तविक वित्तीय जानकारी और योग्य सलाह लें।","Chart ke basis par investment, loan ya trading na karein; real financial data aur qualified advice use karein."]]);
      break;
    case "love-report":
      section("relationship-houses",["Relationship and emotional context","संबंध और भावनात्मक संदर्भ","Relationship aur emotional context"],houseReview([4,5,7,8,11]));
      section("relationship-planets",["Moon, Venus and Mars","चंद्र, शुक्र और मंगल","Moon, Venus aur Mars"],selected(["Moon","Venus","Mars","Jupiter"]));
      section("relationship-timing",["Dasha context for reflection","आत्मचिंतन के लिए दशा संदर्भ","Reflection ke liye Dasha context"],{major:dasha.currentMajor,sub:dasha.currentSubPeriod,asOf:dasha.asOf,nextTwelveMonths:dasha.nextTwelveMonths,pratyantarWindow});
      reflection("relationship-plan",["Communication and shared values","संवाद और साझा मूल्य","Communication aur shared values"],[["Discuss expectations, boundaries and how each person wants to receive support.","अपेक्षाओं, सीमाओं और सहयोग के तरीके पर खुलकर चर्चा करें।","Expectations, boundaries aur support ke tareeke par khulkar baat karein."],["Judge compatibility by consent, safety, behavior and mutual respect; this one-person report cannot assess another person's feelings.","सहमति, सुरक्षा, व्यवहार और सम्मान को प्राथमिकता दें; यह रिपोर्ट दूसरे व्यक्ति की भावनाएँ नहीं बता सकती।","Consent, safety, behavior aur respect ko priority dein; yeh report kisi aur ke feelings nahi bata sakti."]]);
      break;
    case "baby-name-report":{
      const moon = planet("Moon");
      const quarters = getNamingSounds(chart.avakhada.nakshatra);
      const selectedSound = moon?.pada && quarters?.[moon.pada - 1];
      if (!selectedSound || !quarters) throw new Error("REPORT_NAME_BASIS_MISSING");
      const { spelling: syllable, akshara } = selectedSound;
      const sounds = quarters.map(quarter => quarter.spelling);
      const candidates=[...new Set([...(checked.extra.candidateNames??[]),...(NAME_EXAMPLES[syllable]??[]),...sounds.flatMap(s=>NAME_EXAMPLES[s]??[])])].slice(0,12);
      section("naming",["Nakshatra naming tradition","नक्षत्र नामकरण परंपरा","Nakshatra naming tradition"],{nakshatra:chart.avakhada.nakshatra,pada:moon.pada,traditionalSound:syllable,akshara,otherSounds:sounds},[tr(l,[
        `Drik Panchang’s Swar Siddhanta gives ${akshara} for this quarter. Roman spellings are approximate. Say the name aloud with your family and follow your naming tradition.`,
        `दृक् पंचांग की स्वर सिद्धांत तालिका में इस चरण का अक्षर ${akshara} है। रोमन वर्तनी उच्चारण का संकेत देती है। अपने परिवार के साथ नाम बोलकर देखें और अपनी नामकरण परंपरा के अनुसार चुनें।`,
        `Drik Panchang ki Swar Siddhanta talika mein is charan ka akshar ${akshara} hai. Roman spelling se uchcharan ka andaaza milta hai. Parivaar ke saath naam bolkar apni parampara ke anusaar chunein.`
      ])]);
      const options=candidates.map(name=>({name,startsWithTraditionalSound:name.toLowerCase().startsWith(syllable.toLowerCase()),nameNumber:calculateNumerologyReport({name,dateOfBirth:birth.dateOfBirth,locale:l}).nameNumber}));
      section("name-options",["Candidate name comparison","संभावित नामों की तुलना","Candidate name comparison"],options,["Illustrative spellings, not verified meanings or guarantees; no name determines a child's future."]);
      if(/syllable|starting sound|birth sound|janm sound|naam.*(?:akshar|dhwani)|जन्म ध्वनि|ध्वनि से|नाम का पहला अक्षर/i.test(question)){
        const submitted=checked.extra.candidateNames??[];
        const matches=options.filter(item=>submitted.includes(item.name)&&item.startsWithTraditionalSound).map(item=>item.name);
        const comparison=matches.length?tr(l,[
          `Your proposed spellings beginning with ${syllable}: ${matches.join(", ")}.`,
          `आपके सुझाए नामों में ${syllable} से शुरू होने वाली वर्तनी: ${matches.join(", ")}।`,
          `Aapke diye hue naamon mein ${syllable} se shuru hone wali spellings: ${matches.join(", ")}.`
        ]):submitted.length?tr(l,[
          `None of your proposed spellings begins with ${syllable}.`,
          `आपके सुझाए नामों में से किसी की वर्तनी ${syllable} से शुरू नहीं होती।`,
          `Aapke diye hue naamon mein kisi ki spelling ${syllable} se shuru nahi hoti.`
        ]):tr(l,[
          `No candidate spelling was supplied. Compare the first letters of your shortlist with ${syllable}.`,
          `आपने कोई नाम नहीं सुझाया है। अपनी सूची के नामों की शुरुआत ${syllable} से मिलाएँ।`,
          `Aapne koi naam nahi diya. Apni shortlist ki shuruaat ${syllable} se milaakar dekhein.`
        ]);
        insights.question.title=tr(l,["Traditional starting sound","नाम की पारंपरिक आरंभिक ध्वनि","Naam ki traditional shuruaati dhwani"]);
        insights.question.body=tr(l,[
          `The naming table gives ${syllable} for lunar quarter ${moon.pada}. ${comparison} Say each name aloud with your family to check the pronunciation.`,
          `नामकरण तालिका में चंद्र नक्षत्र के चरण ${moon.pada} की ध्वनि ${syllable} है। ${comparison} परिवार के साथ नाम बोलकर उच्चारण की पुष्टि करें।`,
          `Naamkaran table mein Chandra nakshatra ke charan ${moon.pada} ki dhwani ${syllable} hai. ${comparison} Family ke saath naam bolkar pronunciation check karein.`
        ]);
      }
      section("birth-numerology",["Birth-number context","जन्मांक संदर्भ","Birth-number context"],{moolank:num.moolank,lifePath:num.lifePath});
      break;}
    case "sade-sati-report":{
      const rows=[date,...monthDates(now,13).slice(1)].map(d=>{
        const p=snapshot(d,["Saturn"]).positions[0];
        const h=p.houseFromMoon;const phase=h===12?"Rising / first sign":h===1?"Middle / natal Moon sign":h===2?"Setting / next sign":"Outside three-sign Sade Sati";
        return {...p,date:d,traditionalPhase:phase};
      });
      section("sade-sati-basis",["Saturn and natal Moon","शनि और जन्म चंद्र राशि","Shani aur natal Moon"],{natalMoon:chart.avakhada.moonSign,natalSaturn:compactPlanet(planet("Saturn")!)});
      section("sade-sati-months",["Current phase and 12-month snapshots","वर्तमान चरण और 12 माह की स्थिति","Current phase aur 12-month snapshots"],rows,["Sampled sign positions, not exact ingress or departure times; no predicted loss or misfortune."]);
      reflection("sade-sati-guidance",["Steady routines","स्थिर दिनचर्या","Steady routines"],[["Use the Saturn theme to plan rest, discipline, responsibilities and patient progress; no expensive ritual is required.","शनि के संकेत को विश्राम, अनुशासन और धैर्यपूर्ण प्रगति के चिंतन में उपयोग करें; महँगे अनुष्ठान आवश्यक नहीं।","Shani theme se rest, discipline aur steady progress plan karein; expensive ritual zaroori nahi."]]);
      break;}
    case "manglik-kaal-sarp-report":
      if(!chart.doshaAnalysis)throw new Error("REPORT_DOSHA_UNAVAILABLE");
      section("dosha-positions",["Mars and lunar node positions","मंगल और राहु-केतु स्थिति","Mangal aur Rahu-Ketu positions"],selected(["Mars","Moon","Venus","Rahu","Ketu"]));
      section("manglik",["Manglik rule assessment","मांगलिक नियम आधारित आकलन","Manglik rule assessment"],chart.doshaAnalysis.manglik,["Traditions differ on exceptions and cancellation; no life outcome is guaranteed."]);
      section("kaal-sarp",["Kaal Sarp rule assessment","काल सर्प नियम आधारित आकलन","Kaal Sarp rule assessment"],{assessment:chart.doshaAnalysis.kaalSarp,notes:chart.doshaAnalysis.notes});
      reflection("dosha-guidance",["Practical and respectful guidance","व्यावहारिक और सम्मानजनक मार्गदर्शन","Practical aur respectful guidance"],[["Do not make marriage or health decisions from a dosha label alone. Discuss evidence and actual circumstances; optional prayer is a personal choice.","केवल दोष के आधार पर विवाह या स्वास्थ्य निर्णय न लें। वास्तविक परिस्थितियों पर विचार करें; प्रार्थना व्यक्तिगत विकल्प है।","Sirf dosha label se marriage ya health decision na lein. Actual circumstances dekhein; prayer personal choice hai."]]);
      break;
    case "yearly-horoscope-report":
      section("yearly-dasha",["Dasha framework for the next 12 months","अगले 12 माह का दशा संदर्भ","Next 12 months ka Dasha framework"],{...dasha,pratyantarWindow});
      section("yearly-months",["Twelve monthly planetary snapshots","बारह मासिक ग्रह स्थितियाँ","12 monthly planetary snapshots"],monthDates(now,12).map(d=>snapshot(d,["Sun","Jupiter","Saturn","Rahu","Ketu"])),["First-day snapshots, not a date-specific forecast."]);
      section("yearly-houses",["Yearly planning themes by house","भाव अनुसार वार्षिक योजना विषय","Yearly planning themes by house"],houseReview(YEARLY_PLANNING_HOUSES));
      reflection("yearly-plan",["Quarterly reflection plan","त्रैमासिक आत्मचिंतन योजना","Quarterly reflection plan"],[["Quarter 1 (months 1–3): Set a realistic baseline for priorities, learning, relationships and finances.","पहली तिमाही (माह 1–3): प्राथमिकताओं, शिक्षा, संबंधों और वित्त का वास्तविक शुरुआती स्तर तय करें।","Quarter 1 (months 1–3): Priorities, learning, relationships aur finances ka realistic baseline banayein."],["Quarter 2 (months 4–6): Review progress, seek feedback and adjust commitments to available resources.","दूसरी तिमाही (माह 4–6): प्रगति देखें, प्रतिक्रिया लें और संसाधनों के अनुसार प्रतिबद्धताएँ बदलें।","Quarter 2 (months 4–6): Progress review karein, feedback lein aur resources ke hisaab se commitments adjust karein."],["Quarter 3 (months 7–9): Reassess workload, relationships and spending against actual outcomes.","तीसरी तिमाही (माह 7–9): वास्तविक परिणामों के आधार पर कार्यभार, संबंध और खर्च की समीक्षा करें।","Quarter 3 (months 7–9): Actual outcomes ke hisaab se workload, relationships aur spending review karein."],["Quarter 4 (months 10–12): Record what worked, revise goals and plan the next year using evidence and personal judgment.","चौथी तिमाही (माह 10–12): सफल प्रयास दर्ज करें, लक्ष्य सुधारें और वास्तविक प्रमाण के आधार पर अगला वर्ष तय करें।","Quarter 4 (months 10–12): Jo kaam hua note karein, goals revise karein aur evidence aur personal judgment se agla saal plan karein."]]);
      break;
    case "transit-report":
      section("current-transit",["Current sidereal planetary positions","वर्तमान निरयण ग्रह स्थितियाँ","Current sidereal planetary positions"],snapshot(date));
      section("transit-months",["Six monthly transit checkpoints","छह मासिक गोचर संकेत","6 monthly transit checkpoints"],monthDates(now,7).slice(1).map(d=>snapshot(d,["Sun","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"])),["Reference snapshots; exact station and ingress times are not certified."]);
      section("transit-context",["Natal house context","जन्म भाव संदर्भ","Natal house context"],houseReview([1,4,7,9,10,11]));
      break;
    case "rahu-ketu-report":
      section("natal-nodes",["Natal Rahu–Ketu axis","जन्म राहु-केतु अक्ष","Natal Rahu-Ketu axis"],selected(["Rahu","Ketu"]),["Mean lunar nodes are used."]);
      section("node-transits",["Current and monthly node placements","वर्तमान और मासिक राहु-केतु स्थिति","Current aur monthly Rahu-Ketu placements"],[date,...monthDates(now,13).slice(1)].map(d=>snapshot(d,["Rahu","Ketu"])));
      reflection("node-guidance",["Balance ambition and detachment","महत्वाकांक्षा और वैराग्य का संतुलन","Ambition aur detachment balance"],[["Review where you seek novelty and where you prefer simplicity. Use a journal and grounded decisions instead of fear-based predictions.","नवीनता और सादगी की अपनी प्राथमिकताओं पर विचार करें। भय आधारित भविष्यवाणी के बजाय विचार लेखन और व्यावहारिक निर्णय अपनाएँ।","Novelty aur simplicity ki priorities review karein. Fear-based prediction ki jagah journal aur grounded decisions use karein."]]);
      break;
    case "jupiter-transit-report":
      section("natal-jupiter",["Natal Jupiter","जन्म गुरु स्थिति","Natal Jupiter"],selected(["Jupiter"]));
      section("jupiter-transits",["Current and 12 monthly Jupiter placements","वर्तमान और 12 मासिक गुरु गोचर","Current aur 12 monthly Jupiter placements"],[date,...monthDates(now,13).slice(1)].map(d=>snapshot(d,["Jupiter"])),["Snapshots do not establish exact ingress dates or guarantee favorable outcomes."]);
      reflection("jupiter-guidance",["Learning and growth reflection","ज्ञान और विकास का चिंतन","Learning aur growth reflection"],[["Select a learning goal, mentor or service activity. Check your resources and commitments before expanding them.","सीखने का लक्ष्य, मार्गदर्शक या सेवा चुनें। विस्तार से पहले संसाधन और प्रतिबद्धताएँ देखें।","Learning goal, mentor ya service choose karein. Expand karne se pehle resources aur commitments check karein."]]);
      break;
    case "fortune-report":
      section("fortune-houses",["Traditional fortune and opportunity houses","पारंपरिक भाग्य और अवसर भाव","Traditional fortune aur opportunity houses"],houseReview([1,5,9,10,11]));
      section("fortune-planets",["Sun, Jupiter, Saturn and Moon","सूर्य, गुरु, शनि और चंद्र","Sun, Jupiter, Saturn aur Moon"],selected(["Sun","Jupiter","Saturn","Moon"]));
      section("fortune-dasha",["Current Dasha and life-path context","वर्तमान दशा और जीवन पथ संदर्भ","Current Dasha aur life-path context"],{major:dasha.currentMajor,sub:dasha.currentSubPeriod,asOf:dasha.asOf,nextTwelveMonths:dasha.nextTwelveMonths,pratyantarWindow,birthNumber:num.moolank,lifePath:num.lifePath});
      section("lo-shu",["Your birth-date grid","आपका जन्मांक मानचित्र","Aapka birth-date grid"],{grid:num.loShuGrid,missing:num.missingNumbers,repeated:num.repeatedNumbers});
      {
        const evidence=calculateRomanNameEvidence(suppliedRoman);
        const numbers={moolank:num.moolank,lifePath:num.lifePath};
        if(evidence){
          section("numerology-profile",["Name and birth numbers","नाम और जन्म अंक","Naam aur janm ank"],{
            ...numbers,nameNumber:num.nameNumber,soulUrge:evidence.vowels?num.soulUrge:null,personality:evidence.consonants?num.personality:null
          });
        }else{
          section("numerology-profile",["Birth numbers","जन्म तिथि के अंक","Janm tithi ke ank"],numbers,[tr(l,[
            "This order has no separately confirmed Roman-letter spelling. The numerical reading here uses your birth date only.",
            "इस आदेश में रोमन अक्षरों में नाम की वर्तनी की अलग से पुष्टि नहीं है। यहाँ की अंक गणना केवल आपकी जन्म तिथि पर आधारित है।",
            "Is order mein Roman letters mein naam ki spelling alag se confirm nahi hui thi. Yahan sirf aapki janm tithi se ank nikale gaye hain."
          ])]);
        }
      }
      {
        const day=Number(num.dateOfBirth.slice(-2));
        const birthNumber=num.moolank.value,lifePath=num.lifePath.value;
        const pair:LocalText=birthNumber===lifePath?[
          "The two calculations converge here. Look for one occasion when the shared theme helped and one when circumstances outweighed it.",
          "यहाँ दोनों गणनाओं का अंतिम अंक समान है। एक प्रसंग याद करें जिसमें यह विषय उपयोगी लगा और दूसरा जिसमें परिस्थिति का असर अधिक था।",
          "Yahaan dono gananaon ka aakhiri ank ek hai. Ek mauka yaad karein jab yeh vishay kaam aaya aur ek jab halaat ka asar zyada tha.",
        ]:[
          "The two calculations emphasize different themes. Pick one real opportunity and write a separate question from each viewpoint before choosing a next step.",
          "दोनों गणनाओं में अलग-अलग विषय सामने आते हैं। एक वास्तविक अवसर चुनें। अगला कदम तय करने से पहले दोनों दृष्टियों से एक-एक प्रश्न लिखें।",
          "Dono gananaon mein alag vishay saamne aate hain. Ek asli mauka chunein aur agla kadam tay karne se pehle dono nazariyon se ek-ek sawaal likhein.",
        ];
        reflection("fortune-plan",["Build opportunities through action","प्रयास से अवसर बनाएँ","Apne prayaas se avsar banaayein"],[[
          `Your birth day ${day} gives birth number ${birthNumber}; your full date ${num.dateOfBirth} gives life path ${lifePath}. Use the birth-number table to check both results.`,
          `जन्म के दिन ${day} से मूलांक ${birthNumber} है। पूरी जन्मतिथि ${num.dateOfBirth} से जीवन पथ अंक ${lifePath} है। दोनों परिणाम आगे दिए अंक-विवरण से मिलाएँ।`,
          `Janm ka din ${day} lene par moolank ${birthNumber} hai. Puri janm tithi ${num.dateOfBirth} se jeevan path ank ${lifePath} hai. Dono ko report ke ank-vivaran se milaayein.`,
        ],pair]);
      }
      break;
    default:throw new Error("REPORT_UNKNOWN");
  }
  const depth=buildReportDepth(chart,input.slug,sections,l,suppliedRoman);
  if(input.slug==="fortune-report")depth.push(...buildCalendarDepth(num,l));
  section("editorial-depth",["Calculation-led detailed reading","गणना आधारित विस्तृत विवेचन","Calculation-led detailed reading"],depth,["Traditional interpretations are not causal or predictive certification."]);
  section("editorial-insights",["Personal interpretation and reflection plan","व्यक्तिगत व्याख्या और चिंतन योजना","Personal interpretation aur reflection plan"],insights,["Traditional interpretations are not scientific predictions; no outcome is guaranteed."]);
  section("your-question",["Your submitted question and reflection","आपका प्रश्न और आत्मचिंतन","Aapka question aur reflection"],{
    submittedQuestion:question,focus:insights.question.body
  });
  section("trust",["Important notes and support","महत्वपूर्ण सूचना और सहायता","Important notes aur support"],tr(l,[BOUNDARY,"यह रिपोर्ट नक्षरिक्ष की आंतरिक लाहिड़ी गणना और पारंपरिक नियमों पर आधारित आत्मचिंतन सामग्री है। बाहरी स्वतंत्र प्रमाणीकरण नहीं हुआ है। यह पेशेवर सलाह या निश्चित भविष्यवाणी नहीं है।","Yeh Naksharix internal Lahiri calculation aur traditional rules par based reflection report hai. Independent certification nahi hai; yeh professional advice ya guaranteed prediction nahi."]),["Care: care@naksharix.com | www.naksharix.com"]);
  if(sections.length<5||sections.some(s=>s.data==null))throw new Error("REPORT_CONTENT_INCOMPLETE");
  return {title:report.name[l],content:{sections,metadata:{binding:buildReportBinding({...input,birth:checked.birth,extra:checked.extra},sections,now,includesTransits ? "naksharix-own-lahiri-moon-v2-transit-noon-v2" : "naksharix-own-lahiri-moon-v2-whole-sign-v1"),reportCompleteness:"partial_internal",verified:false,premiumComplete:false,providerVerifiedSections:sections.filter(s=>s.status==="provider_verified").map(s=>s.key),unavailableSections:[],limitations:[BOUNDARY]}}};
}
