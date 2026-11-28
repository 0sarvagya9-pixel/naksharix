import { calculateNumerologyReport } from "@/lib/numerology";
import { chaldeanLetterValue } from "@/lib/digital-packages/business-names";
import type { AstrologyLanguage } from "@/lib/astrology/types";
import { getManualReport } from "@/lib/manual-catalogue";
import type { AutomaticReportExtra, ReportBirthDetails } from "./automatic-report-input";
import { buildNumerologyDepth } from "./editorial-depth";
import {buildCalendarDepth} from "./numerology-calendar-depth";
import type { EditorialCard, EditorialInsights } from "./editorial-insights";
import { calculateRomanNameEvidence } from "./roman-name";
import type { PremiumReportContentResult, PremiumReportContentSection } from "./premium-report-content-engine";

type LocalText=[string,string,string];
export function buildDateNameReport(
  slug:"numerology-lo-shu-report"|"name-correction-report", birth:Pick<ReportBirthDetails,"name"|"dateOfBirth">,
  extra:AutomaticReportExtra, question:string, l:AstrologyLanguage, now:Date
):{title:string;content:PremiumReportContentResult}{
  const idx=l==="en"?0:l==="hi"?1:2;
  const t=(copy:LocalText)=>copy[idx];
  const name=extra.romanName;
  const nameEvidence=calculateRomanNameEvidence(name);
  if(!name||!nameEvidence)throw Error("REPORT_NAME_ARITHMETIC_INVALID");
  const report=getManualReport(slug);
  if(!report)throw Error("REPORT_UNKNOWN");
  const num=calculateNumerologyReport({name,dateOfBirth:birth.dateOfBirth,locale:l,asOf:now});
  if(!num.nameNumber)throw Error("REPORT_NAME_ARITHMETIC_INVALID");
  const confirmedNameNumber=num.nameNumber;
  const sections:PremiumReportContentSection[]=[];
  const section=(key:string,title:LocalText,data:unknown,limitations:string[]=[])=>{
    sections.push({key,title:t(title),data,limitations,status:"available_unverified"});
  };
  const reflection=(key:string,title:LocalText,notes:LocalText[])=>section(key,title,notes.map(t));
  section("birth",["Date and name used","गणना में प्रयुक्त तिथि और नाम","Calculation mein istemal ki gayi date aur naam"],{
    name:birth.name,dateOfBirth:birth.dateOfBirth,romanName:name,generatedOn:num.calendar.asOf,calculationBasis:"date_name_only",
    nameMethod:slug==="name-correction-report"?nameEvidence.method+"__chaldean_1_to_8_single_digit":nameEvidence.method,calendarMethod:num.calendar.method
  });
  switch(slug){
    case "numerology-lo-shu-report":
      section("numerology-profile",["Personal numerology profile","व्यक्तिगत अंक ज्योतिष प्रोफ़ाइल","Personal numerology profile"],{moolank:num.moolank,lifePath:num.lifePath,destiny:num.destiny,nameNumber:num.nameNumber,soulUrge:nameEvidence.vowels?num.soulUrge:null,personality:nameEvidence.consonants?num.personality:null},[t(["Vowel-only and consonant-only numbers are unavailable if the corresponding letter group is empty. Y is treated as a consonant in this named method.","स्वर या व्यंजन समूह खाली होने पर संबंधित अंक उपलब्ध नहीं है। इस विधि में Y को व्यंजन माना जाता है।","Vowel ya consonant group empty ho to corresponding number available nahi hai. Is method mein Y consonant hai."])]);
      section("lo-shu",["Lo Shu grid and missing/repeated digits","लो शू ग्रिड और अनुपस्थित/दोहराए अंक","Lo Shu grid aur missing/repeated digits"],{grid:num.loShuGrid,missing:num.missingNumbers,repeated:num.repeatedNumbers});
      section("numerology-guidance",["Reflection and daily practices","आत्मचिंतन और दैनिक अभ्यास","Reflection aur daily practices"],num.remedies,[num.disclaimer]);
      break;
    case "name-correction-report":{
      const current=name;
      const candidates=[...new Set([current,...(extra.candidateNames??[])])];
      section("current-name",["Current name and birth numbers","वर्तमान नाम और जन्म अंक","Current name aur birth numbers"],{current,number:num.nameNumber,birthNumber:num.moolank,lifePath:num.lifePath});
      section("name-comparison",["Compare proposed spellings","प्रस्तावित वर्तनी की तुलना","Proposed spellings compare karein"],candidates.map(name=>{const r=calculateNumerologyReport({name,dateOfBirth:birth.dateOfBirth,asOf:now,locale:l});const evidence=calculateRomanNameEvidence(name);if(!evidence)throw Error("REPORT_NAME_ARITHMETIC_INVALID");return {name,nameNumber:r.nameNumber,soulUrge:evidence.vowels?r.soulUrge:null,personality:evidence.consonants?r.personality:null};}),["Numerology is a symbolic comparison, not proof that a spelling changes luck.",t(["An empty vowel or consonant group has no corresponding number; Y counts as a consonant in this method.","खाली स्वर या व्यंजन समूह का अंक नहीं निकाला जाता। इस विधि में Y व्यंजन है।","Empty vowel ya consonant group ka number nahi nikala jata. Y is method mein consonant hai."])]);
      reflection("name-guidance",["Name choice checklist","नाम चयन सूची","Name choice checklist"],[["Consider pronunciation, personal identity and spelling consistency. No legal name change is needed for symbolic reflection.","उच्चारण, व्यक्तिगत पहचान और वर्तनी की स्थिरता पर विचार करें। प्रतीकात्मक चिंतन के लिए कानूनी नाम बदलना जरूरी नहीं।","Pronunciation, personal identity aur spelling consistency consider karein. Legal name change zaroori nahi."]]);
      break;}
  }
  const depth=buildNumerologyDepth(slug,birth.dateOfBirth,sections,l,name);
  if(slug==="name-correction-report"){
    const spellings=[...new Set([name,...extra.candidateNames??[]])];
    const cards=spellings.map(spelling=>{
      const py=calculateRomanNameEvidence(spelling)!;
      const letters=py.all.letters.map(({letter})=>({letter,value:chaldeanLetterValue(letter)}));
      const total=letters.reduce((sum,x)=>sum+x.value,0),root=1+(total-1)%9;
      const trace=letters.map(x=>x.letter+"="+x.value).join(" + ");
      return {label:t(["Spelling","वर्तनी","Spelling"]),title:spelling,body:
        t(["Pythagorean compound and root","पाइथागोरियन योग और मूल","Pythagorean compound aur root"])+" "+py.all.sum+" / "+py.all.number+". "+
        t(["Chaldean letter values","कैल्डियन अक्षर मान","Chaldean letter values"])+" "+trace+" = "+total+". "+
        t(["Chaldean single-digit root","कैल्डियन एकल मूल अंक","Chaldean single-digit root"])+" "+root+"."};
    });
    depth.push({key:"name-method-comparison",title:t(["Two methods for each spelling","हर वर्तनी के लिए दो विधियाँ","Har spelling ki do vidhiyan"]),
      intro:t(["Pythagorean totals preserve 11, 22 and 33. The Chaldean table assigns letters to 1–8 and reduces each total to one digit. Each result depends on the selected alphabet and spelling.","पाइथागोरियन विधि में 11, 22 और 33 बने रहते हैं। कैल्डियन तालिका अक्षरों को 1 से 8 तक मान देती है और योग को एक अंक तक घटाती है। परिणाम चुनी गई तालिका और वर्तनी पर निर्भर है।","Pythagorean method 11, 22 aur 33 preserve karta hai. Chaldean table letters ko 1–8 deta hai aur total ko ek digit tak reduce karta hai. Result chosen table aur spelling par depend karta hai."]),cards});
  }
  depth.push(...buildCalendarDepth(num,l));
  section("editorial-depth",["Your calculation record","आपका गणना विवरण","Aapki calculation ka record"],depth);
  const profileCard=(value:typeof num.moolank):EditorialCard=>({label:value.label,title:String(value.value),body:value.meaning+" "+value.guidance});
  const nameCard=profileCard(confirmedNameNumber);
  const planLabel=t(["Practice","अभ्यास","Abhyas"]);
  const focus=slug==="name-correction-report"?nameCard:profileCard(num.lifePath);
  const cycleLabel=t(["Personal month","व्यक्तिगत माह","Personal month"])+" "+num.calendar.personalMonth+" ("+num.calendar.asOf.slice(0,7)+").";
  const questionCard=():EditorialCard=>{
    const label=t(["Your reflection","आपका चिंतन","Aapka reflection"]);
    const card=(title:string,body:string)=>({label,title,body});
    const q=question.trim().toLowerCase();
    if(!q){
      return card(t(["A question for your journal","डायरी के लिए एक प्रश्न","Diary ke liye ek sawaal"]),
        num.moolank.label+" "+num.moolank.value+". "+t(["Describe one recent choice that fits this theme and one that does not. Which circumstances explain the difference?","एक हालिया निर्णय लिखें जो इस संकेत से मिलता हो और एक जो अलग हो। किन परिस्थितियों से अंतर आया?","Ek recent decision likhein jo is theme se milta ho aur ek jo alag ho. Kin circumstances se farq aaya?"]));
    }
    if(/health|medical|diagnos|medicine|illness|sehat|dawai|बीमार|दवा|स्वास्थ्य|रोग|इलाज/.test(q)){
      return card(t(["Health question","स्वास्थ्य संबंधी प्रश्न","Sehat ka sawaal"]),t(["Date and letter totals cannot evaluate symptoms or choose treatment. Describe the concern to a qualified health professional.","तिथि और अक्षरों के योग से लक्षणों का आकलन या उपचार का चयन नहीं किया जा सकता। अपनी चिंता योग्य स्वास्थ्य पेशेवर से साझा करें।","Date aur letters ke totals symptoms ya treatment decide nahi kar sakte. Apni concern qualified health professional se discuss karein."]));
    }
    if(/financial|money|invest|loan|income|salary|paisa|paise|निवेश|धन|पैस|आय|वेतन|ऋण/.test(q)){
      return card(t(["Resources and planning","संसाधन और योजना","Resources aur planning"]),cycleLabel+" "+t(["Use this month's review to write down actual income, obligations and available savings. The cycle cannot estimate return, affordability or the chance of a gain.","इस माह की समीक्षा में वास्तविक आय, देनदारियाँ और उपलब्ध बचत लिखें। इस चक्र से लाभ, वहन क्षमता या प्रतिफल का अनुमान नहीं लगाया जा सकता।","Is month ke review mein actual income, obligations aur savings likhein. Cycle se return ya affordability ka andaaza nahi lagta."]));
    }
    if(/\b(?:study|studies|studying|homework|school|exam|exams|padhai|padhaai|pariksha)\b|पढ़ाई|पढाई|अध्ययन|परीक्षा|गृहकार्य/.test(q)){
      return card(t(["Tracking your studies","पढ़ाई की प्रगति","Padhai ki progress"]),cycleLabel+" "+t([
        "Use the calendar month as a reminder to review one learning goal. Try two comparable practice tasks a week apart and record the kinds of errors you made. Date and name numbers cannot measure learning ability or predict exam results.",
        "इस माह पढ़ाई का एक लक्ष्य चुनें। एक सप्ताह के अंतर पर समान कठिनाई वाले दो अभ्यास करें और दोनों में हुई गलतियों के प्रकार लिखें। जन्म तिथि और नाम के अंकों से सीखने की क्षमता या परीक्षा का परिणाम तय नहीं होता।",
        "Is mahine padhai ka ek goal chunein. Ek hafte ke fark par barabar mushkil wale do practice tasks karein aur dono mein hui galtiyan likhein. Date aur naam ke numbers learning ability ya exam results nahi bata sakte."
      ]));
    }
    if(/career|work|job|business|profession|naukri|kaam|करियर|व्यवसाय|नौकरी|काम|पेशा/.test(q)){
      return card(t(["Work and professional choices","काम और पेशेवर विकल्प","Kaam aur career"]),num.lifePath.label+" "+num.lifePath.value+" · "+num.lifePath.meaning+" "+t(["Test this theme against two recent pieces of work. Ask a colleague for an example of when it helped and when a different approach was needed.","अपने हाल के दो कार्यों में इस संकेत को परखें। किसी सहकर्मी से पूछें कि यह कब सहायक रहा और कब अलग तरीका जरूरी था।","Is theme ko apne do recent projects se compare karein. Colleague se poochhein kab yeh approach helpful thi aur kab doosra tareeka chahiye tha."]));
    }
    if(/relationship|marry|marriage|partner|family|shaadi|risht|shadi|रिश्त|शादी|विवाह|परिवार|पारिवारिक/.test(q)){
      const indicator=num.soulUrge??num.moolank;
      return card(t(["Relationships and communication","संबंध और संवाद","Rishte aur baatcheet"]),indicator.label+" "+indicator.value+" · "+indicator.meaning+" "+t(["Identify one preference you want to communicate. Ask the other person about theirs without inferring it from your own number.","अपनी एक प्राथमिकता पहचानें जिसे आप साझा करना चाहते हैं। दूसरे व्यक्ति की प्राथमिकता उनसे पूछें, अपने अंक से उसका अनुमान न लगाएँ।","Apni ek preference choose karein jo aap share karna chahte hain. Doosre vyakti ki preference unse poochhein; apne number se assume na karein."]));
    }
    if(slug==="name-correction-report"&&/name|spell|naam|नाम|वर्तनी/.test(q)){
      const candidates=extra.candidateNames??[];
      const named=candidates.find(n=>q.includes(n.toLowerCase()))??candidates[0];
      const other=calculateRomanNameEvidence(named);
      if(other){
        const terms=name+" ("+nameEvidence.all.sum+" -> "+nameEvidence.all.number+") / "+named+" ("+other.all.sum+" -> "+other.all.number+"). ";
        return card(t(["Compare the two spellings","दो वर्तनियों की तुलना","Dono spellings ka comparison"]),terms+t(["These are letter sums under the same method. Say each spelling aloud and check how it will appear on documents before choosing.","ये एक ही विधि से निकले अक्षर-योग हैं। चयन से पहले दोनों नाम बोलकर देखें और जाँचें कि वे दस्तावेजों पर कैसे लिखे जाएँगे।","Yeh ek hi method ke letter totals hain. Choose karne se pehle dono names bolkar dekhein aur documents par spelling check karein."]));
      }
    }
    return card(t(["Applying this reading to your question","अपने प्रश्न के संदर्भ में पठन","Apne sawaal ke sandarbh mein"]),confirmedNameNumber.label+" "+confirmedNameNumber.value+" · "+confirmedNameNumber.meaning+" "+t(["Name one assumption in your question. Find an example from your experience that supports it and one that challenges it before deciding what to do.","अपने प्रश्न में एक धारणा पहचानें। आगे का कदम चुनने से पहले अपने अनुभव से उसके पक्ष और विपक्ष का एक-एक उदाहरण खोजें।","Apne question ka ek assumption pehchanein. Decision se pehle apne experience se uske favour aur against ek-ek example dhoondhein."]));
  };
  const response=questionCard();
  const exercise=(title:LocalText,body:LocalText):EditorialCard=>({label:planLabel,title:t(title),body:t(body)});
  const dailyPlan:EditorialCard[]=[];
  if(slug==="name-correction-report"){
    const spellings=[...new Set([name,...(extra.candidateNames??[])])];
    for(const spelling of spellings){
      const evidence=calculateRomanNameEvidence(spelling)!;
      const letters=evidence.all.letters.map(item=>item.letter).join(" ");
      const sum=evidence.all.sum, root=evidence.all.number;
      dailyPlan.push({label:planLabel,title:spelling,body:t([
        `Read these letters back: ${letters}. Their Pythagorean total is ${sum} and the reported number is ${root}. Try the spelling aloud before choosing how to write it.`,
        `गणना में लिए गए अक्षर हैं ${letters}। इनका पाइथागोरियन योग ${sum} और अंतिम अंक ${root} है। नाम कैसे लिखना है, यह तय करने से पहले उसे बोलकर देखें।`,
        `Ginti mein ye akshar aaye: ${letters}. Inka Pythagorean yog ${sum} aur aakhiri ank ${root} hai. Spelling chunne se pehle naam bolkar dekhein.`,
      ])});
    }
  }else{
    const counts=num.loShuGrid.filter(cell=>cell.present).map(cell=>`${cell.number} × ${cell.count}`).join(", ");
    const missing=num.missingNumbers.map(item=>item.value).join(", ");
    dailyPlan.push(exercise(["Rebuild your birth-date grid","अपनी जन्मतिथि का ग्रिड बनाएँ","Apni janm tithi ka grid banaayein"],[
      `Write ${birth.dateOfBirth} as digits. Set aside zeroes and tally the remaining digits. Your occupied cells are ${counts}.`,
      `जन्मतिथि ${birth.dateOfBirth} के अंक लिखें। शून्य अलग रखकर बाकी अंकों की आवृत्ति गिनें। भरे हुए खाने हैं ${counts}।`,
      `Janm tithi ${birth.dateOfBirth} ke ank likhein. Shunya alag rakhkar baaki ankon ki ginti karein. Bhare hue khaane hain ${counts}.`,
    ]));
    dailyPlan.push(exercise(["Read the empty cells","खाली खाने पढ़ें","Khaali khaane padhein"],[
      `Digits absent from this date: ${missing}. Check each against the date you wrote. A blank cell records a count of zero and says nothing about a person's ability.`,
      `इस तिथि में अनुपस्थित अंक हैं ${missing}। अपनी लिखी तिथि से इन्हें मिलाएँ। खाली खाने का अर्थ है अंक की गिनती शून्य होना। इससे किसी व्यक्ति की क्षमता नहीं आँकी जा सकती।`,
      `Is tithi mein ye ank nahi aaye: ${missing}. Apni likhi tareekh se inhein milaayein. Khaali khaana bas shunya ginti dikhaata hai. Isse kisi ki kshamata tay nahi hoti.`,
    ]));
    dailyPlan.push(exercise(["Compare two different inputs","दो अलग गणनाएँ मिलाएँ","Do alag gananaayein milaayein"],[
      `The birth-date digits give life path ${num.lifePath.value}. The confirmed spelling ${name} gives name number ${confirmedNameNumber.value}. Circle the inputs that would change if the spelling changed.`,
      `जन्मतिथि के अंकों से जीवन पथ अंक ${num.lifePath.value} और पुष्ट वर्तनी ${name} से नामांक ${confirmedNameNumber.value} है। पहचानें कि वर्तनी बदलने पर किस गणना के इनपुट बदलेंगे।`,
      `Janm tithi ke ankon se jeevan path ank ${num.lifePath.value} hai. Pusht spelling ${name} se naamank ${confirmedNameNumber.value} hai. Dekhein ki spelling badalne par kis ganana ke akshar badlenge.`,
    ]));
  }
  const insights:EditorialInsights={
    overview:focus,cards:[profileCard(num.moolank),slug==="name-correction-report"?profileCard(num.lifePath):nameCard],
    plan:dailyPlan,
    question:response,planetNotes:[]
  };
  section("editorial-insights",["Personal reflection","व्यक्तिगत चिंतन","Personal reflection"],insights);
  section("your-question",["Your question","आपका प्रश्न","Aapka sawaal"],{submittedQuestion:question.trim(),focus:response.body});
  section("trust",["Calculation limits","गणना की सीमाएँ","Calculation ki seema"],num.disclaimer);
  return {title:report.name[l],content:{sections,metadata:{
    reportCompleteness:"partial_internal",verified:false,premiumComplete:false,providerVerifiedSections:[],unavailableSections:[],limitations:[num.disclaimer]
  }}};
}
