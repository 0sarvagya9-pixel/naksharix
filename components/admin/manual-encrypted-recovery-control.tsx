"use client";

import { useState } from "react";
import { secureFetch } from "@/lib/security/csrf";

type Props={configured:boolean;verified:boolean;lastSuccessfulAt?:string};
export function ManualEncryptedRecoveryControl({configured,verified,lastSuccessfulAt}:Props){
  const [confirmed,setConfirmed]=useState(false);
  const [pending,setPending]=useState(false);
  const [status,setStatus]=useState(verified
    ? "Fresh encrypted backup and isolated restore verified."
    : "Not verified: no fresh encrypted archive and isolated restore receipt.");
  const [passed,setPassed]=useState(verified);
  const [lastSuccess,setLastSuccess]=useState(lastSuccessfulAt||"");

  async function checkReceipt(){
    try{
      const response=await fetch("/api/ops/backup-status",{cache:"no-store"});
      const json=await response.json().catch(()=>({}));
      if(response.ok && json.data?.operational===true &&
        json.data?.encrypted===true && json.data?.restoreVerified===true){
        setPassed(true);
        setLastSuccess(json.data.lastSuccessfulAt||"");
        setStatus("PASS: fresh encrypted private backup and independently restored database receipt verified.");
      }else{
        setPassed(false);
        setStatus("NOT VERIFIED: "+(json.data?.reason||"successful restore receipt missing")+". No PASS claimed.");
      }
    }catch{setPassed(false);setStatus("Recovery status could not be read; no PASS claimed.");}
  }

  async function run(){
    if(!configured||pending||!confirmed||passed)return;
    setPending(true);
    setStatus("Running production read-only export, private AES-GCM encryption and isolated restore. Do not start another run.");
    try{
      const response=await secureFetch("/api/admin/ops/run-recovery",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({confirmation:"RUN_VERIFIED_RECOVERY"})
      });
      const json=await response.json().catch(()=>({}));
      if(!response.ok){
        setPassed(false);
        setStatus("NOT VERIFIED: "+(json.error||"Recovery run did not complete")+
          (json.details?.code?" ("+json.details.code+")":"")+". Read the owner failure alert; do not assume a backup exists.");
      }else if(json.data?.restoreVerified===true && json.data?.encrypted===true &&
               json.data?.privateStore===true && json.data?.state==="verified"){
        setPassed(true);
        setLastSuccess(json.data.lastSuccessfulAt||"");
        setStatus("PASS: encrypted private backup downloaded, decrypted and restored in isolation.");
      }else{
        setPassed(false);
        setStatus("The response lacked an independently verified restore receipt. No PASS claimed.");
      }
    }catch{
      setPassed(false);
      setStatus("Request interrupted. The export may still be in progress; use Recheck status rather than starting another run.");
    }finally{setPending(false);}
  }

  return <section className="mt-6 rounded-2xl border border-[#dec6a4] bg-white p-6 text-[#402a2d]" aria-labelledby="encrypted-recovery-owner-action">
    <h2 id="encrypted-recovery-owner-action" className="text-xl font-bold">Owner-only encrypted backup verification</h2>
    <p className="mt-3 max-w-3xl text-sm leading-7">
      Run the existing protected, resource-intensive recovery on demand. It reads the production database without writing rows,
      encrypts the archive in private storage, and attempts to restore a separate isolated database.
      This is not a payment, booking or customer-data update. It may take several minutes.
    </p>
    <p className="mt-3 text-sm font-semibold">{passed?"Verified backup is current":"Verification is still required"}</p>
    {lastSuccess?<p className="text-sm">Last successful verified restore (UTC): {lastSuccess}</p>:null}
    <label className="mt-4 flex items-start gap-3 text-sm leading-6">
      <input type="checkbox" className="mt-1 h-4 w-4" checked={confirmed}
        onChange={event=>setConfirmed(event.target.checked)} disabled={pending||passed||!configured}/>
      I authorize one owner-only production recovery verification and understand that no success is claimed until an isolated restore receipt exists.
    </label>
    <div className="mt-4 flex flex-wrap gap-3">
      <button type="button" onClick={run} disabled={!configured||!confirmed||pending||passed}
        className="min-h-11 rounded-lg bg-[#76263b] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
        {pending?"Verifying encrypted restore...":passed?"Backup already verified":"Run encrypted backup verification"}
      </button>
      <button type="button" onClick={checkReceipt} disabled={pending}
        className="min-h-11 rounded-lg border border-[#87525c] px-5 py-3 font-semibold disabled:opacity-50">
        Recheck verified status
      </button>
    </div>
    {!configured?<p className="mt-3 text-sm text-[#932c40]">Protected backup configuration is incomplete; operation is disabled.</p>:null}
    <p role="status" aria-live="polite" className="mt-4 text-sm leading-7">{status}</p>
    <p className="mt-3 text-xs leading-6">Restricted to the configured owner or SUPER_ADMIN; CSRF-protected and limited to three claims per UTC day. Never share CRON_SECRET, database URLs or backup keys.</p>
  </section>;
}
