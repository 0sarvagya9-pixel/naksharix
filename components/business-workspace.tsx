"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useLanguage} from "@/components/language-provider";
import {secureFetch} from "@/lib/security/csrf";
import {businessScopes,parseBusinessAuthorization,type BusinessScope} from "@/lib/business-integrations/contract";
import {businessWorkspaceCopy,businessScopeLabel,businessStatusLabel,businessMoney,businessNumber,businessDate,businessErrorMessage,type BusinessWorkspaceMessage} from "@/lib/business-integrations/workspace-copy";
type Key={id:string;label:string;scopes:string[];expiresAt:string;revokedAt:string|null};
type Usage={period:string;attemptedUnits:number;completedUnits:number;failedUnits:number;unitPricePaise:number};
type Tenant={id:string;displayName:string;brandName:string;status:string;contractExpiresAt:string;monthlyUnitLimit:number;unitPricePaise:number;scopes:string[];keys:Key[];usage:Usage[]};

export function BusinessWorkspaceHeading(){const {locale}=useLanguage(),c=businessWorkspaceCopy[locale];return <><h1 className="font-cinzel text-3xl font-black text-[#70283d]">{c.pageTitle}</h1><p className="my-5">{c.introduction}</p></>;}

export function BusinessWorkspace(){
 const {locale}=useLanguage(),c=businessWorkspaceCopy[locale];
 const [tenants,setTenants]=useState<Tenant[]>([]),[enabled,setEnabled]=useState(false),[loaded,setLoaded]=useState(false),[selected,setSelected]=useState(""),[label,setLabel]=useState(""),[scopes,setScopes]=useState<BusinessScope[]>([]),[secret,setSecret]=useState(""),[busy,setBusy]=useState(false),[notice,setNotice]=useState<BusinessWorkspaceMessage|null>(null);
 const inFlight=useRef(false);
 const refresh=useCallback(async()=>{
  try{
   const r=await fetch("/api/business-workspace",{cache:"no-store"}),j=await r.json();
   if(!r.ok){setNotice(businessErrorMessage(j?.error,r.status,"workspaceUnavailable"));setLoaded(false);setEnabled(false);return;}
   if(!Array.isArray(j?.data?.tenants)||typeof j?.data?.enabled!=="boolean")throw Error("Invalid registry response");
   setTenants(j.data.tenants);setEnabled(j.data.enabled);setLoaded(true);
  }catch{setLoaded(false);setEnabled(false);setNotice("workspaceUnavailable");}
 },[]);
 useEffect(()=>{void refresh();},[refresh]);
 async function issue(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();if(inFlight.current)return;inFlight.current=true;setBusy(true);setSecret("");setNotice(null);
  try{
   const r=await secureFetch("/api/business-workspace",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tenantId:selected,label,scopes}),silent:true}),j=await r.json();
   if(!r.ok){setNotice(businessErrorMessage(j?.error,r.status,"keyUnconfirmed"));return;}
   const token=parseBusinessAuthorization("Bearer "+j?.data?.key),record=j?.data?.record;
   if(!token||record?.id!==token.id||record?.label!==label.trim()||!Array.isArray(record?.scopes)||record.scopes.length!==scopes.length||!scopes.every(s=>record.scopes.includes(s))){setNotice("keyUnconfirmed");return;}
   setSecret(token.raw);setNotice("keyIssued");await refresh();
  }catch{setNotice("keyUnconfirmed");}finally{inFlight.current=false;setBusy(false);}
 }
 async function revoke(tenantId:string,keyId:string){
  if(inFlight.current||!window.confirm(c.revokeKeyPrompt))return;inFlight.current=true;setBusy(true);setSecret("");
  try{
   const r=await secureFetch("/api/business-workspace",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({tenantId,keyId}),silent:true}),j=await r.json();
   setNotice(r.ok&&j?.data?.revoked===true?"keyRevoked":businessErrorMessage(j?.error,r.status,"revokeUnconfirmed"));
  }catch{setNotice("revokeUnconfirmed");}finally{await refresh();inFlight.current=false;setBusy(false);}
 }
 const tenant=tenants.find(t=>t.id===selected);
 return <div className="space-y-6">{!loaded?<p role="status">{c.loading}</p>:!tenants.length?<p>{c.emptyContracts}</p>:null}
 {tenants.map(t=><section key={t.id} className="rounded-xl border border-[#dfc5ac] bg-white p-5"><h2 className="text-xl font-bold">{t.displayName}</h2><p className="text-sm mt-2">{businessStatusLabel(t.status,locale)} · {c.contractEnds} {businessDate(t.contractExpiresAt,locale)} (UTC) · {businessNumber(t.monthlyUnitLimit,locale)} {c.monthlyUnits}</p><p className="text-sm mt-2">{c.brand}: {t.brandName} · {c.contractRate} {businessMoney(t.unitPricePaise,locale)}/{c.completedUnit}. {c.statementDisclosure}</p>
 {enabled&&t.status==="ACTIVE"&&Date.parse(t.contractExpiresAt)>Date.now()?<Button className="mt-3" variant="outline" disabled={busy} onClick={()=>{setSelected(t.id);setScopes([]);setLabel("");setSecret("");}}>{c.manageKey}</Button>:null}
 <h3 className="mt-5 font-semibold">{c.apiKeys}</h3>{!t.keys.length?<p className="text-sm">{c.noKeys}</p>:t.keys.map(k=><div key={k.id} className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"><div><p className="font-medium">{k.label}</p><p className="text-xs">{k.scopes.map(s=>businessScopeLabel(s,locale)).join(", ")} · {k.revokedAt?c.revoked:Date.parse(k.expiresAt)<=Date.now()?c.expired:c.expires+" "+businessDate(k.expiresAt,locale)+" (UTC)"}</p></div>{!k.revokedAt?<Button variant="outline" size="sm" disabled={busy} onClick={()=>void revoke(t.id,k.id)}>{c.revoke}</Button>:null}</div>)}
 <h3 className="mt-5 font-semibold">{c.usageTitle}</h3><div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">{c.usageTitle}</caption><thead><tr>{[c.utcMonth,c.attemptUnits,c.completed,c.failed,c.estimatedCharge].map(s=><th key={s} scope="col" className="p-2">{s}</th>)}</tr></thead><tbody>{t.usage.map(u=><tr key={u.period} className="border-t"><td className="p-2">{u.period}</td><td className="p-2">{businessNumber(u.attemptedUnits,locale)}</td><td className="p-2">{businessNumber(u.completedUnits,locale)}</td><td className="p-2">{businessNumber(u.failedUnits,locale)}</td><td className="p-2">{businessMoney(u.completedUnits*u.unitPricePaise,locale)}</td></tr>)}</tbody></table></div>{!t.usage.length?<p className="text-xs mt-2">{c.noUsage}</p>:null}</section>)}
 {tenant&&enabled?<form onSubmit={issue} aria-busy={busy} className="space-y-4 rounded-xl border bg-white p-5"><h2 className="font-bold">{c.newKeyTitle} {tenant.displayName}</h2><label className="block">{c.keyLabel}<Input value={label} required minLength={2} maxLength={60} onChange={e=>setLabel(e.target.value)}/></label><fieldset><legend>{c.scopes}</legend>{businessScopes.filter(s=>tenant.scopes.includes(s)).map(s=><label key={s} className="flex gap-2 items-center mt-2"><input type="checkbox" checked={scopes.includes(s)} onChange={e=>setScopes(prev=>e.target.checked?[...prev,s]:prev.filter(x=>x!==s))}/>{businessScopeLabel(s,locale)} <code>({s})</code></label>)}</fieldset><p className="text-sm">{c.keySafety}</p><Button disabled={busy||!scopes.length}>{c.issueKey}</Button></form>:null}
 {secret?<div className="rounded-xl border bg-white p-4"><h3 className="font-bold">{c.secretTitle}</h3><code className="block mt-3 break-all select-all">{secret}</code><div className="mt-3 flex gap-3"><Button type="button" onClick={()=>void navigator.clipboard.writeText(secret).then(()=>setNotice("copied")).catch(()=>setNotice("copyManually"))}>{c.copyKey}</Button><Button variant="outline" onClick={()=>setSecret("")}>{c.hideKey}</Button></div></div>:null}
 <section className="rounded-xl border bg-white p-5"><h2 className="font-bold">{c.integrationTitle}</h2><p className="mt-3 text-sm">{c.integrationInstructions}</p><pre className="mt-3 overflow-x-auto rounded bg-[#f7efe6] p-3 text-xs">{JSON.stringify({requestId:"12345678-1234-4123-8123-123456789abc",scope:"panchang",location:{date:"2027-01-15",latitude:28.6139,longitude:77.209,offsetMinutes:330}},null,2)}</pre></section>
 {notice?<p role="status" aria-live="polite" className="rounded border p-3">{c[notice]}</p>:null}<Button variant="outline" disabled={busy} onClick={()=>void refresh()}>{c.refresh}</Button></div>;
}
