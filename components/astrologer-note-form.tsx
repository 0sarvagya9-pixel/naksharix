"use client";

import { useState } from "react";
import { StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { secureFetch } from "@/lib/security/csrf";

export function AstrologerNoteForm({ userId }: { userId: string }) {
  const [message, setMessage] = useState<string | null>(null);

  async function save(formData: FormData) {
    setMessage("Saving private note...");
    const response = await secureFetch("/api/astrologer/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, title: formData.get("title"), body: formData.get("body"), private: true })
    });
    const json = await response.json();
    setMessage(response.ok ? "Private note saved." : json.error ?? "Could not save note.");
  }

  return (
    <form action={save} className="space-y-3 rounded-lg border border-[#D4AF37]/20 bg-[#061D3C]/60 p-4">
      <Label>Private note title</Label>
      <Input name="title" required placeholder="Consultation context" />
      <Label>Private note</Label>
      <Textarea name="body" required placeholder="Observations, follow-up reminders, remedies discussed..." />
      <Button size="sm"><StickyNote className="h-4 w-4" />Save private note</Button>
      {message ? <p className="text-xs naksh-muted-text">{message}</p> : null}
    </form>
  );
}
