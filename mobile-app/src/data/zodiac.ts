export const zodiacSigns = [
  {id:"aries",label:"Aries",hindi:"Mesh",symbol:"♈"},
  {id:"taurus",label:"Taurus",hindi:"Vrishabh",symbol:"♉"},
  {id:"gemini",label:"Gemini",hindi:"Mithun",symbol:"♊"},
  {id:"cancer",label:"Cancer",hindi:"Kark",symbol:"♋"},
  {id:"leo",label:"Leo",hindi:"Singh",symbol:"♌"},
  {id:"virgo",label:"Virgo",hindi:"Kanya",symbol:"♍"},
  {id:"libra",label:"Libra",hindi:"Tula",symbol:"♎"},
  {id:"scorpio",label:"Scorpio",hindi:"Vrishchik",symbol:"♏"},
  {id:"sagittarius",label:"Sagittarius",hindi:"Dhanu",symbol:"♐"},
  {id:"capricorn",label:"Capricorn",hindi:"Makar",symbol:"♑"},
  {id:"aquarius",label:"Aquarius",hindi:"Kumbh",symbol:"♒"},
  {id:"pisces",label:"Pisces",hindi:"Meen",symbol:"♓"}
] as const;
export type ZodiacSign = (typeof zodiacSigns)[number]["id"];
