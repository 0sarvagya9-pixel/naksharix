/** Half-open sign/division boundaries. Compute the remainder from the
 * same integer sector as the sign, never floating modulo by 30/divisor.
 */
export function divisionCoordinates(longitude:number,divisor:number){
 if(!Number.isFinite(longitude)||!Number.isInteger(divisor)||divisor<1||divisor>64)throw Error("INVALID_DIVISION_LONGITUDE");
 const rest=longitude%360;
 const normalized=rest>=0?rest:Math.min(360-Number.EPSILON*256,360+rest);
 const signIndex=Math.min(11,Math.floor(normalized/30));
 const scaled=(normalized-signIndex*30)*divisor;
 const part=Math.min(divisor-1,Math.floor(scaled/30));
 const degree=Math.max(0,Math.min(30-Number.EPSILON*32,scaled-part*30));
 return {signIndex,part,degree};
}
export function roundedDivisionDegree(degree:number){
 // Preserve the sign selected from unrounded longitude, never show 30°
 // inside that sign because decimal rounding crossed its upper boundary.
 return Math.max(0,Math.min(29.999999,Number(degree.toFixed(6))));
}
export function navamsaCoordinates(longitude:number){
 const {signIndex,part,degree}=divisionCoordinates(longitude,9);
 // Parashari D9 sign sequence: movable starts at its own sign,
 // fixed at the ninth, dual at the fifth. The global harmonic is equivalent.
 const start=signIndex%3===0?signIndex:signIndex%3===1?(signIndex+8)%12:(signIndex+4)%12;
 return {signIndex:(start+part)%12,degree};
}


// A named classical sign-mapping convention, not independent software
// certification. D30 uses unequal Trimshamsha spans. D60 uses the
// local-degree remainder convention described in BPHS Ch. 6 (33–41);
// its alternative natal-sign-start traditions are not mixed into this method.
export const CLASSICAL_VARGA_KEYS=["D1","D2","D3","D4","D7","D9","D10","D12","D16","D20","D24","D27","D30","D40","D45","D60"] as const;
export type ClassicalVargaKey=(typeof CLASSICAL_VARGA_KEYS)[number];

export function classicalVargaCoordinates(chart:ClassicalVargaKey,longitude:number){
 if(!CLASSICAL_VARGA_KEYS.includes(chart))throw Error("UNSUPPORTED_CLASSICAL_VARGA");
 if(chart==="D30"){
  const natal=divisionCoordinates(longitude,1);
  const spans=natal.signIndex%2===0?[[0,5,0],[5,10,10],[10,18,8],[18,25,2],[25,30,6]]:[[0,5,1],[5,12,5],[12,20,11],[20,25,9],[25,30,7]];
  const part=spans.findIndex(([,end])=>natal.degree<end);
  if(part<0)throw Error("INVALID_TRIMSHAMSHA_PART");
  const [start,end,target]=spans[part];
  // This coordinate is a normalized within-span display convention. The
  // textual reference supports sign/lord selection, not cross-software
  // agreement on a degree displayed inside the selected D30 sign.
  return {signIndex:target,part,degree:30*(natal.degree-start)/(end-start)};
 }
 const {signIndex,part,degree}=divisionCoordinates(longitude,Number(chart.slice(1)));
 let target=signIndex;
 switch(chart){
  case "D1":break;
  case "D2":target=signIndex%2===0?(part===0?4:3):(part===0?3:4);break;
  case "D3":target=signIndex+4*part;break;
  case "D4":target=signIndex+3*part;break;
  case "D7":target=signIndex+(signIndex%2?6:0)+part;break;
  case "D9":target=navamsaCoordinates(longitude).signIndex;break;
  case "D10":target=signIndex+(signIndex%2?8:0)+part;break;
  case "D12":target=signIndex+part;break;
  case "D16":case "D45":target=[0,4,8][signIndex%3]+part;break;
  case "D20":target=[0,8,4][signIndex%3]+part;break;
  case "D24":target=(signIndex%2?3:4)+part;break;
  case "D27":target=[0,3,6,9][signIndex%4]+part;break;
  case "D40":target=(signIndex%2?6:0)+part;break;
  case "D60":target=part;break;
 }
 return {signIndex:target%12,part,degree};
}
