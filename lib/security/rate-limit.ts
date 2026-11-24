import "server-only";
import { NextRequest } from "next/server";
import { fail } from "@/lib/api";
import {durableRateCount} from "@/lib/security/durable-rate-counter";
import {durableRateDecision} from "@/lib/security/durable-rate-contract";
import {trustedPublicClientIp} from "@/lib/auth/public-quota";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

export function getRequestIp(request: NextRequest | Request) {
  return trustedPublicClientIp(request);
}

export function checkRateLimit(options: RateLimitOptions) {
  const now = Date.now();
  const existing = buckets.get(options.key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(options.key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.limit - 1, resetAt: now + options.windowMs };
  }

  if (existing.count >= options.limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: options.limit - existing.count, resetAt: existing.resetAt };
}

export function rateLimitResponse(name: string, key: string, limit: number, windowMs: number) {
  const result = checkRateLimit({ key: `${name}:${key}`, limit, windowMs });
  if (result.allowed) return null;
  return fail("Too many requests. Please wait before trying again.", 429, {
    retryAfterSeconds: Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))
  });
}

/** Critical transaction endpoints fail closed if their shared counter cannot be reached. */
export async function sharedRateLimitResponse(name:string,key:string,limit:number,windowMs:number){
 if(process.env.NODE_ENV!=="production")return rateLimitResponse(name,key,limit,windowMs);
 try{
  const row=await durableRateCount("critical:"+name+":"+key,Math.max(1,Math.ceil(windowMs/1000)));
  const decision=durableRateDecision(row.count,row.resetAt,limit,Date.now());
  return decision.allowed?null:fail("Too many requests. Please wait before trying again.",429,{retryAfterSeconds:decision.retryAfterSeconds});
 }catch{return fail("Service temporarily unavailable. Check existing payment or request status before trying again.",503);}
}
