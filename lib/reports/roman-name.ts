/** A complete A–Z spelling is required; never interpret only the ASCII fragment of a mixed-script name. */
export function isFullRomanNumerologyName(value:unknown):value is string {
  return typeof value==="string"&&/^[A-Za-z][A-Za-z .’'-]*$/.test(value.trim());
}

/** Explicit paid-report arithmetic. Do not substitute the whole-name sum
 * for a missing vowel or consonant category. The original calculator's
 * public response shape remains compatible. */
export function calculateRomanNameEvidence(value:unknown){
 if(!isFullRomanNumerologyName(value))return null;
 const letters=[...value.toUpperCase().replace(/[^A-Z]/g,"")].map(letter=>({letter,value:(letter.charCodeAt(0)-65)%9+1,vowel:"AEIOU".includes(letter)}));
 const trace=(items:typeof letters)=>{
  if(!items.length)return null;
  const sum=items.reduce((n,r)=>n+r.value,0),steps=[sum];
  while(steps.at(-1)!>9&&![11,22,33].includes(steps.at(-1)!))steps.push(String(steps.at(-1)).split("").reduce((n,c)=>n+Number(c),0));
  return {letters:items,sum,steps,number:steps.at(-1)!};
 };
 return {all:trace(letters)!,vowels:trace(letters.filter(r=>r.vowel)),consonants:trace(letters.filter(r=>!r.vowel)),method:"pythagorean_a_z_aeiou_master_11_22_33" as const};
}
