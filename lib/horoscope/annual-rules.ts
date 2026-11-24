/** Pure, date-driven educational interpretation; never a natal chart or a promise. */
export const annualSigns = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"] as const;
export const annualHindiSigns = ["मेष","वृषभ","मिथुन","कर्क","सिंह","कन्या","तुला","वृश्चिक","धनु","मकर","कुंभ","मीन"] as const;
export type AnnualLocale = "en" | "hi" | "hinglish";
export type AnnualSnapshot = { date:string; jupiter:string; saturn:string };
const themes = [
 ["identity and routines","व्यक्तित्व और दिनचर्या","identity aur routine"],["resources and values","संसाधन और मूल्य","resources aur values"],["learning and communication","सीखना और संवाद","learning aur communication"],["home and family","घर और परिवार","home aur family"],["creativity and study","रचनात्मकता और अध्ययन","creativity aur study"],["work habits and wellbeing","काम की आदतें और स्वास्थ्य","work habits aur wellbeing"],["partnerships and consent","साझेदारी और सहमति","partnership aur consent"],["shared responsibilities","साझा जिम्मेदारियाँ","shared responsibilities"],["education and perspective","शिक्षा और दृष्टिकोण","education aur perspective"],["career and responsibility","कार्य और जिम्मेदारी","career aur responsibility"],["community and long-term goals","समुदाय और दीर्घकालीन लक्ष्य","community aur goals"],["rest and reflection","विश्राम और आत्मचिंतन","rest aur reflection"]
] as const;
export function calendarYearInIndia(now = new Date()) {
  if (!Number.isFinite(now.getTime())) throw new Error("INVALID_ANNUAL_CLOCK");
  return Number(new Intl.DateTimeFormat("en-IN",{year:"numeric",timeZone:"Asia/Kolkata"}).format(now));
}
export function annualSampleDates(year:number) {
  if (!Number.isInteger(year)||year<1900||year>2100) throw new Error("UNSUPPORTED_ANNUAL_YEAR");
  return Array.from({length:12},(_,month)=>String(year)+"-"+String(month+1).padStart(2,"0")+"-01");
}
export function annualRelativeHouse(reference:string,position:string) {
  const a=annualSigns.findIndex(s=>s.toLowerCase()===reference.toLowerCase()), b=annualSigns.findIndex(s=>s.toLowerCase()===position.toLowerCase());
  if(a<0||b<0)throw new Error("INVALID_ANNUAL_SIGN");
  return (b-a+12)%12+1;
}
export function annualInterpretation(year:number,reference:string,samples:readonly AnnualSnapshot[],locale:AnnualLocale="en") {
  const dates=annualSampleDates(year);
  if(samples.length!==12||samples.some((row,i)=>row.date!==dates[i]))throw new Error("INCOMPLETE_ANNUAL_SAMPLES");
  const index=annualSigns.findIndex(s=>s.toLowerCase()===reference.toLowerCase());
  if(index<0)throw new Error("INVALID_ANNUAL_SIGN");
  const lang=locale==="hi"?1:locale==="hinglish"?2:0;
  const rows=samples.map(row=>{const growthHouse=annualRelativeHouse(reference,row.jupiter),structureHouse=annualRelativeHouse(reference,row.saturn);return {...row,growthHouse,structureHouse,growthTheme:themes[growthHouse-1][lang],structureTheme:themes[structureHouse-1][lang]};});
  const label=locale==="hi"?annualHindiSigns[index]:annualSigns[index];
  return {year,referenceSign:annualSigns[index],label,rows,verification:"internal_educational_not_external_certified" as const,personalPrediction:false as const};
}
