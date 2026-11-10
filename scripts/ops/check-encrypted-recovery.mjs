/** Public, read-only verification of NAKSHARIX's real encrypted off-site restore receipt. */
export const RECOVERY_URL = "https://www.naksharix.com/api/ops/backup-status";
const MAX_AGE_MS=36*60*60*1000, FUTURE_SKEW_MS=5*60*1000;
export async function checkEncryptedRecovery(fetcher=fetch,now=Date.now()){
  let response;
  try{
    response=await fetcher(RECOVERY_URL,{cache:"no-store",redirect:"manual",
      signal:AbortSignal.timeout(20000),headers:{"User-Agent":"Naksharix-Encrypted-Recovery-Watch/1.0"}});
  }catch{return {passed:false,reason:"FETCH_UNAVAILABLE"};}
  if(response.status!==200)return {passed:false,reason:"STATUS_"+response.status};
  let data;
  try{data=(await response.json()).data;}catch{return {passed:false,reason:"INVALID_JSON"};}
  if(data?.configured!==true||data?.operational!==true||data?.encrypted!==true||
     data?.restoreVerified!==true||!Number.isFinite(data?.retentionDays)||data.retentionDays<7)
    return {passed:false,reason:"UNVERIFIED_BACKUP"};
  const timestamp=Date.parse(data?.lastSuccessfulAt||"");
  if(!Number.isFinite(timestamp))return {passed:false,reason:"MISSING_SUCCESS_TIMESTAMP"};
  if(timestamp>now+FUTURE_SKEW_MS)return {passed:false,reason:"FUTURE_TIMESTAMP"};
  if(now-timestamp>=MAX_AGE_MS)return {passed:false,reason:"STALE_RECEIPT"};
  return {passed:true,reason:"ENCRYPTED_RESTORE_VERIFIED"};
}
if(process.argv[1]?.endsWith("check-encrypted-recovery.mjs")){
  const result=await checkEncryptedRecovery();
  console.log("NAKSHARIX_ENCRYPTED_RECOVERY="+(result.passed?"PASS":"FAIL")+";REASON="+result.reason);
  if(!result.passed)process.exitCode=1;
}
