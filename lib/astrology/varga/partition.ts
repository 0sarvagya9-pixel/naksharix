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
