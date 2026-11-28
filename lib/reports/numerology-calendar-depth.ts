import type { AstrologyLanguage } from "@/lib/astrology/types";
import { calculateCalendarNumbers } from "@/lib/numerology/calendar";
import { calendarReflection, type NumerologyReport } from "@/lib/numerology";
import type { DepthChapter } from "./editorial-depth";

export function buildCalendarDepth(report:NumerologyReport,language:AstrologyLanguage):DepthChapter[]{
  const t=(copy:[string,string,string])=>copy[language==="en"?0:language==="hi"?1:2];
  const cal=report.calendar;

  const yearTitle=t(["Personal year","व्यक्तिगत वर्ष","Personal year"]);
  const monthTitle=t(["Personal month","व्यक्तिगत माह","Personal month"]);
  const cycleIntro=t(["This calendar convention reduces each sum to a single digit. January starts the next annual cycle.","इस विधि में हर योग को एक अंक तक घटाया जाता है। नया वार्षिक चक्र जनवरी में शुरू होता है।","Is method mein har sum ko ek digit tak reduce karte hain. Naya annual cycle January se shuru hota hai."]);
  const {month,day,year}=cal.birthRoots;
  const dateLabel=t(["Birth month, day and year roots","जन्म माह, दिन और वर्ष के मूल अंक","Birth month, day aur year ke roots"]);
  const difference=t(["Take the positive difference or zero. A zero is a valid result.","अंतर का धनात्मक मान या शून्य लें। शून्य भी मान्य परिणाम है।","Difference ka positive value ya zero lein. Zero bhi valid result hai."]);
  const [first,second,third,fourth]=cal.challenges;
  const cycles:DepthChapter={
    key:"numerology-cycles",title:t(["Calendar cycles and traditional challenges","कैलेंडर चक्र और पारंपरिक चुनौती अंक","Calendar cycles aur traditional challenge numbers"]),
    intro:cycleIntro,cards:[
      {label:String(cal.referenceYear),title:yearTitle+" "+cal.personalYear,body:dateLabel+" "+[month,day,year].join(" / ")+". "+month+" + "+day+" + "+cal.referenceYear+" -> "+cal.personalYear+". "+cycleIntro},
      {label:cal.asOf.slice(0,7),title:monthTitle+" "+cal.personalMonth,body:yearTitle+" "+cal.personalYear+" + "+t(["calendar month","कैलेंडर माह","calendar month"])+" "+cal.referenceMonth+" -> "+cal.personalMonth+". "+t(["Use the month as a checkpoint to review an actual goal.","इस माह को किसी वास्तविक लक्ष्य की प्रगति जाँचने का अवसर मानें।","Is month ko apne actual goal ka progress check karne ke liye use karein."])},
      {label:dateLabel,title:t(["Four challenge numbers","चार चुनौती अंक","Chaar challenge numbers"]),body:[month+" - "+day+" -> "+first,day+" - "+year+" -> "+second,first+" - "+second+" -> "+third,month+" - "+year+" -> "+fourth].join(" | ")+". "+difference}
    ]
  };

  const dob=new Date(report.dateOfBirth+"T00:00:00Z");
  const months=Array.from({length:12},(_,offset)=>{
    const next=new Date(Date.UTC(cal.referenceYear,cal.referenceMonth+offset,1));
    const cycle=calculateCalendarNumbers(dob,next);
    const reflection=calendarReflection(cycle.personalMonth,language);
    return {
      label:cycle.asOf.slice(0,7),title:monthTitle+" "+cycle.personalMonth,
      body:yearTitle+" "+cycle.personalYear+" + "+t(["calendar month","कैलेंडर माह","calendar month"])+" "+cycle.referenceMonth+" -> "+cycle.personalMonth+". "+reflection.meaning+" "+reflection.guidance
    };
  });
  return [cycles,{
    key:"numerology-next-twelve-months",title:t(["Your next twelve calendar months","आपके आगामी बारह कैलेंडर माह","Aapke agle baarah calendar months"]),
    intro:t(["Each entry uses its own calendar year and month. The accompanying prompt is for reflection.","हर पंक्ति में उसी माह और वर्ष से गणना की गई है। साथ दिया गया विचार आत्मचिंतन के लिए है।","Har entry apne calendar year aur month par based hai. Saath diya gaya idea reflection ke liye hai."]),
    cards:months
  }];
}
