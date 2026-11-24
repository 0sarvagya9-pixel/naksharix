import {createHmac,randomBytes} from "node:crypto";
export const PASSWORD_RESET_PURPOSE="PASSWORD_RESET";
export const PASSWORD_RESET_TTL_MS=20*60*1000;
export function validResetToken(token:string){return /^[A-Za-z0-9_-]{43}$/.test(token)&&Buffer.from(token,"base64url").length===32&&Buffer.from(token,"base64url").toString("base64url")===token;}
export function createResetToken(){return randomBytes(32).toString("base64url");}
export function passwordResetDigest(token:string,secret:string){if(!validResetToken(token)||secret.length<32)throw new Error("Invalid password reset contract");return createHmac("sha256",secret).update("naksharix-password-reset-v1:"+token).digest("hex");}
export function resetRoleEligible(role:string){return ["USER","ASTROLOGER","CONSULTANT"].includes(role);}
export function resetSessionIsStale(authenticatedAt:number,resetAt:number){return !Number.isFinite(authenticatedAt)||authenticatedAt<=resetAt;}
