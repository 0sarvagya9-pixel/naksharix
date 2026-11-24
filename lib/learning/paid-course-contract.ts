/** Formative learning checks, not accredited examinations. Answer keys remain server-side. */
export const COURSE_KEY="astrology-course";
export const COURSE_VERSION="v1";
type Question={prompt:string;choices:readonly [string,string,string];correct:0|1|2;explanation:string};
type Module={id:string;objective:string;caseStudy:string;questions:readonly [Question,Question]};
export const courseModules:readonly Module[]=[
 {id:"civil-time",objective:"Convert local civil birth times into UTC and document uncertainty.",caseStudy:"A fictional birth record says 00:40 on 3 June at UTC+05:30. The corresponding UTC instant is 19:10 on 2 June. If a family knows only the approximate hour, retain the uncertainty instead of adding invented minutes.",questions:[
 {prompt:"02:00 at UTC+05:30 on 12 March corresponds to which UTC instant?",choices:["07:30 on 12 March","20:30 on 11 March","20:30 on 12 March"],correct:1,explanation:"Subtract the positive offset, including the date rollover."},
 {prompt:"A recorded local time falls in a repeated daylight-saving hour. What should you do?",choices:["Confirm the actual offset or mark the ambiguity","Always choose the first occurrence","Use today's timezone offset"],correct:0,explanation:"The civil time may represent two distinct instants; a verified offset is needed."}]},
 {id:"zodiac-houses",objective:"Find a sign, in-sign degree and whole-sign house from angular data.",caseStudy:"A normalized longitude of 275 degrees is Capricorn, 5 degrees into the sign. With Libra as the ascendant, Capricorn is the fourth whole-sign house. Count the ascendant as house one; do not mix another house convention.",questions:[
 {prompt:"What is the sign and in-sign degree of longitude 152?",choices:["Leo, 2 degrees","Virgo, 2 degrees","Libra, 2 degrees"],correct:1,explanation:"Virgo begins at 150 degrees."},
 {prompt:"Taurus is the ascendant. Which whole-sign house is Aquarius?",choices:["House 9","House 11","House 10"],correct:2,explanation:"Counting Taurus as house one makes Aquarius house ten."}]},
 {id:"reference-signs",objective:"Distinguish the Moon sign, Sun sign and ascendant.",caseStudy:"In a hypothetical chart the Sun is in Aries, the Moon in Cancer and the ascendant in Virgo. A Moon-relative guide uses Cancer. An ascendant-relative house analysis starts from Virgo. Neither establishes the person's behavior.",questions:[
 {prompt:"Which reference is used by a Moon-rashi guide?",choices:["The calculated natal Moon sign","The calendar-month Sun sign","The nearest rising sign at noon"],correct:0,explanation:"A Moon-rashi guide is based on the Moon's sign at the specified birth instant."},
 {prompt:"Which input matters especially for an accurate ascendant?",choices:["Only the person's name","Only their birth month","The actual birth time and location"],correct:2,explanation:"The rising point depends on the local horizon and time."}]},
 {id:"nakshatra-pada",objective:"Calculate equal nakshatra and pada intervals and flag boundaries.",caseStudy:"Each of 27 equal intervals spans 13 degrees 20 minutes; its four padas span 3 degrees 20 minutes each. At longitude 29 degrees the third nakshatra begins at 26 degrees 40 minutes, so the position is in its first pada.",questions:[
 {prompt:"How many degrees does one equal nakshatra span?",choices:["12 degrees","13 degrees 20 minutes","15 degrees"],correct:1,explanation:"360 degrees divided by 27 equals 13 degrees 20 minutes."},
 {prompt:"Two engines disagree on a pada close to a boundary. What is the responsible action?",choices:["Record the discrepancy and compare their conventions and inputs","Select the more favorable answer","Round both to the next sign"],correct:0,explanation:"Ayanamsa, reference time and rounding must be checked before claiming the exact label."}]},
 {id:"panchang",objective:"Understand tithi arithmetic and distinguish instant-based reference from local ritual timing.",caseStudy:"At an illustrative instant the normalized Moon-Sun separation is 100 degrees. The interval index is floor(100/12)+1 = 9. That interval at one instant does not determine which day a festival is observed in a specific city.",questions:[
 {prompt:"A normalized Moon-Sun difference is 73 degrees. Which tithi interval index applies?",choices:["6","7","8"],correct:1,explanation:"floor(73/12)+1 = 7."},
 {prompt:"A calendar lists a date for Delhi. Can you promise the same ceremony time in Sydney?",choices:["Yes, tithi ignores local sunrise","Yes, if both are the same civil day","No, confirm local timing and tradition"],correct:2,explanation:"Location, civil time, sunrise and observance rules can differ."}]},
 {id:"transit-dasha",objective:"Distinguish a reference snapshot, exact boundary search and traditional period framework.",caseStudy:"A planet appears in one sign on the first day of April and another on the first day of May. A finer time-resolution calculation is needed to determine the crossing; repeated crossings and apparent retrograde motion cannot be ruled out from these samples.",questions:[
 {prompt:"What does a monthly sign snapshot establish?",choices:["The computed sign at the specified sample instant","The exact transition minute between samples","A guaranteed future life event"],correct:0,explanation:"A snapshot is one reference instant, not a boundary search or prediction."},
 {prompt:"Why might Dasha transition dates differ between implementations?",choices:["The person's name spelling necessarily changes them","Birth longitude, year-length conventions and rounding may differ","All Dasha methods use identical assumptions"],correct:1,explanation:"Document the method, inputs and conventions before comparing results."}]},
 {id:"responsible-reading",objective:"Distinguish calculable facts, cultural interpretation and evidence-based practical decisions.",caseStudy:"A fictional reading contains a calculated longitude, a traditional reflection about learning, and a practical suggestion to compare actual course requirements. Only the first is geometric arithmetic; the second is tradition, and the third can be checked independently.",questions:[
 {prompt:"A traditional matching score is low. What should it determine about consent?",choices:["Consent is unnecessary","The score overrides both people's choices","Nothing; consent and real relationship decisions remain with both people"],correct:2,explanation:"Traditional scores do not establish relationship quality or override autonomy."},
 {prompt:"A chart interpretation raises a health worry. What is appropriate?",choices:["Seek qualified medical advice for the real concern","Purchase a guaranteed cure","Treat the chart as a diagnosis"],correct:0,explanation:"Astrology is not a medical diagnostic method or a replacement for qualified care."}]}
];
export function courseProgressKey(orderId:string,moduleId:string){
 if(!/^[a-zA-Z0-9_-]{1,100}$/.test(orderId)||!courseModules.some(m=>m.id===moduleId))throw Error("COURSE_PROGRESS_KEY_INVALID");
 return "paid-course-v1:"+orderId+":"+moduleId;
}
export function courseQuizResult(moduleId:string,answers:readonly number[]){
 const selectedModule=courseModules.find(m=>m.id===moduleId);
 if(!selectedModule||answers.length!==selectedModule.questions.length||answers.some(a=>!Number.isInteger(a)||a<0||a>2))return null;
 const feedback=selectedModule.questions.map((q,i)=>({correct:answers[i]===q.correct,explanation:q.explanation}));
 return {passed:feedback.every(x=>x.correct),feedback};
}
export function publicCourseModule(moduleId:string){
 const m=courseModules.find(x=>x.id===moduleId);return m?{id:m.id,objective:m.objective,caseStudy:m.caseStudy,questions:m.questions.map(q=>({prompt:q.prompt,choices:q.choices}))}:null;
}
