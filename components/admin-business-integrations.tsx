"use client";
import {useEffect,useState,useCallback,useRef} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useLanguage} from "@/components/language-provider";
import {secureFetch} from "@/lib/security/csrf";
import {businessScopes,type BusinessScope} from "@/lib/business-integrations/contract";
import {businessWorkspaceCopy,businessFieldLabels,businessScopeLabel,businessStatusLabel,businessNumber,businessErrorMessage,type BusinessWorkspaceMessage} from "@/lib/business-integrations/workspace-copy";
type Tenant={id:string;displayName:string;brandName:string;status:string;contractExpiresAt:string;monthlyUnitLimit:number;unitPricePaise:number;scopes:string[];contractReference:string};
const emptyFields={ownerEmail:"",displayName:"",brandName:"",contractReference:"",contractExpiresAt:"",monthlyUnitLimit:"",unitPricePaise:""};

export function AdminBusinessIntegrationsHeading(){const {locale}=useLanguage();return <h1 className="mb-5 font-cinzel text-3xl font-bold">{businessWorkspaceCopy[locale].adminTitle}</h1>;}

export function AdminBusinessIntegrations(){
 const {locale}=useLanguage(),c=businessWorkspaceCopy[locale],labels=businessFieldLabels[locale];
 const [tenants,setTenants]=useState<Tenant[]>([]),[enabled,setEnabled]=useState(false),[message,setMessage]=useState<BusinessWorkspaceMessage|null>(null),[busy,setBusy]=useState(false),[confirmed,setConfirmed]=useState(false),[scopes,setScopes]=useState<BusinessScope[]>([]);
 const [fields,setFields]=useState(emptyFields),inFlight=useRef(false);
 const refresh=useCallback(async()=>{
  try{
   const r=await fetch("/api/admin/business-integrations",{cache:"no-store"}),j=await r.json();
   if(!r.ok){setEnabled(false);setMessage(businessErrorMessage(j?.error,r.status,"registryUnavailable"));return;}
   if(!Array.isArray(j?.data?.tenants)||typeof j?.data?.enabled!=="boolean")throw Error("Invalid registry response");
   setTenants(j.data.tenants);setEnabled(j.data.enabled);
  }catch{setEnabled(false);setMessage("registryUnavailable");}
 },[]);
 useEffect(()=>{void refresh();},[refresh]);
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();if(inFlight.current||!confirmed)return;inFlight.current=true;setBusy(true);setMessage(null);
  try{
   const r=await secureFetch("/api/admin/business-integrations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...fields,monthlyUnitLimit:Number(fields.monthlyUnitLimit),unitPricePaise:Number(fields.unitPricePaise),scopes,ownerConfirmed:confirmed}),silent:true}),j=await r.json();
   if(!r.ok){setMessage(businessErrorMessage(j?.error,r.status,"actionUnconfirmed"));return;}
   const saved=j?.data?.tenant;
   if(typeof saved?.id!=="string"||!saved.id||saved.status!=="ACTIVE"||saved.displayName!==fields.displayName.trim()||saved.brandName!==fields.brandName.trim()||saved.monthlyUnitLimit!==Number(fields.monthlyUnitLimit)||saved.unitPricePaise!==Number(fields.unitPricePaise)||!Array.isArray(saved.scopes)||saved.scopes.length!==scopes.length||!scopes.every(s=>saved.scopes.includes(s))){setMessage("actionUnconfirmed");return;}
   setMessage("accessSaved");setConfirmed(false);setFields(emptyFields);setScopes([]);await refresh();
  }catch{setMessage("actionUnconfirmed");}finally{inFlight.current=false;setBusy(false);}
 }
 async function revoke(id:string){
  if(inFlight.current||!window.confirm(c.revokeTenantPrompt))return;inFlight.current=true;setBusy(true);
  try{
   const r=await secureFetch("/api/admin/business-integrations",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({tenantId:id,confirmed:true}),silent:true}),j=await r.json();
   setMessage(r.ok&&j?.data?.revoked===true?"tenantRevoked":businessErrorMessage(j?.error,r.status,"revokeUnconfirmed"));await refresh();
  }catch{setMessage("revokeUnconfirmed");}finally{inFlight.current=false;setBusy(false);}
 }
 return <div className="space-y-6">{!enabled?<p>{c.contractsDisabled}</p>:<form onSubmit={submit} aria-busy={busy} className="rounded-xl border bg-white text-[#35242b] p-5 space-y-4"><h2 className="text-xl font-bold">{c.approveTitle}</h2>
 {([["ownerEmail","email"],["displayName","text"],["brandName","text"],["contractReference","text"],["contractExpiresAt","date"],["monthlyUnitLimit","number"],["unitPricePaise","number"]] as const).map(([key,type])=><label key={key} className="block text-sm font-medium">{labels[key]}<Input type={type} required min={type==="number"?key==="monthlyUnitLimit"?1:0:undefined} step={type==="number"?1:undefined} max={type==="number"?key==="monthlyUnitLimit"?1000000:100000:undefined} value={fields[key]} onChange={e=>setFields(v=>({...v,[key]:e.target.value}))}/></label>)}
 <fieldset><legend className="font-semibold">{c.contractedScopes}</legend>{businessScopes.map(s=><label key={s} className="mt-2 flex gap-2"><input type="checkbox" checked={scopes.includes(s)} onChange={e=>setScopes(v=>e.target.checked?[...v,s]:v.filter(x=>x!==s))}/>{businessScopeLabel(s,locale)} <code>({s})</code></label>)}</fieldset>{scopes.includes("chart-pdf")?<p className="text-sm">{c.pdfBrandHelp}</p>:null}<label className="flex items-start gap-2"><input type="checkbox" required checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>{c.ownerConfirmation}</label><Button disabled={busy||!confirmed||!scopes.length}>{c.approveAccess}</Button></form>}
 <section className="rounded-xl border bg-white text-[#35242b] p-5"><h2 className="font-bold text-xl">{c.contractsTitle}</h2>{!tenants.length?<p className="mt-3 text-sm">{c.noReturnedContracts}</p>:tenants.map(t=><div key={t.id} className="mt-3 rounded-lg border p-3"><p className="font-semibold">{t.displayName} · {businessStatusLabel(t.status,locale)}</p><p className="text-sm">{t.brandName} · {t.contractReference} · {t.scopes.map(s=>businessScopeLabel(s,locale)).join(", ")} · {businessNumber(t.monthlyUnitLimit,locale)} {c.unitsPerMonth}</p>{t.status==="ACTIVE"?<Button className="mt-3" variant="outline" disabled={busy} onClick={()=>void revoke(t.id)}>{c.revokeAccess}</Button>:null}</div>)}</section>{message?<p role="status" aria-live="polite">{c[message]}</p>:null}<Button variant="outline" disabled={busy} onClick={()=>void refresh()}>{c.refresh}</Button></div>;
}
