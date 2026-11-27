"use client";

import { useRef,useState,type FormEvent } from "react";
import { CalendarPlus, Power, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { secureFetch } from "@/lib/security/csrf";
import { errorClass, isBlank, scrollToFirstError, type FieldErrors } from "@/lib/form-validation";
import { useLanguage } from "@/components/language-provider";
import {validConsultationSlotWindow} from "@/lib/consultations/slot-contract";
import {readProviderSlot,type ProviderSlot} from "@/lib/astrologers/client-contract";
import {workspaceCopy,workspaceFailure,type WorkspaceMessage} from "@/lib/astrologers/workspace-copy";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

type Slot=ProviderSlot;

export function AvailabilityForm({ slots = [] }: { slots?: Slot[] }) {
  const { requiredMessage,locale } = useLanguage(),copy=workspaceCopy(locale);
  const [uncertain,setUncertain]=useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<WorkspaceMessage | null>(null);
  const [localSlots, setLocalSlots] = useState(slots);
  const mutation=useRef(false),[busy,setBusy]=useState(false);

  async function mutate(method:"POST"|"PATCH"|"DELETE",payload:Record<string,unknown>,apply:(data:Record<string,unknown>)=>boolean){
    if(mutation.current||uncertain)return;mutation.current=true;setBusy(true);setStatus(null);
    try{
      const response=await secureFetch("/api/astrologer/availability",{silent:true,method,headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const json=await response.json().catch(()=>null);
      if(!response.ok){const kind=workspaceFailure(response.status);setStatus(kind);setUncertain(kind==="uncertain"||kind==="conflict");return;}
      if(!json?.data||!apply(json.data))throw Error("Unconfirmed slot");
      setStatus("slotSaved");
    }catch{setStatus("uncertain");setUncertain(true);}
    finally{mutation.current=false;setBusy(false);}
  }
  async function addSlot(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const form=event.currentTarget,formData=new FormData(form);
    const required=["dayOfWeek","startTime","endTime","status","consultationType"];
    const nextErrors=required.reduce<FieldErrors>((acc,field)=>{if(isBlank(formData.get(field)))acc[field]=requiredMessage;return acc;},{});
    const payload={dayOfWeek:Number(formData.get("dayOfWeek")),startTime:String(formData.get("startTime")??""),endTime:String(formData.get("endTime")??""),isHoliday:formData.get("isHoliday")==="on",isActive:formData.get("isActive")==="on",consultationType:String(formData.get("consultationType")??""),status:String(formData.get("status")??"")};
    if(!Object.keys(nextErrors).length&&!validConsultationSlotWindow(payload))nextErrors.endTime=copy.slotInvalid;
    setErrors(nextErrors);
    if(Object.keys(nextErrors).length){scrollToFirstError(nextErrors);return;}
    await mutate("POST",payload,data=>{
      const slot=readProviderSlot(data.slot);
      if(!slot||Object.entries(payload).some(([key,value])=>(slot as unknown as Record<string,unknown>)[key]!==value))return false;
      setLocalSlots(current=>current.some(x=>x.id===slot.id)?current:[...current,slot]);form.reset();return true;
    });
  }
  async function updateSlot(slotId:string,isActive:boolean){
    await mutate("PATCH",{slotId,isActive},data=>{
      const slot=readProviderSlot(data.slot),previous=localSlots.find(x=>x.id===slotId);if(!slot||!previous||slot.id!==slotId||slot.isActive!==isActive||["dayOfWeek","startTime","endTime","isHoliday","consultationType","status"].some(key=>(slot as unknown as Record<string,unknown>)[key]!==(previous as unknown as Record<string,unknown>)[key]))return false;
      setLocalSlots(current=>current.map(x=>x.id===slotId?slot:x));return true;
    });
  }
  async function deleteSlot(slotId:string){
    await mutate("DELETE",{slotId},data=>{if(data.success!==true)return false;setLocalSlots(current=>current.filter(x=>x.id!==slotId));return true;});
  }

  function clear(field: string) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  return (
    <div className="space-y-6">
      <form onSubmit={addSlot} className="rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4"><fieldset disabled={busy||uncertain} className="grid gap-4 md:grid-cols-6">
        <div className="space-y-2">
          <Label htmlFor="availability-day">{copy.day}</Label>
          <select id="availability-day" name="dayOfWeek" data-field="dayOfWeek" defaultValue="1" className={`h-10 w-full rounded-md border border-[#D4AF37]/20 bg-[#02112C] px-3 text-sm ${errorClass(Boolean(errors.dayOfWeek))}`} onChange={() => clear("dayOfWeek")}>{days.map((day, index) => <option key={day} value={index}>{copy[day]}</option>)}</select>
        </div>
        <div className="space-y-2"><Label htmlFor="availability-start">{copy.startTime}</Label><Input id="availability-start" name="startTime" data-field="startTime" type="time" defaultValue="10:00" className={errorClass(Boolean(errors.startTime))} onChange={() => clear("startTime")} /></div>
        <div className="space-y-2"><Label htmlFor="availability-end">{copy.endTime}</Label><Input id="availability-end" name="endTime" data-field="endTime" type="time" defaultValue="18:00" aria-invalid={Boolean(errors.endTime)} aria-describedby={errors.endTime?"availability-end-error":undefined} className={errorClass(Boolean(errors.endTime))} onChange={() => clear("endTime")} />{errors.endTime?<p id="availability-end-error" role="alert" className="text-sm text-destructive">{errors.endTime}</p>:null}</div>
        <div className="space-y-2"><Label htmlFor="availability-type">{copy.type}</Label><select id="availability-type" name="consultationType" defaultValue="CHAT" className="h-10 w-full rounded-md border border-[#D4AF37]/20 bg-[#02112C] px-3 text-sm"><option value="CHAT">{copy.CHAT}</option><option value="CALL">{copy.CALL}</option><option value="VIDEO">{copy.VIDEO}</option></select></div>
        <div className="space-y-2"><Label htmlFor="availability-status">{copy.status}</Label><select id="availability-status" name="status" data-field="status" defaultValue="ONLINE" className={`h-10 w-full rounded-md border border-[#D4AF37]/20 bg-[#02112C] px-3 text-sm ${errorClass(Boolean(errors.status))}`} onChange={() => clear("status")}><option value="ONLINE">{copy.ONLINE}</option><option value="BUSY">{copy.BUSY}</option><option value="OFFLINE">{copy.OFFLINE}</option></select></div>
        <div className="flex flex-col justify-end gap-3"><label className="flex items-center gap-2 text-sm naksh-muted-text"><input type="checkbox" name="isActive" defaultChecked /> {copy.active}</label><Button type="submit"><CalendarPlus className="h-4 w-4" />{copy.slotSave}</Button></div>
        </fieldset><p className="mt-3 text-sm naksh-muted-text" role={status&&status!=="slotSaved"?"alert":"status"} aria-live="polite">{status?copy[status]:null}</p>
      </form>
      {uncertain?<Button type="button" variant="outline" onClick={()=>window.location.reload()}>{copy.refresh}</Button>:null}
      <div className="grid gap-3 md:grid-cols-2">
        {localSlots.map((slot) => <div key={slot.id} className="rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4"><p className="font-cinzel font-bold">{copy[days[slot.dayOfWeek]]??copy.unknown} | {copy[(slot.consultationType??"") as WorkspaceMessage]??copy.unknown}</p><p className="mt-1 text-sm naksh-muted-text">{slot.startTime} - {slot.endTime} | {slot.isActive===false?copy.inactive:slot.isActive===true?copy.active:copy.unknown}</p><div className="mt-3 flex gap-2"><Button size="sm" variant="outline" type="button" disabled={busy||uncertain} onClick={() => updateSlot(slot.id, slot.isActive === false)}><Power className="h-4 w-4" />{copy.toggle}</Button><Button size="sm" variant="outline" type="button" disabled={busy||uncertain} onClick={() => deleteSlot(slot.id)}><Trash2 className="h-4 w-4" />{copy.delete}</Button></div></div>)}
      </div>
      {!localSlots.length ? <p className="rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4 text-sm naksh-muted-text">{copy.slotEmpty}</p> : null}
    </div>
  );
}