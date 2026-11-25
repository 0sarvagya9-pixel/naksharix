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

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Slot = { id: string; dayOfWeek: number; startTime: string; endTime: string; isActive?: boolean; consultationType?: string; status?: string; isHoliday?: boolean };

export function AvailabilityForm({ slots = [] }: { slots?: Slot[] }) {
  const { requiredMessage } = useLanguage();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<string | null>(null);
  const [localSlots, setLocalSlots] = useState(slots);
  const mutation=useRef(false),[busy,setBusy]=useState(false);

  async function mutate(method:"POST"|"PATCH"|"DELETE",payload:Record<string,unknown>,apply:(data:Record<string,unknown>)=>boolean){
    if(mutation.current)return;mutation.current=true;setBusy(true);setStatus("");
    try{
      const response=await secureFetch("/api/astrologer/availability",{silent:true,method,headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const json=await response.json().catch(()=>null);
      if(!response.ok||!json?.data||!apply(json.data)){setStatus(response.status===409?"Availability changed. Refresh before retrying.":"Availability could not be confirmed. Check the time range and refresh before retrying.");return;}
      setStatus("Availability saved.");
    }catch{setStatus("Connection interrupted. Refresh the list before retrying; the change may already be saved.");}
    finally{mutation.current=false;setBusy(false);}
  }
  async function addSlot(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const form=event.currentTarget,formData=new FormData(form);
    const required=["dayOfWeek","startTime","endTime","status","consultationType"];
    const nextErrors=required.reduce<FieldErrors>((acc,field)=>{if(isBlank(formData.get(field)))acc[field]=requiredMessage;return acc;},{});
    const payload={dayOfWeek:Number(formData.get("dayOfWeek")),startTime:String(formData.get("startTime")??""),endTime:String(formData.get("endTime")??""),isHoliday:formData.get("isHoliday")==="on",isActive:formData.get("isActive")==="on",consultationType:String(formData.get("consultationType")??""),status:String(formData.get("status")??"")};
    if(!Object.keys(nextErrors).length&&!validConsultationSlotWindow(payload))nextErrors.endTime="Choose a valid same-day slot of at least 30 minutes.";
    setErrors(nextErrors);
    if(Object.keys(nextErrors).length){scrollToFirstError(nextErrors);return;}
    await mutate("POST",payload,data=>{
      const slot=data.slot as Slot|undefined;
      if(!slot||typeof slot.id!=="string"||slot.dayOfWeek!==payload.dayOfWeek||slot.startTime!==payload.startTime||slot.endTime!==payload.endTime)return false;
      setLocalSlots(current=>current.some(x=>x.id===slot.id)?current:[...current,slot]);form.reset();return true;
    });
  }
  async function updateSlot(slotId:string,isActive:boolean){
    await mutate("PATCH",{slotId,isActive},data=>{
      const slot=data.slot as Slot|undefined;if(!slot||slot.id!==slotId||slot.isActive!==isActive)return false;
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
      <form onSubmit={addSlot} className="rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4"><fieldset disabled={busy} className="grid gap-4 md:grid-cols-6">
        <div className="space-y-2">
          <Label htmlFor="availability-day">Day</Label>
          <select id="availability-day" name="dayOfWeek" data-field="dayOfWeek" defaultValue="1" className={`h-10 w-full rounded-md border border-[#D4AF37]/20 bg-[#02112C] px-3 text-sm ${errorClass(Boolean(errors.dayOfWeek))}`} onChange={() => clear("dayOfWeek")}>{days.map((day, index) => <option key={day} value={index}>{day}</option>)}</select>
        </div>
        <div className="space-y-2"><Label htmlFor="availability-start">Start time</Label><Input id="availability-start" name="startTime" data-field="startTime" type="time" defaultValue="10:00" className={errorClass(Boolean(errors.startTime))} onChange={() => clear("startTime")} /></div>
        <div className="space-y-2"><Label htmlFor="availability-end">End time</Label><Input id="availability-end" name="endTime" data-field="endTime" type="time" defaultValue="18:00" aria-invalid={Boolean(errors.endTime)} aria-describedby={errors.endTime?"availability-end-error":undefined} className={errorClass(Boolean(errors.endTime))} onChange={() => clear("endTime")} />{errors.endTime?<p id="availability-end-error" role="alert" className="text-sm text-destructive">{errors.endTime}</p>:null}</div>
        <div className="space-y-2"><Label htmlFor="availability-type">Type</Label><select id="availability-type" name="consultationType" defaultValue="CHAT" className="h-10 w-full rounded-md border border-[#D4AF37]/20 bg-[#02112C] px-3 text-sm"><option value="CHAT">Chat</option><option value="CALL">Call</option><option value="VIDEO">Video</option></select></div>
        <div className="space-y-2"><Label htmlFor="availability-status">Status</Label><select id="availability-status" name="status" data-field="status" defaultValue="ONLINE" className={`h-10 w-full rounded-md border border-[#D4AF37]/20 bg-[#02112C] px-3 text-sm ${errorClass(Boolean(errors.status))}`} onChange={() => clear("status")}><option value="ONLINE">Online</option><option value="BUSY">Busy</option><option value="OFFLINE">Offline</option></select></div>
        <div className="flex flex-col justify-end gap-3"><label className="flex items-center gap-2 text-sm naksh-muted-text"><input type="checkbox" name="isActive" defaultChecked /> Active</label><Button type="submit"><CalendarPlus className="h-4 w-4" />Add Availability Slot</Button></div>
        </fieldset><p className="mt-3 text-sm naksh-muted-text" role="status" aria-live="polite">{status}</p>
      </form>
      <div className="grid gap-3 md:grid-cols-2">
        {localSlots.map((slot) => <div key={slot.id} className="rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4"><p className="font-cinzel font-bold">{days[slot.dayOfWeek]} | {slot.consultationType ?? "CHAT"}</p><p className="mt-1 text-sm naksh-muted-text">{slot.startTime} - {slot.endTime} | {slot.isActive === false ? "Inactive" : "Active"}</p><div className="mt-3 flex gap-2"><Button size="sm" variant="outline" type="button" disabled={busy} onClick={() => updateSlot(slot.id, slot.isActive === false)}><Power className="h-4 w-4" />Toggle</Button><Button size="sm" variant="outline" type="button" disabled={busy} onClick={() => deleteSlot(slot.id)}><Trash2 className="h-4 w-4" />Delete</Button></div></div>)}
      </div>
      {!localSlots.length ? <p className="rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4 text-sm naksh-muted-text">No availability slots added yet.</p> : null}
    </div>
  );
}