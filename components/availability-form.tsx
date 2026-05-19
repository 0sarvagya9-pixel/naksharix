"use client";

import { useState } from "react";
import { CalendarPlus, Power, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { secureFetch } from "@/lib/security/csrf";
import { errorClass, isBlank, scrollToFirstError, type FieldErrors } from "@/lib/form-validation";
import { useLanguage } from "@/components/language-provider";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Slot = { id: string; dayOfWeek: number; startTime: string; endTime: string; isActive?: boolean; consultationType?: string; status?: string; isHoliday?: boolean };

export function AvailabilityForm({ slots = [] }: { slots?: Slot[] }) {
  const { requiredMessage } = useLanguage();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<string | null>(null);
  const [localSlots, setLocalSlots] = useState(slots);

  async function addSlot(formData: FormData) {
    const required = ["dayOfWeek", "startTime", "endTime", "status", "consultationType"];
    const nextErrors = required.reduce<FieldErrors>((acc, field) => {
      if (isBlank(formData.get(field))) acc[field] = requiredMessage;
      return acc;
    }, {});
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      scrollToFirstError(nextErrors);
      return;
    }

    setStatus("Saving availability...");
    const response = await secureFetch("/api/astrologer/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dayOfWeek: Number(formData.get("dayOfWeek")),
        startTime: formData.get("startTime"),
        endTime: formData.get("endTime"),
        isHoliday: formData.get("isHoliday") === "on",
        isActive: formData.get("isActive") === "on",
        consultationType: formData.get("consultationType"),
        status: formData.get("status")
      })
    });
    const json = await response.json();
    if (response.ok) {
      setLocalSlots((current) => [...current, json.data.slot]);
      setStatus("Availability saved.");
      return;
    }
    setStatus(json.error ?? "Unable to save availability.");
  }

  async function updateSlot(slotId: string, isActive: boolean) {
    const response = await secureFetch("/api/astrologer/availability", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slotId, isActive }) });
    if (response.ok) setLocalSlots((current) => current.map((slot) => slot.id === slotId ? { ...slot, isActive } : slot));
  }

  async function deleteSlot(slotId: string) {
    const response = await secureFetch("/api/astrologer/availability", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slotId }) });
    if (response.ok) setLocalSlots((current) => current.filter((slot) => slot.id !== slotId));
  }

  function clear(field: string) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  return (
    <div className="space-y-6">
      <form action={addSlot} className="grid gap-4 rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4 md:grid-cols-6">
        <div className="space-y-2">
          <Label>Day</Label>
          <select name="dayOfWeek" data-field="dayOfWeek" defaultValue="1" className={`h-10 w-full rounded-md border border-[#D4AF37]/20 bg-[#02112C] px-3 text-sm ${errorClass(Boolean(errors.dayOfWeek))}`} onChange={() => clear("dayOfWeek")}>{days.map((day, index) => <option key={day} value={index}>{day}</option>)}</select>
        </div>
        <div className="space-y-2"><Label>Start time</Label><Input name="startTime" data-field="startTime" type="time" defaultValue="10:00" className={errorClass(Boolean(errors.startTime))} onChange={() => clear("startTime")} /></div>
        <div className="space-y-2"><Label>End time</Label><Input name="endTime" data-field="endTime" type="time" defaultValue="18:00" className={errorClass(Boolean(errors.endTime))} onChange={() => clear("endTime")} /></div>
        <div className="space-y-2"><Label>Type</Label><select name="consultationType" defaultValue="CHAT" className="h-10 w-full rounded-md border border-[#D4AF37]/20 bg-[#02112C] px-3 text-sm"><option value="CHAT">Chat</option><option value="CALL">Call</option><option value="VIDEO">Video</option></select></div>
        <div className="space-y-2"><Label>Status</Label><select name="status" data-field="status" defaultValue="ONLINE" className={`h-10 w-full rounded-md border border-[#D4AF37]/20 bg-[#02112C] px-3 text-sm ${errorClass(Boolean(errors.status))}`} onChange={() => clear("status")}><option value="ONLINE">Online</option><option value="BUSY">Busy</option><option value="OFFLINE">Offline</option></select></div>
        <div className="flex flex-col justify-end gap-3"><label className="flex items-center gap-2 text-sm naksh-muted-text"><input type="checkbox" name="isActive" defaultChecked /> Active</label><Button><CalendarPlus className="h-4 w-4" />Add Availability Slot</Button></div>
        {status ? <p className="md:col-span-6 text-sm naksh-muted-text">{status}</p> : null}
      </form>
      <div className="grid gap-3 md:grid-cols-2">
        {localSlots.map((slot) => <div key={slot.id} className="rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4"><p className="font-cinzel font-bold">{days[slot.dayOfWeek]} | {slot.consultationType ?? "CHAT"}</p><p className="mt-1 text-sm naksh-muted-text">{slot.startTime} - {slot.endTime} | {slot.isActive === false ? "Inactive" : "Active"}</p><div className="mt-3 flex gap-2"><Button size="sm" variant="outline" type="button" onClick={() => updateSlot(slot.id, slot.isActive === false)}><Power className="h-4 w-4" />Toggle</Button><Button size="sm" variant="outline" type="button" onClick={() => deleteSlot(slot.id)}><Trash2 className="h-4 w-4" />Delete</Button></div></div>)}
      </div>
      {!localSlots.length ? <p className="rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/70 p-4 text-sm naksh-muted-text">No availability slots added yet.</p> : null}
    </div>
  );
}