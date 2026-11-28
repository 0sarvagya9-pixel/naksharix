import assert from "node:assert/strict";
import { editorialDoshaPresentation as display, editorialTerm } from "../lib/reports/editorial-display.ts";
import { evaluateManglikReferenceEvidence } from "../lib/astrology/strength/traditional-patterns.ts";

// Compare presentation to the separately implemented engine evidence. Exercise
// every whole-sign reference combination rather than copying its hit algorithm.
const signs=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const locales=["en","hi","hinglish"];
const labels={en:["Lagna","Moon","Venus"],hi:["लग्न","चंद्र","शुक्र"],hinglish:["Lagna","Chandra","Shukra"]};
const noMatch={en:"None",hi:"कोई नहीं",hinglish:"Koi nahi"};
const legacySeverity="LEGACY_SEVERITY_MUST_NOT_BE_SHOWN";
const remedies=Object.freeze(["First complete sentence.","Second complete sentence."]);
let geometryCases=0,localeCases=0,unavailableCases=0,factorCases=0;
function assessment(evidence){
 return Object.freeze({available:true,present:evidence.sixHouseHits>0,severity:legacySeverity,
  marsHouseFromLagna:evidence.references[0].house,
  marsHouseFromMoon:evidence.references[1].house,
  marsHouseFromVenus:evidence.references[2].house,
  summary:"Legacy summary must not mislabel all reference houses as sensitive.",remedies});
}
for(let asc=0;asc<12;asc++)for(let moon=0;moon<12;moon++)for(let venus=0;venus<12;venus++){
 const evidence=evaluateManglikReferenceEvidence([
  {planet:"Mars",sign:"Aries",degree:10,absoluteLongitude:10},
  {planet:"Moon",sign:signs[moon],degree:10,absoluteLongitude:moon*30+10},
  {planet:"Venus",sign:signs[venus],degree:10,absoluteLongitude:venus*30+10}
 ],signs[asc],signs[moon]);
 assert.ok(evidence);geometryCases++;
 const input=assessment(evidence),before=JSON.stringify(input);
 for(const locale of locales){
  const result=display(input,locale,"manglik");
  assert.match(result.title,new RegExp(evidence.sixHouseHits+" / 3$"));
  assert.ok(!result.title.includes(legacySeverity));
  const lines=result.body.split("\n");
  evidence.references.forEach((reference,index)=>assert.ok(lines[0].includes(labels[locale][index]+(locale==="en"?" ":locale==="hi"?" से ":" se ")+reference.house)));
  const matched=evidence.references.flatMap((reference,index)=>reference.hitSixHouse?[labels[locale][index]]:[]);
  assert.ok(lines[1].endsWith(matched.join(", ")||noMatch[locale]));
  assert.ok(!result.body.includes(input.summary));
  assert.ok(result.body.endsWith(remedies.join("\n")));
  assert.ok(!result.body.includes(".,"));
  assert.equal(JSON.stringify(input),before);localeCases++;
 }
}

// Regression from the rendered corpus: only Venus 12 matches, not Lagna 10
// or Moon 5. A positive flag is not a measured "Mild" severity category.
const regression={available:true,present:true,severity:"Mild",marsHouseFromLagna:10,marsHouseFromMoon:5,marsHouseFromVenus:12,remedies};
assert.equal(display(regression,"en","manglik").title,"Rule matches: 1 / 3");
assert.ok(display(regression,"en","manglik").body.split("\n")[1].endsWith("Matches: Venus"));
assert.doesNotMatch(display(regression,"en","manglik").body,/touches Manglik-sensitive houses|Mild/);

const invalidValues=[undefined,null,"1",0,13,1.5,NaN,Infinity];
for(const locale of locales){
 for(const kind of ["manglik","kaalSarp","factor"]){
  for(const invalid of [{available:false,present:false},{available:false,present:true},{available:true},{available:true,present:"false"}]){
   const result=display({...regression,...invalid,present:invalid.present},locale,kind);
   assert.equal(result.title,editorialTerm("Not available",locale));unavailableCases++;
  }
 }
 for(const field of ["marsHouseFromLagna","marsHouseFromMoon","marsHouseFromVenus"]){
  for(const value of invalidValues){
   assert.equal(display({...regression,[field]:value},locale,"manglik").title,editorialTerm("Not available",locale));unavailableCases++;
  }
 }
 // Contradictory positive/negative flags are not converted into a new result.
 for(const invalid of [{...regression,present:false},{...regression,marsHouseFromVenus:6}]){
  assert.equal(display(invalid,locale,"manglik").title,editorialTerm("Not available",locale));unavailableCases++;
 }
 for(const present of [true,false])for(const kind of ["kaalSarp","factor"]){
  const input=Object.freeze({available:true,present,severity:legacySeverity,summary:"Factor explanation.",remedies});
  const result=display(input,locale,kind);
  assert.notEqual(result.title,editorialTerm("Not available",locale));
  assert.notEqual(result.title,editorialTerm("Not clearly detected",locale));
  assert.ok(!result.title.includes(legacySeverity));
  assert.ok(result.body.endsWith(remedies.join("\n")));
  if(kind==="factor")assert.ok(result.body.startsWith(input.summary));
  factorCases++;
 }
 // Complete optional-availability factor records remain supported.
 assert.ok(display({present:false,summary:"Factor explanation.",remedies},locale,"factor").body.startsWith("Factor explanation."));factorCases++;
 assert.notEqual(editorialTerm("Number symbolism / reflection",locale),editorialTerm("Meaning / guidance",locale));
}
assert.match(display({available:true,present:false},"en","kaalSarp").body,/not all in one Rahu–Ketu semicircle/);
assert.match(display({available:true,present:true},"en","kaalSarp").body,/are all in one Rahu–Ketu semicircle/);
// The matching section's real camel-case keys use Dosh, while other callers
// use Dosha. Both must produce the same localized labels.
assert.equal(editorialTerm("Nadi Dosh","hi"),"नाड़ी दोष");
assert.equal(editorialTerm("Bhakoot Dosh","hi"),"भकूट दोष");
assert.equal(editorialTerm("Nadi Dosh","hi"),editorialTerm("Nadi Dosha","hi"));
assert.equal(editorialTerm("Bhakoot Dosh","hi"),editorialTerm("Bhakoot Dosha","hi"));
console.log("EDITORIAL_RULE_SEMANTICS_PASS="+JSON.stringify({geometryCases,localeCases,unavailableCases,factorCases,corpusRegression:"Lagna 10 / Moon 5 / Venus 12",scope:"Rule evidence presentation and bilingual semantics; not human language or practitioner certification"}));
