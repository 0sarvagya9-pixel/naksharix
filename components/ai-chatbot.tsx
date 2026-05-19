"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bot, Mic, Send, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { secureFetch } from "@/lib/security/csrf";
import { useLanguage } from "@/components/language-provider";
import { errorClass, isBlank, scrollToFirstError } from "@/lib/form-validation";

type ChatMessage = { role: "user" | "assistant"; content: string };
type ChatLanguage = "English" | "Hindi" | "Hinglish";
const storageKey = "naksharix-ai-chat";
const contextKey = "naksharix-kundli-context";

export function AiChatbot() {
  const { apiLocale, requiredMessage, tr } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: tr("chatInitialMessage") }]);
  const [input, setInput] = useState("");
  const [kundliContext, setKundliContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const selectedLanguage = activeLanguage(apiLocale);
  const recentLimitReached = useMemo(() => messages.filter((message) => message.role === "user").length >= 6, [messages]);

  useEffect(() => {
    try {
      const savedMessages = window.localStorage.getItem(storageKey);
      const savedContext = window.localStorage.getItem(contextKey);
      if (savedMessages) setMessages(JSON.parse(savedMessages) as ChatMessage[]);
      if (savedContext) setKundliContext(savedContext);
    } catch {
      setNotice(tr("savedChatFailed"));
    }
  }, [tr]);

  useEffect(() => {
    try { window.localStorage.setItem(storageKey, JSON.stringify(messages.slice(-20))); } catch {}
  }, [messages]);

  useEffect(() => {
    try { window.localStorage.setItem(contextKey, kundliContext); } catch {}
  }, [kundliContext]);

  async function send(promptOverride?: string) {
    const prompt = (promptOverride ?? input).trim();
    if (isBlank(prompt) || loading) {
      setMessageError(requiredMessage);
      scrollToFirstError({ message: requiredMessage });
      return;
    }
    setMessageError(null);
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: prompt }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setNotice(null);
    try {
      const response = await secureFetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-14), language: selectedLanguage, kundliContext })
      });
      const json = await response.json();
      if (response.ok && typeof json.data?.memory === "string") setKundliContext(json.data.memory);
      setMessages((current) => [...current, { role: "assistant", content: response.ok ? json.data.answer : json.error ?? friendlyFallback(selectedLanguage) }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: friendlyFallback(selectedLanguage) }]);
    } finally {
      setLoading(false);
    }
  }

  function startVoiceInput() {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setNotice(tr("voiceUnavailable"));
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = selectedLanguage === "Hindi" ? "hi-IN" : "en-IN";
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results).map((result) => result[0]?.transcript ?? "").join(" ");
      setInput((current) => [current, transcript].filter(Boolean).join(" "));
      setMessageError(null);
    };
    recognition.onerror = () => setNotice(tr("voiceFailed"));
    recognition.start();
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-cinzel"><Bot className="h-5 w-5 text-[#FFD700]" />{tr("askYourKundliQuestions")}</CardTitle>
        <p className="text-sm naksh-muted-text">{tr("askKundliSubtitle")}</p>
        <div className="flex flex-wrap gap-2 pt-2"><Button asChild variant="outline"><Link href="/kundli">{tr("generateKundliFirst")}</Link></Button><Button asChild variant="secondary"><Link href="/reports/kundli-pro">{tr("unlockPremiumReport")}</Link></Button></div>
      </CardHeader>
      <CardContent className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
        <aside className="space-y-4 rounded-lg border border-[#D4AF37]/20 bg-[#02112C]/55 p-4">
          <div className="space-y-2"><Label>{tr("responseLanguage")}</Label><div className="h-10 rounded-md border border-[#D4AF37]/20 bg-[#02112C] px-3 py-2 text-sm">{selectedLanguage === "Hindi" ? tr("hindi") : selectedLanguage === "Hinglish" ? "Hinglish" : tr("english")}</div><p className="text-xs naksh-muted-text">{tr("globalLanguageControlsAi")}</p></div>
          <div className="space-y-2"><Label>{tr("birthDetailsMemory")}</Label><Textarea value={kundliContext} onChange={(event) => setKundliContext(event.target.value)} placeholder={tr("birthDetailsExample")} className="min-h-28" /></div>
          <div className="space-y-2"><Label>{tr("suggestedQuestions")}</Label><div className="grid gap-2">{[tr("qCareer"), tr("qMarriage"), tr("qFinance"), tr("qDosha"), tr("qToday")].map((question) => <button key={question} type="button" onClick={() => send(question)} className="rounded-md border border-[#D4AF37]/20 bg-[#061D3C]/70 p-3 text-left text-sm transition hover:border-[#D4AF37]/55">{question}</button>)}</div></div>
          {recentLimitReached ? <div className="rounded-md border border-[#D4AF37]/25 bg-[#D4AF37]/10 p-3 text-sm naksh-muted-text">{tr("freeAiLimitNotice")}</div> : null}
        </aside>
        <div className="space-y-4">
          <div className="max-h-[520px] space-y-3 overflow-y-auto rounded-lg border border-[#D4AF37]/20 bg-[#02112C]/60 p-3">
            {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] whitespace-pre-line rounded-lg px-3 py-2 text-sm leading-6 ${message.role === "user" ? "bg-primary text-[#01A361]-foreground" : "bg-[#061D3C]"}`}><div className="mb-1 flex items-center gap-2 text-xs opacity-80">{message.role === "user" ? <UserRound className="h-3 w-3" /> : <Bot className="h-3 w-3" />}{message.role === "user" ? tr("you") : "Naksharix"}</div>{message.content}</div></div>)}
            {loading ? <p className="flex items-center gap-2 text-sm naksh-muted-text"><Sparkles className="h-4 w-4 animate-pulse text-[#FFD700]" /> {tr("aiThinking")}</p> : null}
          </div>
          {notice ? <p className="rounded-md border border-[#D4AF37]/20 bg-[#061D3C]/70 p-3 text-sm naksh-muted-text">{notice}</p> : null}
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]"><div><Input data-field="message" value={input} onChange={(event) => { setInput(event.target.value); setMessageError(null); }} placeholder={tr("chatPlaceholder")} className={errorClass(Boolean(messageError))} />{messageError ? <p className="mt-2 text-sm text-destructive">{messageError}</p> : null}</div><Button type="button" variant="outline" onClick={startVoiceInput}><Mic className="h-4 w-4" />{tr("voice")}</Button><Button onClick={() => send()} disabled={loading || !input.trim()}><Send className="h-4 w-4" />{tr("send")}</Button></div>
        </div>
      </CardContent>
    </Card>
  );
}

type SpeechRecognitionConstructor = new () => SpeechRecognition;
type SpeechRecognition = { lang: string; onresult: ((event: SpeechRecognitionEvent) => void) | null; onerror: (() => void) | null; start: () => void };
type SpeechRecognitionEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> };

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  const win = window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor };
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

function activeLanguage(apiLocale: string): ChatLanguage {
  if (apiLocale === "hi") return "Hindi";
  if (apiLocale === "hinglish") return "Hinglish";
  return "English";
}

function friendlyFallback(language: ChatLanguage) {
  if (language === "Hindi") return "मैं अभी पूरा उत्तर नहीं दे पाया। कृपया अपना प्रश्न फिर से पूछें और जन्म तिथि, समय और स्थान जोड़ दें।";
  if (language === "Hinglish") return "Main abhi full answer nahi de paya. Please apna question dobara bhejein aur birth date, time, place add karein.";
  return "I could not complete that reading right now. Please ask again with your birth date, time, place, and one clear question.";
}

