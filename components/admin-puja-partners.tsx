"use client";

import { useEffect, useState, useRef, useCallback, type FormEvent } from "react";
import { secureFetch } from "@/lib/security/csrf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { allPujaTopics, findKumbhEvent, kumbhEventVisible } from "@/lib/puja/service-catalogue";

import {useLanguage} from "@/components/language-provider";
import {adminCatalogueCopy,partnerReviewLabel,type CatalogueMessage} from "@/lib/admin/catalogue-copy";
import {isPujaPartner,matchingPartnerCreate,safeEvidenceLink,type PujaPartner as Partner} from "@/lib/admin/catalogue-client-contract";
export function AdminPujaPartners() {
  const {locale}=useLanguage(),copy=adminCatalogueCopy(locale);
  const lock=useRef(false),sequence=useRef(0);
  const [ready,setReady]=useState(false),[loading,setLoading]=useState(true);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [traditions, setTraditions] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<CatalogueMessage|null>(null);

  const load=useCallback(async()=>{const n=++sequence.current;setLoading(true);try{const r=await fetch("/api/admin/puja-partners",{cache:"no-store"});const j=await r.json().catch(()=>null);if(n!==sequence.current)return;const list=j?.data?.partners;if(!r.ok||!Array.isArray(list)||!list.every(isPujaPartner))throw Error("Unconfirmed registry");setPartners(list);setReady(true);setMessage(current=>current==="loadFailed"?null:current);}catch{if(n===sequence.current){setReady(false);setMessage("loadFailed");}}finally{if(n===sequence.current)setLoading(false);}},[]);
  useEffect(()=>{void load();return()=>{sequence.current++;};},[load]);
  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (lock.current||!ready) return;lock.current=true;sequence.current++;setLoading(false);
    setBusy(true); setMessage(null);
    const input={name:name.trim(),region:region.trim(),traditions:[...new Set(traditions.split(",").map(value=>value.trim()).filter(Boolean))],evidenceUrl:evidenceUrl.trim()||null};
    try {
      const r = await secureFetch("/api/admin/puja-partners", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({...input,evidenceUrl:input.evidenceUrl??undefined}),silent:true
      });
      const j = await r.json().catch(()=>null);
      if (!r.ok||!matchingPartnerCreate(j?.data?.partner,input)) throw new Error("Unconfirmed partner");
      setName(""); setRegion(""); setTraditions(""); setEvidenceUrl("");
      setMessage("partnerSaved");
      await load();
    } catch {
      setReady(false);setMessage("unknown");
    } finally { lock.current=false;setBusy(false); }
  }
  async function review(partnerId: string, decision: "VERIFIED" | "REJECTED" | "SUSPENDED") {
    if (lock.current||!ready) return;lock.current=true;sequence.current++;setLoading(false);
    setBusy(true); setMessage(null);
    try {
      const r = await secureFetch("/api/admin/puja-partners", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId, decision, note: reviewNote.trim() }),silent:true
      });
      const j = await r.json().catch(()=>null);
      if (!r.ok||j?.data?.recorded!==true||j.data.partnerId!==partnerId||j.data.reviewStatus!==decision) throw new Error("Unconfirmed review");
      setMessage("reviewSaved");
      await load();
    } catch {
      setReady(false);setMessage("unknown");
    } finally { lock.current=false;setBusy(false); }
  }
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      <form onSubmit={create} className="space-y-3 rounded-2xl border border-[#D4AF37]/20 p-5">
        <fieldset disabled={busy||!ready} className="space-y-3"><h2 className="font-cinzel text-xl font-bold">{copy.register}</h2>
        <label className="grid gap-1 text-sm">{copy.name}
          <Input required minLength={3} maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="grid gap-1 text-sm">{copy.region}
          <Input required minLength={3} maxLength={100} value={region} onChange={(e) => setRegion(e.target.value)} />
        </label>
        <label className="grid gap-1 text-sm">{copy.traditions}
          <Input required value={traditions} onChange={(e) => setTraditions(e.target.value)} />
        </label>
        <label className="grid gap-1 text-sm">{copy.addTopic}
          <select aria-label={copy.addTopic} defaultValue="" onChange={e=>{
            if (!e.target.value) return;
            setTraditions(current => [...new Set([...current.split(",").map(x=>x.trim()).filter(Boolean),e.target.value])].join(", "));
            e.target.value="";
          }} className="rounded-lg border border-[#cba879] bg-white p-3">
            <option value="">{copy.selectTopic}</option>
            {allPujaTopics.filter(topic=>!findKumbhEvent(topic.id)||kumbhEventVisible(findKumbhEvent(topic.id)!)).map(topic=><option key={topic.id} value={topic.id}>{topic.name}</option>)}
          </select>
        </label>
        <p className="text-xs leading-6 naksh-muted-text">{copy.capability}</p>
        <label className="grid gap-1 text-sm">{copy.evidence}
          <Input type="url" maxLength={500} value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} />
        </label>
        <Button type="submit" disabled={busy}>{copy.create}</Button></fieldset>
      </form>
      <div className="space-y-3">
        <h2 className="font-cinzel text-xl font-bold">{copy.queue}</h2>
        <Button type="button" variant="outline" disabled={busy} onClick={()=>void load()}>{copy.refresh}</Button>
        {loading?<p role="status">{copy.loading}</p>:null}
        <label className="grid gap-1 text-sm">{copy.reviewNote}
          <Input disabled={busy||!ready} required minLength={5} maxLength={300} value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} />
        </label>
        {partners.map((partner) => (
          <div key={partner.id} className="space-y-2 rounded-2xl border border-[#D4AF37]/20 p-4 text-sm">
            <h3 className="font-bold">{partner.name} · {partner.region}</h3>
            <p className="naksh-muted-text">{partner.traditions.join(", ")} · {partnerReviewLabel(partner.reviewStatus,locale)}</p>
            {safeEvidenceLink(partner.evidenceUrl) ? <a target="_blank" rel="noopener noreferrer"
              href={safeEvidenceLink(partner.evidenceUrl)!} className="text-[#FFD700] underline">{copy.viewEvidence}</a> :
              <p className="text-xs naksh-muted-text">{copy.noEvidence}</p>}
            <div className="flex flex-wrap gap-2">
              {(["VERIFIED", "REJECTED", "SUSPENDED"] as const).map((decision) => (
                <Button key={decision} type="button" size="sm" variant="outline"
                  disabled={busy || !ready || reviewNote.trim().length < 5}
                  onClick={() => void review(partner.id, decision)}>{partnerReviewLabel(decision,locale)}</Button>
              ))}
            </div>
          </div>
        ))}
        {ready&&!partners.length ? <p className="text-sm naksh-muted-text">{copy.noPartners}</p> : null}
        {message ? <p role="status" className="text-sm naksh-muted-text">{copy[message]}</p> : null}
      </div>
    </div>
  );
}
