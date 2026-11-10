"use client";
import {useState} from "react";
import {secureFetch} from "@/lib/security/csrf";
export function MobileAccountLinkApproval({ticket,accountName}:{ticket:string;accountName:string}){
  const [pending,setPending]=useState(false),[approved,setApproved]=useState(false),[error,setError]=useState("");
  async function approve(){
    if(pending||approved)return;
    setPending(true);setError("");
    try{
      const response=await secureFetch("/api/mobile/auth/approve",{
        method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ticket})
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok||data.data?.approved!==true)
        throw Error(response.status===410?"Connection expired. Start again in the app.":"Unable to approve phone connection.");
      setApproved(true);
    }catch(e){setError(e instanceof Error?e.message:"Unable to connect");}
    finally{setPending(false);}
  }
  return <section className="rounded-2xl border border-[#dac6ad] bg-white p-7 text-[#34232e]">
    <p className="text-xs font-bold uppercase tracking-widest text-[#71344b]">Secure Naksharix Login</p>
    <h1 className="mt-4 text-2xl font-black">Connect your Android app</h1>
    <p className="mt-3 text-sm leading-7">Signed in as <strong>{accountName}</strong>.
      Approve only if you just opened this page from your own phone.</p>
    <p className="mt-3 text-sm leading-7">The phone gets a separate limited mobile session for
      your own saved records, never your website cookies, Google password or admin privileges.</p>
    {approved?<div role="status" className="mt-6 rounded-xl border border-emerald-300 bg-emerald-50 p-5">
      Connection approved. Return to your Naksharix Android app to load your history.
    </div>:<>
      <button type="button" disabled={pending} onClick={approve}
        className="mt-6 min-h-12 w-full rounded-xl bg-[#71344b] px-5 py-3 font-semibold text-white disabled:opacity-50">
        {pending?"Connecting...":"Yes, connect my Android app"}
      </button>
      {error?<p role="alert" className="mt-3 text-sm text-red-700">{error}</p>:null}
      <p className="mt-4 text-xs leading-6">Expires in five minutes. Never approve an unexpected request.</p>
    </>}
  </section>;
}
