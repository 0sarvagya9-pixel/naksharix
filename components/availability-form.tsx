"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { secureFetch } from "@/lib/security/csrf";
import { errorClass, isBlank, scrollToFirstError, type FieldErrors } from "@/lib/form-validation";
import { useLanguage } from "@/components/language-provider";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function AvailabilityForm() {
  const { requiredMessage } = useLanguage();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<string | null>(null);

  async function addSlot(formData: FormData) {
    const required = ["dayOfWeek", "startTime", "endTime", "status"];
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
        status: formData.get("status")
      })
    });
    const json = await response.json();
    setStatus(response.ok ? "Availability saved. Refresh to see the latest slot in your list." : json.error ?? "Unable to save availability.");
  }

  function clear(field: string) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  return (
    <form action={addSlot} className="grid gap-4 rounded-lg border border-amber-200/15 bg-card/60 p-4 md:grid-cols-5">
      <div className="space-y-2">
        <Label>Day</Label>
        <select name="dayOfWeek" data-field="dayOfWeek" defaultValue="1" className={`h-10 w-full rounded-md border border-input bg-background px-3 text-sm ${errorClass(Boolean(errors.dayOfWeek))}`} onChange={() => clear("dayOfWeek")}>
          {days.map((day, index) => <option key={day} value={index}>{day}</option>)}
        </select>
        {errors.dayOfWeek ? <p className="text-sm text-destructive">{errors.dayOfWeek}</p> : null}
      </div>
      <div className="space-y-2">
        <Label>Start time</Label>
        <Input name="startTime" data-field="startTime" type="time" defaultValue="10:00" className={errorClass(Boolean(errors.startTime))} onChange={() => clear("startTime")} />
        {errors.startTime ? <p className="text-sm text-destructive">{errors.startTime}</p> : null}
      </div>
      <div className="space-y-2">
        <Label>End time</Label>
        <Input name="endTime" data-field="endTime" type="time" defaultValue="18:00" className={errorClass(Boolean(errors.endTime))} onChange={() => clear("endTime")} />
        {errors.endTime ? <p className="text-sm text-destructive">{errors.endTime}</p> : null}
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <select name="status" data-field="status" defaultValue="ONLINE" className={`h-10 w-full rounded-md border border-input bg-background px-3 text-sm ${errorClass(Boolean(errors.status))}`} onChange={() => clear("status")}>
          <option value="ONLINE">Online</option>
          <option value="BUSY">Busy</option>
          <option value="OFFLINE">Offline</option>
        </select>
        {errors.status ? <p className="text-sm text-destructive">{errors.status}</p> : null}
      </div>
      <div className="flex flex-col justify-end gap-3">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" name="isHoliday" />
          Mark holiday
        </label>
        <Button>
          <CalendarPlus className="h-4 w-4" />
          Add slot
        </Button>
      </div>
      {status ? <p className="md:col-span-5 text-sm text-muted-foreground">{status}</p> : null}
    </form>
  );
}
