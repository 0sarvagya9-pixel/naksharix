import { editorialTerm } from "./editorial-display";
import type { AstrologyLanguage, BirthChartData, PlanetPosition } from "@/lib/astrology/types";

type Text = readonly [string,string,string];
const pick=(l:AstrologyLanguage,t:Text)=>t[l==="hi"?1:l==="hinglish"?2:0];
const H:Text[]=[
 ["Self and learning","स्वयं और सीखना","Self aur learning"],["Speech and resources","वाणी और संसाधन","Speech aur resources"],["Skills and expression","कौशल और अभिव्यक्ति","Skills aur expression"],["Home and foundations","घर और आधार","Home aur foundations"],["Study and creativity","अध्ययन और रचनात्मकता","Study aur creativity"],["Work and routines","कार्य और दिनचर्या","Work aur routines"],["Partnerships","साझेदारी","Partnerships"],["Change and resilience","परिवर्तन और धैर्य","Change aur resilience"],["Values and mentors","मूल्य और मार्गदर्शन","Values aur mentors"],["Career and purpose","करियर और उद्देश्य","Career aur purpose"],["Networks and goals","सहयोग और लक्ष्य","Networks aur goals"],["Rest and reflection","विश्राम और चिंतन","Rest aur reflection"]
];
const PRACTICE:Text[]=[
 ["Review a learning goal and the routines that support it.","सीखने का लक्ष्य और सहायक दिनचर्या देखें।","Learning goal aur supporting routines review karein."],
 ["Review speech, spending and the practical use of your skills.","वाणी, खर्च और कौशल के व्यावहारिक उपयोग की समीक्षा करें।","Speech, spending aur skills ke practical use ko review karein."],
 ["Practice one craft consistently and ask for feedback on communication.","एक कौशल का नियमित अभ्यास करें और संवाद पर प्रतिक्रिया लें।","Ek skill practice karein aur communication feedback lein."],
 ["Balance new commitments with a stable home routine.","नई जिम्मेदारियों के साथ घर की स्थिर दिनचर्या संतुलित रखें।","New commitments ko stable home routine ke saath balance karein."],
 ["Complete a learning or creative project before adding another.","नया काम शुरू करने से पहले एक सीखने या रचनात्मक परियोजना को पूरा करें।","Naye project se pehle ek learning ya creative project complete karein."],
 ["Use checklists, manageable workloads and regular breaks.","सूची, संभालने योग्य कार्यभार और नियमित विश्राम अपनाएँ।","Checklist, manageable workload aur regular breaks rakhein."],
 ["Discuss expectations, consent and mutual responsibilities.","अपेक्षाओं, सहमति और साझा जिम्मेदारियों पर बात करें।","Expectations, consent aur shared responsibilities discuss karein."],
 ["Review risks, support and contingency plans before major changes.","बड़े परिवर्तन से पहले जोखिम, सहयोग और वैकल्पिक योजना देखें।","Major changes se pehle risk aur contingency plan review karein."],
 ["Choose a mentor or course that reflects your values.","अपने मूल्यों के अनुरूप मार्गदर्शक या पाठ्यक्रम चुनें।","Apne values ke hisaab se mentor ya course choose karein."],
 ["Make progress visible through one measurable professional deliverable.","एक मापने योग्य पेशेवर कार्य से प्रगति स्पष्ट करें।","Ek measurable professional deliverable se progress visible karein."],
 ["Invest time in reciprocal, constructive relationships and measurable goals.","परस्पर सहयोगी संबंधों और मापने योग्य लक्ष्यों पर समय दें।","Constructive relationships aur measurable goals par time dein."],
 ["Protect time for rest and review avoidable expenses and obligations.","विश्राम का समय बचाएँ और अनावश्यक खर्च व जिम्मेदारियाँ देखें।","Rest ka time protect karein aur avoidable expenses review karein."]
];
const P:Record<string,Text>={
 Sun:["leadership and accountability","नेतृत्व और जवाबदेही","leadership aur accountability"],
 Moon:["emotional needs and changing priorities","भावनात्मक जरूरतें और बदलती प्राथमिकताएँ","emotional needs aur changing priorities"],
 Mars:["initiative and conflict management","पहल और मतभेद प्रबंधन","initiative aur conflict management"],
 Mercury:["learning and communication","सीखना और संवाद","learning aur communication"],
 Jupiter:["mentorship and principles","मार्गदर्शन और सिद्धांत","mentorship aur principles"],
 Venus:["relationships and creative expression","संबंध और रचनात्मक अभिव्यक्ति","relationships aur creative expression"],
 Saturn:["discipline and patient practice","अनुशासन और धैर्यपूर्ण अभ्यास","discipline aur patient practice"],
 Rahu:["ambition and new experiences","महत्वाकांक्षा और नए अनुभव","ambition aur new experiences"],
 Ketu:["simplicity and reflection","सादगी और आत्मचिंतन","simplicity aur reflection"]
};
const RULER:Record<string,string>={Aries:"Mars",Taurus:"Venus",Gemini:"Mercury",Cancer:"Moon",Leo:"Sun",Virgo:"Mercury",Libra:"Venus",Scorpio:"Mars",Sagittarius:"Jupiter",Capricorn:"Saturn",Aquarius:"Saturn",Pisces:"Jupiter"};
export const YEARLY_PLANNING_HOUSES = [1,2,4,5,6,7,9,10,11,12];
const FOCUS:Record<string,number[]>={"premium-kundli":[1,2,4,5,7,10,11],"career-report":[10,6,2,3,11],"wealth-report":[2,11,12,5,8],"love-report":[7,5,4,8,11],"couple-kundli":[7,4,5],"fortune-report":[9,5,10,11],"yearly-horoscope-report":[10,2,7,6,9],"transit-report":[1,4,7,10],"jupiter-transit-report":[9,5,11],"rahu-ketu-report":[4,10,8],"sade-sati-report":[6,10,12],"manglik-kaal-sarp-report":[7,8,4],"baby-name-report":[5,2],"name-correction-report":[2,3],"numerology-lo-shu-report":[1,5,3]};
export type EditorialCard={label:string;title:string;body:string};
export type EditorialInsights={overview:EditorialCard;cards:EditorialCard[];plan:EditorialCard[];question:EditorialCard;planetNotes:EditorialCard[]};
export function editorialHouse(chart:BirthChartData,n:number,language:AstrologyLanguage){
 const h=chart.housePositions.find(v=>v.house===n);const ps=chart.planetPositions.filter(p=>p.house===n);
 const title=pick(language,H[n-1]??H[0]),ruler=RULER[h?.sign??""],rp=chart.planetPositions.find(p=>p.planet===ruler);
 const placement=ps.length?pick(language,[ps.map(p=>p.planet).join(", ")+" in "+h?.sign+"; traditional themes include "+ps.map(p=>pick(language,P[p.planet]??P.Moon)).join(", ")+".",ps.map(p=>editorialTerm(p.planet,language)).join(", ")+" की "+editorialTerm(h?.sign??"",language)+" में स्थिति; पारंपरिक विषय: "+ps.map(p=>pick(language,P[p.planet]??P.Moon)).join(", ")+"।",ps.map(p=>p.planet).join(", ")+" in "+h?.sign+"; traditional themes: "+ps.map(p=>pick(language,P[p.planet]??P.Moon)).join(", ")+"."]):
 rp?pick(language,["No natal planet here; traditional ruler "+ruler+" is in house "+rp.house+".","यहाँ जन्म ग्रह नहीं है; पारंपरिक स्वामी "+editorialTerm(ruler,language)+" भाव "+rp.house+" में है।","Is house mein koi natal planet nahi; traditional ruler "+ruler+" house "+rp.house+" mein hai."]):pick(language,["No natal planet recorded; the house remains relevant.","यहाँ जन्म ग्रह दर्ज नहीं है; भाव का महत्व बना रहता है।","Natal planet recorded nahi; house relevant hai."]);
 const compact=ps.length?pick(language,PRACTICE[n-1]??PRACTICE[0]):rp?pick(language,["Ruler "+ruler+" in H"+rp.house+". ","स्वामी "+editorialTerm(ruler,language)+" भाव "+rp.house+" में। ","Ruler "+ruler+" H"+rp.house+" mein. "])+pick(language,PRACTICE[n-1]??PRACTICE[0]):pick(language,PRACTICE[n-1]??PRACTICE[0]);
 return {house:n,sign:h?.sign??"",planets:ps.map(p=>p.planet),title,compact,interpretation:placement+" "+pick(language,PRACTICE[n-1]??PRACTICE[0])};
}
function planetNote(p:PlanetPosition,language:AstrologyLanguage):EditorialCard{
 const house=p.house??1;
 return {label:editorialTerm(p.planet,language)+" / "+editorialTerm(p.sign,language)+" / "+editorialTerm("House",language)+" "+house,title:pick(language,P[p.planet]??P.Moon),
 body:pick(language,["The natal "+p.planet+" is in "+p.sign+", house "+house+". Traditionally this brings "+pick(language,P[p.planet]??P.Moon)+" into the theme of "+pick(language,H[house-1]??H[0])+". ","जन्म कुंडली में "+editorialTerm(p.planet,language)+" "+editorialTerm(p.sign,language)+" राशि में भाव "+house+" में है। पारंपरिक संकेत: "+pick(language,P[p.planet]??P.Moon)+"; विषय: "+pick(language,H[house-1]??H[0])+"। ",p.planet+" "+p.sign+" house "+house+" mein hai. Traditional theme: "+pick(language,P[p.planet]??P.Moon)+" aur "+pick(language,H[house-1]??H[0])+". "])+pick(language,PRACTICE[house-1]??PRACTICE[0])};
}
export function buildEditorialInsights(chart:BirthChartData,slug:string,question:string,language:AstrologyLanguage):EditorialInsights{
 const focus=FOCUS[slug]??FOCUS["premium-kundli"];
 const rank=[...focus].sort((a,b)=>chart.planetPositions.filter(p=>p.house===b).length-chart.planetPositions.filter(p=>p.house===a).length||focus.indexOf(a)-focus.indexOf(b));
 const first=editorialHouse(chart,rank[0],language),second=editorialHouse(chart,rank[1],language);
 const main=editorialHouse(chart,focus[0],language);
 const ruler=RULER[main.sign],rulerPos=chart.planetPositions.find(p=>p.planet===ruler);
 const rulerText=rulerPos?pick(language,["The traditional ruler of "+main.sign+", "+ruler+", is in house "+rulerPos.house+" ("+rulerPos.sign+").","राशि "+editorialTerm(main.sign,language)+" का पारंपरिक स्वामी "+editorialTerm(ruler,language)+" भाव "+rulerPos.house+" ("+editorialTerm(rulerPos.sign,language)+") में है।",main.sign+" ka traditional ruler "+ruler+" house "+rulerPos.house+" ("+rulerPos.sign+") mein hai."]):"";
 const overview={label:pick(language,["THE CENTRAL THEME","मुख्य विषय","CENTRAL THEME"]),title:main.title===first.title?main.title:main.title+" / "+first.title,body:pick(language,["This reading begins with house "+main.house+", "+main.title.toLowerCase()+". ","यह अध्ययन भाव "+main.house+" के विषय, "+main.title+", से आरंभ होता है। ","Is reading ka aarambh house "+main.house+" ke topic "+main.title+" se hota hai. "])+rulerText};
 const cards=[{label:pick(language,["01 / PRIMARY FOCUS","01 / मुख्य ध्यान","01 / PRIMARY FOCUS"]),title:first.title,body:first.interpretation},{label:pick(language,["02 / BALANCING THEME","02 / संतुलन","02 / BALANCING THEME"]),title:second.title,body:second.interpretation}];
 const selected=chart.planetPositions.filter(p=>focus.includes(p.house??0));
 const notes=(selected.length?selected:chart.planetPositions).map(p=>planetNote(p,language));
 const plan=rank.slice(0,3).map((n,i)=>({label:pick(language,["DAYS "+(i*30+1)+"-"+(i+1)*30,"दिन "+(i*30+1)+"-"+(i+1)*30,"DAYS "+(i*30+1)+"-"+(i+1)*30]),title:editorialHouse(chart,n,language).title,body:pick(language,["Chart reference: house "+n+". ","कुंडली संदर्भ: भाव "+n+"। ","Chart reference: house "+n+". "])+pick(language,PRACTICE[n-1])+" "+pick(language,["Keep a written progress record; review observable results at the end of this period.","लिखित प्रगति रखें और अवधि के अंत में वास्तविक परिणाम देखें।","Written progress record rakhein aur period ke end mein real results review karein."])}));
 const query=question.trim().toLowerCase();
 const topics=[{re:/career|jobs?\b|work|business|promotion|naukri|karier|karobar|करियर|नौकरी|व्यवसाय/,n:10},{re:/wealth|money|loan|finance|salary|budget|paisa|paise|aamdani|धन|पैसा|आय|बजट/,n:2},{re:/love|marriage|relationship|partner|shaadi|rishta|pyaar|विवाह|प्रेम|रिश्ता|शादी/,n:7},{re:/stud(?:y|ies)|education|exam|padhai|seekhn|पढ़ाई|शिक्षा|अध्ययन/,n:5},{re:/home|family|property|parivaar|parivar|ghar|घर|परिवार|पारिवारिक/,n:4}];
 const topic=topics.find(t=>t.re.test(query));
 const questionHouses=slug==="yearly-horoscope-report"?YEARLY_PLANNING_HOUSES:focus;
 const within=topic&&questionHouses.includes(topic.n);
 const chosen=within?editorialHouse(chart,topic.n,language):main;
 const questionIntro=!query
  ?pick(language,["No question was submitted. A starting point from this reading is ","आपने कोई प्रश्न नहीं दिया। अध्ययन से चिंतन का एक प्रारंभिक विषय है ","Aapne koi question nahi diya. Is reading se ek reflection topic hai "])+chosen.title+". "
  :within
   ?pick(language,["Your question connects to house "+chosen.house+" in this report. ","इस रिपोर्ट में आपका प्रश्न भाव "+chosen.house+" से जुड़ता है। ","Aapka sawaal is report mein house "+chosen.house+" se judta hai. "])
   :topic
    ?pick(language,["Your question concerns "+pick(language,H[topic.n-1])+". This product treats "+main.title+" in detail. Within that scope, ","आपका प्रश्न "+pick(language,H[topic.n-1])+" से संबंधित है। इस रिपोर्ट का विस्तृत विषय "+main.title+" है। इस दायरे में, ","Aapka sawaal "+pick(language,H[topic.n-1])+" se juda hai. Is product ka detailed focus "+main.title+" hai. Is scope mein, "])
    :pick(language,["The chart cannot identify a single reliable answer to this particular question. A related reflection from this product follows. ","कुंडली से इस विशेष प्रश्न का एक निश्चित उत्तर नहीं निकाला जा सकता। इस रिपोर्ट के दायरे में आगे एक चिंतन-विषय है। ","Is particular sawaal ka exact answer chart se tay nahi hota. Is product ke scope mein ek reflection dekhein. "]);
 const questionBody=questionIntro+chosen.interpretation+" "+pick(language,["Use an observed example from your own experience to test whether this traditional theme fits.","अपने अनुभव का एक वास्तविक उदाहरण लेकर देखें कि यह पारंपरिक विषय आपकी स्थिति से कितना मेल खाता है।","Apne experience ka ek real example lekar dekhein ki yeh traditional theme aapki situation par kitni fit hoti hai."]);
 return {overview,cards,plan,question:{label:pick(language,["YOUR QUESTION / REFLECTION","आपका प्रश्न / चिंतन","YOUR QUESTION / REFLECTION"]),title:chosen.title,body:questionBody},planetNotes:notes};
}
