"use client";
import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { SERVICES, REQUEST_TERMS } from "@/lib/deferred-services/contract";
import { SHIPPING_COUNTRIES } from "@/lib/shop/shipping-rules";
import { secureFetch } from "@/lib/security/csrf";

export function DeferredServiceRequestForm(){
  const [kind,setKind]=useState<string>(SERVICES[0].kind),[units,setUnits]=useState<number>(SERVICES[0].min),[target,setTarget]=useState(""),[preferredDate,setDate]=useState(""),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
  const [saved,setSaved]=useState(false);
  const pending=useRef<{key:string;id:string}|null>(null);
  const locked=useRef(false);
  const item=SERVICES.find(s=>s.kind===kind)!;
  async function submit(event:FormEvent){
    event.preventDefault();
    if(locked.current||!consent)return;
    locked.current=true;setBusy(true);setMessage("");setSaved(false);
    const body={kind,units,target,preferredDate,consent:REQUEST_TERMS};
    const key=JSON.stringify(body);
    try{
      if(pending.current?.key!==key)pending.current={key,id:crypto.randomUUID()};
      const result=await secureFetch("/api/deferred-services/requests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...body,requestId:pending.current.id}),silent:true});
      const json=await result.json();
      if(!result.ok||!json.data?.ticket?.id){setMessage(json.error||"Request not confirmed. Please retry.");return;}
      setMessage("Your unpaid review request is recorded. No payment or reservation has been made.");setSaved(true);
    }catch{setMessage("Request not confirmed. Retry without changing the details.");}
    finally{setBusy(false);locked.current=false;}
  }
  return <form onSubmit={submit} className="space-y-4">
    <fieldset disabled={busy||saved} className="space-y-4">
      <label className="block">Service<select className="block w-full rounded border bg-transparent p-3" value={kind} onChange={event=>{const selected=SERVICES.find(s=>s.kind===event.target.value)!;setKind(selected.kind);setUnits(selected.min);setTarget("");}}>{SERVICES.map(s=><option key={s.id} value={s.kind}>{s.title}</option>)}</select></label>
      <label className="block">{item.unit}<input className="block w-full rounded border bg-transparent p-3" type="number" min={item.min} max={item.max} value={units} required onChange={e=>setUnits(Number(e.target.value))}/></label>
      {item.target==="country"?<label className="block">Destination country<select required className="block w-full rounded border bg-transparent p-3" value={target} onChange={e=>setTarget(e.target.value)}><option value="">Choose country</option>{SHIPPING_COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}</select></label>:item.target!=="none"?<label className="block">{item.target==="temple"?"Temple and city":"City"}<input className="block w-full rounded border bg-transparent p-3" value={target} maxLength={100} required onChange={e=>setTarget(e.target.value)}/></label>:null}
      <label className="block">Preferred date (optional)<input className="block w-full rounded border bg-transparent p-3" type="date" value={preferredDate} onChange={e=>setDate(e.target.value)}/></label>
      <p>Before purchase, staff must verify: {item.review}.</p>
      <label className="flex gap-2"><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}/>I understand this is an unpaid review request, not a booking, paid entitlement or confirmed service.</label>
      <button type="submit" disabled={busy||!consent||saved} className="rounded border px-5 py-3 font-semibold disabled:opacity-50">{busy?"Submitting…":"Request review"}</button>
    </fieldset>
    <p role="status" aria-live="polite">{message}</p>{saved?<Link href="/support" className="underline">Track request in support</Link>:null}
  </form>;
}
