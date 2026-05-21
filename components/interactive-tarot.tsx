"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { secureFetch } from "@/lib/security/csrf";
import { useLanguage } from "@/components/language-provider";
import { errorClass, isBlank, scrollToFirstError } from "@/lib/form-validation";

type TarotCard = { name?: string; position?: string; reversed?: boolean };
type TarotReading = { spread?: string; question?: string; cards?: TarotCard[]; interpretation?: string };
type Stage = "setup" | "shuffled" | "drawn" | "revealed";

const spreads = [
  { id: "three-card", label: "Past / Present / Future", positions: ["Past", "Present", "Future"] },
  { id: "love", label: "Love Clarity", positions: ["Heart", "Block", "Guidance"] },
  { id: "career", label: "Career Path", positions: ["Current", "Challenge", "Next Step"] }
];

export function InteractiveTarot() {
  const { apiLocale, requiredMessage, tr } = useLanguage();
  const [spread, setSpread] = useState(spreads[0]);
  const [question, setQuestion] = useState("");
  const [stage, setStage] = useState<Stage>("setup");
  const [reading, setReading] = useState<TarotReading | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const deckCards = useMemo(() => Array.from({ length: 18 }, (_, index) => index), []);

  function shuffle() {
    if (isBlank(question)) {
      setError(requiredMessage);
      scrollToFirstError({ tarotQuestion: requiredMessage });
      return;
    }
    setError(null);
    setReading(null);
    setStage("shuffled");
  }

  function draw() {
    setStage("drawn");
  }

  async function reveal() {
    setLoading(true);
    setError(null);
    try {
      const response = await secureFetch("/api/tarot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spread: spread.id, question, locale: apiLocale })
      });
      const json = await response.json();
      if (!response.ok) {
        setError(tr("errorGeneric"));
        return;
      }
      setReading(normalizeReading(json?.data?.reading));
      setStage("revealed");
    } catch {
      setError(tr("errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#1e293b] bg-[radial-gradient(circle_at_20%_10%,rgba(88,28,135,0.22),transparent_24rem),radial-gradient(circle_at_82%_18%,rgba(0,245,160,0.08),transparent_20rem),linear-gradient(135deg,#0a1224,#020612_88%)] p-4 shadow-[0_24px_80px_rgba(2,6,18,0.45)] sm:p-8">
      <div className="pointer-events-none absolute inset-0 star-field opacity-40" />
      <div className="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#dca956]">{tr("interactiveTarot")}</p>
            <h2 className="mt-3 font-decorative text-4xl font-black text-[#f3d382]">{tr("shuffleCosmicDeck")}</h2>
            <p className="mt-3 text-sm leading-6 naksh-muted-text">{tr("tarotIntro")}</p>
          </div>
          <div className="grid gap-3">
            {spreads.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => { setSpread(item); setStage("setup"); setReading(null); }}
                className={`rounded-lg border p-4 text-left transition ${spread.id === item.id ? "border-[#dca956]/70 bg-[#dca956]/10 text-[#f3d382]" : "border-[#1e293b] bg-[#0f1c3a]/75 hover:border-[#dca956]/55 hover:bg-[#0f1c3a]"}`}
              >
                <span className="font-cinzel font-bold">{tr(spreadLabelKey(item.id))}</span>
                <span className="mt-1 block text-xs naksh-muted-text">{item.positions.map((position) => tr(positionKey(position))).join(" | ")}</span>
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <Textarea data-field="tarotQuestion" value={question} onChange={(event) => { setQuestion(event.target.value); setError(null); }} className={errorClass(Boolean(error))} placeholder={tr("tarotQuestionPlaceholder")} aria-invalid={Boolean(error)} />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button onClick={shuffle}><Sparkles className="h-4 w-4" />{tr("shuffle")}</Button>
            <Button variant="outline" disabled={stage === "setup"} onClick={draw}>{tr("drawCards")}</Button>
            <Button variant="secondary" disabled={stage !== "drawn" || loading} onClick={reveal}><WandSparkles className="h-4 w-4" />{loading ? tr("revealing") : tr("reveal")}</Button>
          </div>
        </div>

        <div className="space-y-8">
          <Deck stage={stage} deckCards={deckCards} />
          <div className="grid gap-4 md:grid-cols-3">
            {spread.positions.map((position, index) => {
              const card = reading?.cards?.[index];
              return <TarotCardView key={position} position={tr(positionKey(position))} card={card} revealed={stage === "revealed"} index={index} />;
            })}
          </div>
          <Card className="border-[#1e293b] bg-[#0f1c3a]/85">
            <CardContent className="p-5">
              <p className="font-cinzel text-lg font-bold text-[#f3d382]">{tr("aiInterpretation")}</p>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 naksh-muted-text">
                {reading?.interpretation ?? tr("tarotEmptyInterpretation")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Deck({ stage, deckCards }: { stage: Stage; deckCards: number[] }) {
  return (
    <div className="relative mx-auto h-48 max-w-md">
      {deckCards.map((_, index) => (
        <motion.div
          key={index}
          className="absolute left-1/2 top-6 h-32 w-20 rounded-lg border border-[#dca956]/25 bg-[linear-gradient(135deg,rgba(88,28,135,0.82),rgba(220,169,86,0.16))] shadow-[0_0_24px_rgba(88,28,135,0.25)]"
          initial={false}
          animate={{
            x: stage === "shuffled" ? Math.sin(index) * 120 : index * 2 - 18,
            y: stage === "shuffled" ? Math.cos(index) * 24 : index * 0.5,
            rotate: stage === "shuffled" ? index * 18 : index * 1.5,
            opacity: stage === "drawn" || stage === "revealed" ? index < 3 ? 1 : 0.18 : 1
          }}
          transition={{ duration: 0.7, type: "spring" }}
        />
      ))}
    </div>
  );
}

function TarotCardView({ position, card, revealed, index }: { position: string; card?: TarotCard; revealed: boolean; index: number }) {
  const { tr } = useLanguage();
  return (
    <motion.div
      className="min-h-48 rounded-lg border border-[#1e293b] bg-[#0f1c3a]/78 p-4 text-center [transform-style:preserve-3d]"
      animate={{ rotateY: revealed ? 180 : 0, y: revealed ? 0 : index * 8 }}
      transition={{ duration: 0.7, delay: index * 0.12 }}
    >
      <div className="[backface-visibility:hidden]">
        <p className="text-xs uppercase tracking-[0.22em] text-[#dca956]">{position}</p>
        <div className="mx-auto mt-5 grid h-28 w-20 place-items-center rounded-lg border border-[#dca956]/30 bg-[linear-gradient(135deg,rgba(88,28,135,0.76),rgba(220,169,86,0.16))]">
          <Sparkles className="h-6 w-6 text-[#f3d382]" />
        </div>
      </div>
      <div className="-mt-40 [backface-visibility:hidden] [transform:rotateY(180deg)]">
        <p className="text-xs uppercase tracking-[0.22em] text-[#dca956]">{position}</p>
        <h3 className="mt-10 font-cinzel text-xl font-black text-[#ffffff]">{card?.name ?? tr("mysticCard")}</h3>
        <p className="mt-2 text-xs naksh-muted-text">{card?.reversed ? tr("reversed") : tr("upright")}</p>
      </div>
    </motion.div>
  );
}

function spreadLabelKey(id: string) {
  if (id === "love") return "loveClarity" as const;
  if (id === "career") return "careerPath" as const;
  return "pastPresentFuture" as const;
}

function positionKey(position: string) {
  const map = {
    Past: "past",
    Present: "present",
    Future: "future",
    Heart: "heart",
    Block: "block",
    Guidance: "guidance",
    Current: "current",
    Challenge: "challenge",
    "Next Step": "nextStep"
  } as const;
  return map[position as keyof typeof map] ?? "guidance";
}

function normalizeReading(value: unknown): TarotReading {
  if (!value || typeof value !== "object") return {};
  const reading = value as TarotReading;
  return {
    spread: typeof reading.spread === "string" ? reading.spread : undefined,
    question: typeof reading.question === "string" ? reading.question : undefined,
    interpretation: safeReadingText(reading.interpretation),
    cards: Array.isArray(reading.cards) ? reading.cards : []
  };
}

function safeReadingText(value: unknown) {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  if (!text || text === "undefined" || text === "null" || text === "[object Object]") return undefined;
  if (/^\s*[{[]/.test(text)) return undefined;
  return text;
}
