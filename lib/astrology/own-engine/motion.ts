/** Symmetric geocentric sidereal longitude derivative, degrees per day.
 * This is a numerical estimate, not an exact station timestamp. Mean nodes
 * use the same mean-node longitude convention as the natal chart.
 */
export type MotionState="direct"|"retrograde"|"near_station";
export const MOTION_HALF_STEP_DAYS=1/24;
export const MOTION_NEAR_STATION_DEGREES_PER_DAY=0.01;
export function estimateSiderealMotion(longitudeAt:(daysFromEpoch:number)=>number){
 const a=longitudeAt(-MOTION_HALF_STEP_DAYS),b=longitudeAt(MOTION_HALF_STEP_DAYS);
 if(!Number.isFinite(a)||!Number.isFinite(b))throw Error("INVALID_MOTION_LONGITUDE");
 const delta=((b-a+180)%360+360)%360-180;
 const rate=delta/(2*MOTION_HALF_STEP_DAYS);
 const motionState:MotionState=Math.abs(rate)<MOTION_NEAR_STATION_DEGREES_PER_DAY?"near_station":rate<0?"retrograde":"direct";
 return {speedDegreesPerDay:Number(rate.toFixed(8)),retrograde:rate<0,motionState};
}
