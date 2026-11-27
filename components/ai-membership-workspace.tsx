"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {useLanguage} from "@/components/language-provider";
import {secureFetch} from "@/lib/security/csrf";
import {MEMBERSHIP_TERMS_VERSION,safeSubscriptionLink,terminalMembershipStates,type MembershipOffer} from "@/lib/ai/membership-contract";
import {readMembershipAccount,readMembershipRecord,membershipMatchesOffer,type MembershipRow} from "@/lib/ai/customer-contract";
import {aiCustomerCopy,membershipStateLabel} from "@/lib/ai/customer-copy";
type Notice="createUnconfirmed"|"created"|"reconciliation"|"actionUnconfirmed"|"canceled"|"terminal"|"cancelUnconfirmed"|"refreshed"|null;
export function AiMembershipWorkspace(){
 const {locale}=useLanguage(),copy=aiCustomerCopy(locale);
 const [offer,setOffer]=useState<MembershipOffer|null>(null),[rows,setRows]=useState<MembershipRow[]>([]),[accepted,setAccepted]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState<Notice>(null),[status,setStatus]=useState<"loading"|"ready"|"unknown">("loading");
 const intent=useRef<string|null>(null),lock=useRef(false),sequence=useRef(0),confirmedId=useRef<string|null>(null);
 const refresh=useCallback(async()=>{
  const request=++sequence.current;setStatus("loading");setAccepted(false);
  try{const response=await fetch("/api/ai/membership",{cache:"no-store"}),json=await response.json();if(request!==sequence.current)return false;const account=readMembershipAccount(json?.data);if(!response.ok||!account)throw Error("Unconfirmed");setOffer(account.offer);setRows(account.memberships);setStatus("ready");
   if(confirmedId.current&&account.memberships.some(row=>row.id===confirmedId.current&&(terminalMembershipStates as readonly string[]).includes(row.state))){intent.current=null;confirmedId.current=null;}
   return true;
  }catch{if(request===sequence.current)setStatus("unknown");return false;}
 },[]);
 useEffect(()=>{const requests=sequence;void refresh();return()=>{requests.current++;};},[refresh]);
 const unresolved=rows.some(row=>!(terminalMembershipStates as readonly string[]).includes(row.state));
 async function start(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();if(lock.current||status!=="ready"||unresolved||!offer||!accepted)return;
  lock.current=true;setBusy(true);setNotice(null);sequence.current++;
  const requested=offer;intent.current??=crypto.randomUUID();
  try{const response=await secureFetch("/api/ai/membership",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...requested,clientIntent:intent.current,accepted:true,termsVersion:MEMBERSHIP_TERMS_VERSION}),silent:true}),json=await response.json();const row=readMembershipRecord(json?.data?.membership);
   if(!response.ok||!row||!membershipMatchesOffer(row,requested))throw Error("Unconfirmed");
   confirmedId.current=row.id;setNotice(row.state==="REVIEW"?"reconciliation":"created");setAccepted(false);await refresh();
  }catch{setNotice("createUnconfirmed");setStatus("unknown");setAccepted(false);}finally{lock.current=false;setBusy(false);}
 }
 async function control(row:MembershipRow,action:"REFRESH"|"CANCEL"){
  if(lock.current||status!=="ready"||!row.canCancel||action==="CANCEL"&&!window.confirm(copy.cancelConfirm))return;
  lock.current=true;setBusy(true);setNotice(null);sequence.current++;
  try{const response=await secureFetch("/api/ai/membership",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:row.id,action,...(action==="CANCEL"?{confirmed:true}:{})}),silent:true}),json=await response.json();const saved=readMembershipRecord(json?.data?.membership);
   if(!response.ok||!saved||saved.id!==row.id||!membershipMatchesOffer(saved,row))throw Error("Unconfirmed");
   setNotice(action==="CANCEL"?saved.state==="CANCELED"?"canceled":saved.state==="COMPLETED"||saved.state==="EXPIRED"?"terminal":"cancelUnconfirmed":"refreshed");await refresh();
  }catch{setNotice("actionUnconfirmed");setStatus("unknown");setAccepted(false);}finally{lock.current=false;setBusy(false);}
 }
 const money=(value:number)=>new Intl.NumberFormat(locale==="hi"?"hi-IN":"en-IN",{style:"currency",currency:"INR"}).format(value/100);
 return <div className="space-y-6">
  <section className="rounded-2xl bg-white border p-5"><h2 className="text-xl font-bold">{copy.monthlyTitle}</h2>
   {status==="loading"?<p role="status" className="mt-3">{copy.checking}</p>:status==="unknown"?<p role="alert" className="mt-3">{copy.membershipError}</p>:!offer?<p className="mt-3">{copy.membershipInactive}</p>:unresolved?<p className="mt-3">{copy.reviewExisting}</p>:<form onSubmit={start} className="mt-4 space-y-4"><fieldset disabled={busy} className="space-y-4"><p className="text-2xl font-bold">{money(offer.pricePaise)} / {copy.month}</p><p>{offer.unitsPerCycle} {copy.cycleQuantity} {offer.totalCycles} {copy.charges} ({money(offer.pricePaise*offer.totalCycles)} {copy.maximum}).</p><p className="text-sm leading-6">{copy.membershipTerms}</p><label className="flex gap-2 items-start text-sm"><input type="checkbox" required checked={accepted} onChange={event=>setAccepted(event.target.checked)}/><span>{copy.authorize} <Link href="/refund-policy" className="underline">{copy.refundPolicy}</Link> {copy.authorizeEnd}</span></label><Button disabled={!accepted||busy}>{copy.create}</Button></fieldset></form>}
  </section>
  <section className="rounded-2xl bg-white border p-5"><h2 className="text-xl font-bold">{copy.records}</h2>{status==="ready"&&!rows.length?<p className="mt-3">{copy.none}</p>:null}
   {rows.map(row=>{const url=status==="ready"&&row.state==="AWAITING_AUTHORIZATION"&&row.providerState==="created"?safeSubscriptionLink(row.authorizationUrl):null;return <article key={row.id} className="mt-4 rounded-xl border p-4 space-y-3"><h3 className="font-bold">{money(row.pricePaise)}/{copy.month} · {row.unitsPerCycle} {copy.credits}</h3><p className="text-sm">{membershipStateLabel(row.state,locale)} · {copy.provider} {row.providerState?membershipStateLabel(row.providerState,locale):copy.unconfirmed}</p><p className="text-xs">{copy.reference} {row.id}</p>{url?<a className="inline-flex rounded-lg bg-[#70283d] px-4 py-3 text-white font-semibold" href={url} target="_blank" rel="noopener noreferrer">{copy.authorizeLink}</a>:null}<div className="flex flex-wrap gap-2">{row.canCancel?<><Button variant="outline" disabled={busy||status!=="ready"} onClick={()=>void control(row,"REFRESH")}>{copy.refreshProvider}</Button><Button variant="outline" disabled={busy||status!=="ready"} onClick={()=>void control(row,"CANCEL")}>{copy.cancel}</Button></>:null}</div>{row.state==="REVIEW"||row.state==="CANCEL_PENDING"?<p className="text-sm">{copy.reconciliation}</p>:null}{row.cycles.length?<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{[copy.cycle,copy.periodEnd,copy.payment,copy.availableCredits].map(label=><th key={label} scope="col" className="p-2">{label}</th>)}</tr></thead><tbody>{row.cycles.map(cycle=><tr key={cycle.cycleNumber} className="border-t"><td className="p-2">{cycle.cycleNumber}</td><td className="p-2">{new Date(cycle.periodEnd).toLocaleString(locale==="hi"?"hi-IN":"en-IN",{timeZone:"Asia/Kolkata",timeZoneName:"short"})}</td><td className="p-2">{membershipStateLabel(cycle.paymentStatus,locale)}</td><td className="p-2">{cycle.availableUnits}</td></tr>)}</tbody></table></div>:<p className="text-sm">{copy.noCycles}</p>}</article>;})}
  </section>
  {notice?<p role="status" className="rounded border bg-white p-4">{copy[notice]}</p>:null}
  <div className="flex flex-wrap gap-3"><Button variant="outline" disabled={busy} onClick={()=>void refresh()}>{copy.refreshRecords}</Button><Link href="/ai-astrologer" className="underline">{copy.useCredits}</Link><Link href="/dashboard" className="underline">{copy.paymentHistory}</Link><Link href="/support" className="underline">{copy.support}</Link></div>
 </div>;
}
