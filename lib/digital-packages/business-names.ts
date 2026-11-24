/** Transparent traditional symbolism, not a prediction of business success. */
const chaldean=["AIJQY","BKR","CGLS","DMT","EHNX","UVW","OZ","FP"] as const;
export function normalizedBusinessName(input:string){
 const value=input.trim().replace(/\s+/g," ");
 if(value.length<2||value.length>70||!/[A-Za-z]/.test(value)||!/^[A-Za-z .&'-]+$/.test(value))throw Error("Use Roman letters and ordinary name separators, without digits or symbols.");
 return value;
}
function root(total:number){while(total>9)total=String(total).split("").reduce((s,d)=>s+Number(d),0);return total;}
export function compareBusinessNames(candidates:readonly string[]){
 if(candidates.length<2||candidates.length>10)throw Error("Provide 2 to 10 candidate names.");
 const names=candidates.map(normalizedBusinessName);
 const canonical=(name:string)=>name.toUpperCase().replace(/[^A-Z]/g,"");
 if(new Set(names.map(canonical)).size!==names.length)throw Error("Candidate names must differ by letters, not just spacing or case.");
 return names.map(name=>{
  const letters=canonical(name).split("");
  const breakdown=letters.map(letter=>({letter,pythagorean:(letter.charCodeAt(0)-65)%9+1,chaldean:chaldean.findIndex(row=>row.includes(letter))+1}));
  const pythagoreanTotal=breakdown.reduce((s,l)=>s+l.pythagorean,0),chaldeanTotal=breakdown.reduce((s,l)=>s+l.chaldean,0);
  return {name,pythagoreanTotal,pythagoreanRoot:root(pythagoreanTotal),chaldeanTotal,chaldeanRoot:root(chaldeanTotal),breakdown};
 });
}
