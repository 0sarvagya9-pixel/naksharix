"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { secureFetch } from "@/lib/security/csrf";
import { FREE_LESSON_IDS, type FreeLessonId } from "@/lib/learning/lessons";

const labels: Record<FreeLessonId, string> = {
  "birth-chart": "Janam Kundli",
  "panchang": "Panchang",
  "nakshatras": "Nakshatras",
  "dasha": "Dasha timelines"
};

export function LearningProgress() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const [error, setError] = useState("");
  const [changing, setChanging] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/learn/progress", { cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401) return { signedOut: true, items: [] as string[] };
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Progress unavailable");
        return { signedOut: false, items: j.data.completed as string[] };
      })
      .then((result) => {
        if (!active) return;
        setSignedOut(result.signedOut);
        setCompleted(result.items);
      })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Progress unavailable"); })
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, []);

  async function change(lessonId: FreeLessonId, checked: boolean) {
    if (changing) return;
    setChanging(lessonId);
    setError("");
    try {
      const r = await secureFetch("/api/learn/progress", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, completed: checked })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Unable to save progress");
      setCompleted((before) => checked
        ? [...new Set([...before, lessonId])]
        : before.filter((id) => id !== lessonId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save progress");
    } finally {
      setChanging("");
    }
  }

  return (
    <section aria-label="Personal free lesson progress" className="mt-8 rounded-2xl border border-[#D4AF37]/25 bg-[#061D3C]/70 p-6">
      <h2 className="font-cinzel text-xl font-bold">Your learning progress</h2>
      {!loaded ? <p role="status" className="mt-3 text-sm naksh-muted-text">Checking your lessons...</p> : null}
      {signedOut && loaded ? (
        <p className="mt-3 text-sm naksh-muted-text">
          <Link className="font-semibold text-[#FFD700] underline" href="/auth/login?next=%2Flearn">Sign in</Link>
          {" "}to save your own lesson completion.
        </p>
      ) : null}
      {!signedOut && loaded && !error ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm naksh-muted-text">
            {completed.length} of {FREE_LESSON_IDS.length} free lessons marked complete.
            These are self-reported checkpoints, not exams or certificates.
          </p>
          {FREE_LESSON_IDS.map((id) => (
            <label key={id} className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={completed.includes(id)}
                disabled={Boolean(changing)} onChange={(event) => void change(id, event.target.checked)}
                className="h-4 w-4 accent-amber-500" />
              <span>{labels[id]}</span>
            </label>
          ))}
          <Button size="sm" variant="outline" asChild><Link href="/free-calculators">Explore calculators</Link></Button>
        </div>
      ) : null}
      {error ? <p role="status" className="mt-3 text-sm text-[#FFD700]">{error}</p> : null}
    </section>
  );
}
