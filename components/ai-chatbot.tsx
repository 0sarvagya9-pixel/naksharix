"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { Bot, CheckCircle2, Edit3, LockKeyhole, Mic, Save, Send, Sparkles, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { secureFetch } from "@/lib/security/csrf";
import { useLanguage } from "@/components/language-provider";
import { errorClass, isBlank } from "@/lib/form-validation";

type ChatMessage = { role: "user" | "assistant"; content: string };
type ChatLanguage = "English" | "Hindi" | "Hinglish";
type FlowState = "setup" | "readyToChat";
type ConcernCategory = "career" | "marriage" | "finance" | "love" | "health" | "general" | "";
type BirthProfile = {
  name: string;
  gender: string;
  dateOfBirth: string;
  timeOfBirth: string;
  birthPlace: string;
  category: ConcernCategory;
  selectedLanguage: string;
};
type FieldErrors = Partial<Record<keyof BirthProfile, string>>;

const storageKey = "naksharix-ai-chat";
const contextKey = "naksharix-kundli-context";
const profileKey = "naksharix-ai-birth-profile";

const emptyProfile: BirthProfile = { name: "", gender: "", dateOfBirth: "", timeOfBirth: "", birthPlace: "", category: "", selectedLanguage: "English" };

export function AiChatbot() {
  const { apiLocale, requiredMessage, tr } = useLanguage();
  const selectedLanguage = activeLanguage(apiLocale);
  const labels = chatLabels(selectedLanguage);
  const [flow, setFlow] = useState<FlowState>("setup");
  const [hydrated, setHydrated] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [hiddenContext, setHiddenContext] = useState("");
  const [birthProfile, setBirthProfile] = useState<BirthProfile>({ ...emptyProfile, selectedLanguage });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLInputElement>(null);
  const dobRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const placeRef = useRef<HTMLInputElement>(null);

  const contextSignals = useMemo(() => detectContextSignals(hiddenContext, birthProfile, selectedLanguage), [hiddenContext, birthProfile, selectedLanguage]);
  const suggestedQuestions = suggestedQuestionsFor(selectedLanguage);
  const recentLimitReached = useMemo(() => messages.filter((message) => message.role === "user").length >= 6, [messages]);
  const isReady = hasRequiredBirthDetails(birthProfile);

  useEffect(() => {
    try {
      const savedProfile = normalizeBirthProfile(JSON.parse(window.localStorage.getItem(profileKey) || "null"));
      const savedMessages = normalizeMessages(JSON.parse(window.localStorage.getItem(storageKey) || "[]"));
      const savedContext = window.localStorage.getItem(contextKey) || "";
      setBirthProfile({ ...savedProfile, selectedLanguage });
      setHiddenContext(savedContext);
      if (hasRequiredBirthDetails(savedProfile)) {
        setFlow("readyToChat");
        setMessages(savedMessages.length ? savedMessages : [{ role: "assistant", content: welcomeMessage(savedProfile, selectedLanguage) }]);
      }
    } catch {
      setNotice(tr("savedChatFailed"));
    } finally {
      setHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(profileKey, JSON.stringify({ ...birthProfile, selectedLanguage })); } catch {}
  }, [birthProfile, hydrated, selectedLanguage]);

  useEffect(() => {
    if (!hydrated || flow !== "readyToChat") return;
    try { window.localStorage.setItem(storageKey, JSON.stringify(messages.slice(-20))); } catch {}
  }, [messages, hydrated, flow]);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(contextKey, hiddenContext); } catch {}
  }, [hiddenContext, hydrated]);

  function updateProfile(field: keyof BirthProfile, value: string) {
    setBirthProfile((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function saveBirthDetails() {
    const nextErrors = validateProfile(birthProfile, requiredMessage);
    setErrors(nextErrors);
    const firstInvalid = Object.keys(nextErrors)[0] as keyof BirthProfile | undefined;
    if (firstInvalid) {
      const refMap: Partial<Record<keyof BirthProfile, RefObject<HTMLInputElement>>> = {
        name: nameRef,
        gender: genderRef,
        dateOfBirth: dobRef,
        timeOfBirth: timeRef,
        birthPlace: placeRef
      };
      refMap[firstInvalid]?.current?.focus();
      return;
    }
    const savedProfile = { ...birthProfile, selectedLanguage };
    setBirthProfile(savedProfile);
    setFlow("readyToChat");
    setNotice(labels.savedNotice);
    setMessages((current) => current.length ? current : [{ role: "assistant", content: welcomeMessage(savedProfile, selectedLanguage) }]);
  }

  function editBirthDetails() {
    setFlow("setup");
    setNotice(null);
  }

  function clearMemory() {
    setBirthProfile({ ...emptyProfile, selectedLanguage });
    setMessages([]);
    setInput("");
    setHiddenContext("");
    setErrors({});
    setMessageError(null);
    setNotice(labels.memoryCleared);
    setFlow("setup");
    try {
      window.localStorage.removeItem(profileKey);
      window.localStorage.removeItem(storageKey);
      window.localStorage.removeItem(contextKey);
    } catch {}
  }

  function clearChat() {
    setMessages([{ role: "assistant", content: welcomeMessage(birthProfile, selectedLanguage) }]);
    setInput("");
    setMessageError(null);
    try { window.localStorage.removeItem(storageKey); } catch {}
  }

  async function send(promptOverride?: string) {
    if (!isReady || flow !== "readyToChat") {
      setNotice(labels.lockedMessage);
      return;
    }
    const prompt = (promptOverride ?? input).trim();
    if (isBlank(prompt) || loading) {
      setMessageError(requiredMessage);
      return;
    }
    setMessageError(null);
    const memoryPayload = buildContextPayload(birthProfile, hiddenContext, selectedLanguage);
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: prompt }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setNotice(null);
    try {
      const response = await secureFetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-14), language: selectedLanguage, kundliContext: memoryPayload })
      });
      const json = await response.json();
      if (response.ok && typeof json.data?.memory === "string") setHiddenContext(json.data.memory);
      const fallback = response.status === 503 ? missingConfigMessage(selectedLanguage) : providerFallback(selectedLanguage);
      setMessages((current) => [...current, { role: "assistant", content: response.ok ? safeUiText(json?.data?.answer, fallback) : safeUiText(json?.error, fallback) }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: providerFallback(selectedLanguage) }]);
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
    <Card className="glass border-[rgba(20, 20, 20, 0.08)] bg-[rgba(255, 255, 255, 0.68)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-cinzel text-neutral-800">
          <Bot className="h-5 w-5 text-[#dca956]" />
          {labels.title}
        </CardTitle>
        <p className="max-w-4xl text-sm leading-6 naksh-muted-text">{labels.subtitle}</p>
      </CardHeader>
      {flow === "setup" ? (
        <CardContent className="space-y-6">
          <SetupPanel
            labels={labels}
            profile={birthProfile}
            errors={errors}
            refs={{ nameRef, genderRef, dobRef, timeRef, placeRef }}
            onChange={updateProfile}
            onSave={saveBirthDetails}
          />
          <div className="grid gap-4 md:grid-cols-3">
            {labels.benefits.map((benefit) => (
              <div key={benefit.title} className="rounded-xl border border-[rgba(20, 20, 20, 0.08)] bg-[rgba(255, 255, 255, 0.68)] p-5">
                <Sparkles className="h-5 w-5 text-[#00f5a0]" />
                <h3 className="mt-4 font-cinzel text-lg font-bold text-neutral-800">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-500">{benefit.copy}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-dashed border-[rgba(20, 20, 20, 0.08)] bg-[rgba(255, 255, 255, 0.68)] p-5 text-sm leading-6 text-neutral-500">
            <LockKeyhole className="mb-3 h-5 w-5 text-[#dca956]" />
            {labels.lockedMessage}
          </div>
          {notice ? <p className="rounded-md border border-[rgba(20, 20, 20, 0.08)] bg-[rgba(255, 255, 255, 0.68)] p-3 text-sm naksh-muted-text">{notice}</p> : null}
        </CardContent>
      ) : (
        <CardContent className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="space-y-4 rounded-lg border border-[rgba(20, 20, 20, 0.08)] bg-[rgba(255, 255, 255, 0.68)] p-4">
            <SavedDetailsCard labels={labels} profile={birthProfile} onEdit={editBirthDetails} onClear={clearMemory} />
            <div className="space-y-2">
              <Label>{labels.contextChips}</Label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {contextSignals.map((signal) => (
                  <span key={signal.label} className={`inline-flex items-center gap-2 rounded-md border px-2 py-2 ${signal.active ? "border-[#009b72]/45 bg-[#009b72]/12 text-[#00f5a0]" : "border-[rgba(20, 20, 20, 0.08)] bg-[rgba(255, 255, 255, 0.68)] text-neutral-500"}`}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {signal.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{tr("suggestedQuestions")}</Label>
              <div className="grid gap-2">
                {suggestedQuestions.map((question) => (
                  <button key={question} type="button" onClick={() => send(question)} className="rounded-md border border-[rgba(20, 20, 20, 0.08)] bg-[rgba(255, 255, 255, 0.68)] p-3 text-left text-sm text-neutral-800 transition hover:border-[#dca956]/55 hover:bg-[rgba(255,255,255,0.9)]">
                    {question}
                  </button>
                ))}
              </div>
            </div>
            {recentLimitReached ? <div className="rounded-md border border-[#dca956]/25 bg-[#dca956]/10 p-3 text-sm naksh-muted-text">{tr("freeAiLimitNotice")}</div> : null}
          </aside>
          <div className="space-y-4">
            <div className="max-h-[560px] space-y-3 overflow-y-auto rounded-lg border border-[rgba(20, 20, 20, 0.08)] bg-[rgba(255, 255, 255, 0.68)] p-3">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[88%] whitespace-pre-line rounded-lg px-3 py-2 text-sm leading-6 ${message.role === "user" ? "bg-[#009b72] text-[#ffffff] shadow-[0_0_24px_rgba(0,245,160,0.14)]" : "bg-[rgba(255, 255, 255, 0.68)] text-neutral-800 border border-[rgba(20,20,20,0.06)]"}`}>
                    <div className="mb-1 flex items-center gap-2 text-xs opacity-80">{message.role === "user" ? <UserRound className="h-3 w-3" /> : <Bot className="h-3 w-3" />}{message.role === "user" ? tr("you") : "Naksharix"}</div>
                    {message.content}
                  </div>
                </div>
              ))}
              {loading ? <p className="flex items-center gap-2 text-sm naksh-muted-text"><Sparkles className="h-4 w-4 animate-pulse text-[#dca956]" /> {tr("aiThinking")}</p> : null}
            </div>
            {notice ? <p className="rounded-md border border-[rgba(20, 20, 20, 0.08)] bg-[rgba(255, 255, 255, 0.68)] p-3 text-sm naksh-muted-text">{notice}</p> : null}
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
              <div>
                <Input data-field="message" value={input} onChange={(event) => { setInput(event.target.value); setMessageError(null); }} placeholder={tr("chatPlaceholder")} className={errorClass(Boolean(messageError))} />
                {messageError ? <p className="mt-2 text-sm text-destructive">{messageError}</p> : null}
              </div>
              <Button type="button" variant="outline" onClick={startVoiceInput}><Mic className="h-4 w-4" />{tr("voice")}</Button>
              <Button type="button" variant="outline" onClick={clearChat}><Trash2 className="h-4 w-4" />{labels.clearChat}</Button>
              <Button onClick={() => send()} disabled={loading || !input.trim()}><Send className="h-4 w-4" />{tr("send")}</Button>
            </div>
            <p className="text-xs leading-5 naksh-muted-text">{labels.safetyNote}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function SetupPanel({
  labels,
  profile,
  errors,
  refs,
  onChange,
  onSave
}: {
  labels: ReturnType<typeof chatLabels>;
  profile: BirthProfile;
  errors: FieldErrors;
  refs: {
    nameRef: RefObject<HTMLInputElement>;
    genderRef: RefObject<HTMLInputElement>;
    dobRef: RefObject<HTMLInputElement>;
    timeRef: RefObject<HTMLInputElement>;
    placeRef: RefObject<HTMLInputElement>;
  };
  onChange: (field: keyof BirthProfile, value: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[rgba(20, 20, 20, 0.08)] bg-[rgba(255, 255, 255, 0.68)] p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={labels.name} error={errors.name}><Input ref={refs.nameRef} value={profile.name} onChange={(event) => onChange("name", event.target.value)} className={fieldClass(errors.name)} /></Field>
        <Field label={labels.gender} error={errors.gender}><Input ref={refs.genderRef} value={profile.gender} onChange={(event) => onChange("gender", event.target.value)} placeholder={labels.genderPlaceholder} className={fieldClass(errors.gender)} /></Field>
        <Field label={labels.birthDate} error={errors.dateOfBirth}><Input ref={refs.dobRef} type="date" value={profile.dateOfBirth} onChange={(event) => onChange("dateOfBirth", event.target.value)} className={fieldClass(errors.dateOfBirth)} /></Field>
        <Field label={labels.birthTime} error={errors.timeOfBirth}><Input ref={refs.timeRef} type="time" value={profile.timeOfBirth} onChange={(event) => onChange("timeOfBirth", event.target.value)} className={fieldClass(errors.timeOfBirth)} /></Field>
        <Field label={labels.birthPlace} error={errors.birthPlace}><Input ref={refs.placeRef} value={profile.birthPlace} onChange={(event) => onChange("birthPlace", event.target.value)} placeholder={labels.placePlaceholder} className={fieldClass(errors.birthPlace)} /></Field>
        <Field label={labels.category} error={errors.category}>
          <select value={profile.category} onChange={(event) => onChange("category", event.target.value)} className="h-10 w-full rounded-md border border-[rgba(20, 20, 20, 0.08)] bg-[rgba(255, 255, 255, 0.68)] px-3 text-sm text-[#1e1e1f] outline-none">
            <option value="">{labels.categoryPlaceholder}</option>
            {labels.categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </Field>
      </div>
      <Button type="button" onClick={onSave} className="mt-5 bg-[#009b72] text-white hover:bg-[#008766]"><Save className="h-4 w-4" />{labels.saveCta}</Button>
    </div>
  );
}

function SavedDetailsCard({ labels, profile, onEdit, onClear }: { labels: ReturnType<typeof chatLabels>; profile: BirthProfile; onEdit: () => void; onClear: () => void }) {
  const rows = [
    [labels.name, profile.name],
    [labels.gender, profile.gender],
    [labels.birthDate, profile.dateOfBirth],
    [labels.birthTime, profile.timeOfBirth],
    [labels.birthPlace, profile.birthPlace],
    [labels.category, labels.categories.find((item) => item.value === profile.category)?.label || labels.general]
  ];
  return (
    <div className="rounded-lg border border-[rgba(20, 20, 20, 0.08)] bg-[rgba(255, 255, 255, 0.68)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-cinzel text-lg font-bold text-neutral-800">{labels.savedDetails}</p>
          <p className="mt-1 text-xs naksh-muted-text">{labels.savedDetailsNote}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 rounded-md border border-[rgba(20, 20, 20, 0.08)] bg-[rgba(255, 255, 255, 0.68)] px-3 py-2">
            <span className="text-neutral-500">{label}</span>
            <span className="text-right text-[#1e1e1f] font-semibold">{value}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onEdit}><Edit3 className="h-4 w-4" />{labels.editDetails}</Button>
        <Button type="button" variant="outline" onClick={onClear}><Trash2 className="h-4 w-4" />{labels.clearMemory}</Button>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function fieldClass(error?: string) {
  return `border-[rgba(20, 20, 20, 0.08)] bg-[rgba(255, 255, 255, 0.68)] ${error ? "border-destructive focus-visible:ring-destructive" : ""}`;
}

function validateProfile(profile: BirthProfile, message: string): FieldErrors {
  const errors: FieldErrors = {};
  if (isBlank(profile.name)) errors.name = message;
  if (isBlank(profile.gender)) errors.gender = message;
  if (isBlank(profile.dateOfBirth)) errors.dateOfBirth = message;
  if (isBlank(profile.timeOfBirth)) errors.timeOfBirth = message;
  if (isBlank(profile.birthPlace)) errors.birthPlace = message;
  return errors;
}

function hasRequiredBirthDetails(profile: BirthProfile) {
  return Boolean(profile.name.trim() && profile.gender.trim() && profile.dateOfBirth.trim() && profile.timeOfBirth.trim() && profile.birthPlace.trim());
}

function normalizeMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): ChatMessage[] => {
    if (!item || typeof item !== "object") return [];
    const message = item as Partial<ChatMessage>;
    if (message.role !== "user" && message.role !== "assistant") return [];
    if (typeof message.content !== "string" || !message.content.trim()) return [];
    return [{ role: message.role, content: message.content }];
  });
}

function normalizeBirthProfile(value: unknown): BirthProfile {
  if (!value || typeof value !== "object") return { ...emptyProfile };
  const profile = value as Partial<BirthProfile> & { birthDate?: string; birthTime?: string };
  return {
    name: safeString(profile.name),
    gender: safeString(profile.gender),
    dateOfBirth: safeString(profile.dateOfBirth || profile.birthDate),
    timeOfBirth: safeString(profile.timeOfBirth || profile.birthTime),
    birthPlace: safeString(profile.birthPlace),
    category: normalizeCategory(profile.category),
    selectedLanguage: safeString(profile.selectedLanguage)
  };
}

function buildContextPayload(profile: BirthProfile, hiddenContext: string, language: ChatLanguage) {
  const latest = latestKundliContext();
  const parts = [
    `Selected language: ${language}`,
    `Full Name: ${profile.name}`,
    `Gender: ${profile.gender}`,
    `Date of Birth: ${profile.dateOfBirth}`,
    `Time of Birth: ${profile.timeOfBirth}`,
    `Birth Place: ${profile.birthPlace}`,
    profile.category ? `Main Concern / Question Category: ${profile.category}` : null,
    hiddenContext.trim() ? `Session astrology memory:\n${hiddenContext.trim()}` : null,
    latest || "Full Kundli/chart context is not available in this session. Do not invent exact planetary placements; mention that deeper accuracy needs Kundli generation."
  ].filter(Boolean);
  return parts.join("\n").slice(0, 3900);
}

function latestKundliContext() {
  try {
    const saved = window.sessionStorage.getItem("naksharix-latest-kundli-report");
    if (!saved) return "";
    const report = JSON.parse(saved) as Record<string, unknown>;
    const calculation = (report.calculationData ?? {}) as Record<string, unknown>;
    const dasha = (report.dasha ?? report.dashas ?? calculation.dasha ?? calculation.dashas) as Record<string, unknown> | undefined;
    return [
      "Latest generated Kundli context available.",
      safeString(calculation.lagna || calculation.ascendant) ? `Lagna: ${safeString(calculation.lagna || calculation.ascendant)}` : null,
      safeString(calculation.moonSign) ? `Moon sign: ${safeString(calculation.moonSign)}` : null,
      safeString(calculation.nakshatra) ? `Nakshatra: ${safeString(calculation.nakshatra)}` : null,
      dasha ? `Dasha summary: ${JSON.stringify(dasha).slice(0, 500)}` : null
    ].filter(Boolean).join("\n");
  } catch {
    return "";
  }
}

function detectContextSignals(context: string, profile: BirthProfile, language: ChatLanguage) {
  const text = `${context} ${profile.dateOfBirth} ${profile.timeOfBirth} ${profile.birthPlace}`.toLowerCase();
  const labelMap = {
    birth: language === "Hindi" ? "जन्म विवरण सेव" : language === "Hinglish" ? "Birth details saved" : "Birth details saved",
    kundli: language === "Hindi" ? "कुंडली संदर्भ" : "Kundli context",
    dasha: language === "Hindi" ? "दशा" : "Dasha",
    numerology: language === "Hindi" ? "अंक ज्योतिष" : "Numerology",
    matching: language === "Hindi" ? "मिलान" : "Matching"
  };
  return [
    { label: labelMap.birth, active: hasRequiredBirthDetails(profile) },
    { label: `${labelMap.kundli} ${availableText(/(kundli|lagna|moon sign|nakshatra|कुंडली|लग्न|नक्षत्र)/i.test(text), language)}`, active: /(kundli|lagna|moon sign|nakshatra|कुंडली|लग्न|नक्षत्र)/i.test(text) },
    { label: `${labelMap.dasha} ${availableText(/(dasha|mahadasha|antardasha|दशा|महादशा|अंतर्दशा)/i.test(text), language)}`, active: /(dasha|mahadasha|antardasha|दशा|महादशा|अंतर्दशा)/i.test(text) },
    { label: `${labelMap.numerology} ${availableText(/(numerology|moolank|bhagyank|lo shu|अंक|लो शू)/i.test(text), language)}`, active: /(numerology|moolank|bhagyank|lo shu|अंक|लो शू)/i.test(text) },
    { label: `${labelMap.matching} ${availableText(/(matching|guna|ashtakoot|manglik|मिलान|गुण|मांगलिक)/i.test(text), language)}`, active: /(matching|guna|ashtakoot|manglik|मिलान|गुण|मांगलिक)/i.test(text) }
  ];
}

function availableText(active: boolean, language: ChatLanguage) {
  if (language === "Hindi") return active ? "उपलब्ध" : "उपलब्ध नहीं";
  if (language === "Hinglish") return active ? "available" : "not available";
  return active ? "available" : "not available";
}

function suggestedQuestionsFor(language: ChatLanguage) {
  if (language === "Hindi") {
    return [
      "मेरे व्यक्तित्व और जीवन दिशा के बारे में बताएं।",
      "मेरी कुंडली करियर के बारे में क्या कहती है?",
      "संबंधों में मुझे क्या सुधार करना चाहिए?",
      "क्या वर्तमान समय विकास के लिए सहयोगी है?",
      "संतुलन के लिए कौन से उपाय मदद कर सकते हैं?"
    ];
  }
  if (language === "Hinglish") {
    return [
      "Mere personality aur life path ke baare mein batao.",
      "Meri birth chart career ke baare mein kya kehti hai?",
      "Relationship mein mujhe kya improve karna chahiye?",
      "Kya current time growth ke liye supportive hai?",
      "Balance ke liye kaun se remedies help kar sakti hain?"
    ];
  }
  return [
    "Tell me about my personality and life path.",
    "What does my birth chart say about career?",
    "What should I improve in relationships?",
    "Is my current period supportive for growth?",
    "What remedies can help me stay balanced?"
  ];
}

function chatLabels(language: ChatLanguage) {
  const categories = language === "Hindi"
    ? [{ value: "career", label: "करियर" }, { value: "marriage", label: "विवाह" }, { value: "finance", label: "धन" }, { value: "love", label: "प्रेम" }, { value: "health", label: "स्वास्थ्य" }, { value: "general", label: "सामान्य" }]
    : language === "Hinglish"
      ? [{ value: "career", label: "Career" }, { value: "marriage", label: "Marriage" }, { value: "finance", label: "Finance" }, { value: "love", label: "Love" }, { value: "health", label: "Health" }, { value: "general", label: "General" }]
      : [{ value: "career", label: "Career" }, { value: "marriage", label: "Marriage" }, { value: "finance", label: "Finance" }, { value: "love", label: "Love" }, { value: "health", label: "Health" }, { value: "general", label: "General" }];

  if (language === "Hindi") {
    return {
      title: "अपने AI ज्योतिषी को व्यक्तिगत बनाएं",
      subtitle: "अपनी जन्म जानकारी एक बार साझा करें। Naksharix AI इन्हीं विवरणों के आधार पर करियर, विवाह, धन, प्रेम, स्वास्थ्य, उपाय, दोष, रत्न, कुंडली और समय से जुड़े प्रश्नों का अधिक व्यक्तिगत उत्तर देगा।",
      name: "पूरा नाम",
      gender: "लिंग",
      genderPlaceholder: "पुरुष / स्त्री / अन्य",
      birthDate: "जन्म तिथि",
      birthTime: "जन्म समय",
      birthPlace: "जन्म स्थान",
      placePlaceholder: "शहर, राज्य, देश",
      category: "मुख्य चिंता / प्रश्न श्रेणी",
      categoryPlaceholder: "वैकल्पिक श्रेणी चुनें",
      categories,
      general: "सामान्य",
      saveCta: "जन्म जानकारी सेव करें और चैट शुरू करें",
      lockedMessage: "व्यक्तिगत AI ज्योतिष मार्गदर्शन शुरू करने के लिए अपनी जन्म जानकारी पूरी करें।",
      savedNotice: "जन्म जानकारी सेव हो गई है।",
      savedDetails: "सेव जन्म जानकारी",
      savedDetailsNote: "AI हर उत्तर में इन विवरणों को संदर्भ के रूप में उपयोग करेगा।",
      editDetails: "जन्म जानकारी बदलें",
      clearMemory: "मेमोरी साफ करें",
      memoryCleared: "मेमोरी साफ हो गई है। कृपया जन्म जानकारी फिर से भरें।",
      contextChips: "संदर्भ स्थिति",
      clearChat: "चैट साफ करें",
      benefits: [
        { title: "व्यक्तिगत कुंडली मार्गदर्शन", copy: "जन्म विवरण से उत्तर generic नहीं रहते।" },
        { title: "करियर, विवाह और धन संकेत", copy: "प्रश्न के विषय के अनुसार उत्तर ज्यादा उपयोगी बनते हैं।" },
        { title: "उपाय और समय सहयोग", copy: "AI शांत, व्यावहारिक और non-fear-based guidance देता है।" }
      ],
      safetyNote: "Naksharix AI आत्मचिंतन के लिए है। Medical, legal, financial या mental-health decisions के लिए qualified professional से सलाह लें।"
    };
  }
  if (language === "Hinglish") {
    return {
      title: "Apne AI Astrologer ko Personalize Karein",
      subtitle: "Apni birth details ek baar share karein. Naksharix AI in details ke basis par career, marriage, finance, love, health, remedies, dosha, gemstone, kundli aur timing questions ka personalized answer dega.",
      name: "Full Name",
      gender: "Gender",
      genderPlaceholder: "Male / Female / Other",
      birthDate: "Date of Birth",
      birthTime: "Time of Birth",
      birthPlace: "Birth Place",
      placePlaceholder: "City, state, country",
      category: "Main Concern / Question Category",
      categoryPlaceholder: "Optional category choose karein",
      categories,
      general: "General",
      saveCta: "Birth Details Save Karke Chat Start Karein",
      lockedMessage: "Personalized AI astrology guidance start karne ke liye apni birth details complete karein.",
      savedNotice: "Birth details save ho gayi hain.",
      savedDetails: "Saved Birth Details",
      savedDetailsNote: "AI har answer me in details ko context ke roop me use karega.",
      editDetails: "Edit Birth Details",
      clearMemory: "Clear Memory",
      memoryCleared: "Memory clear ho gayi hai. Birth details dobara fill karein.",
      contextChips: "Context Status",
      clearChat: "Clear chat",
      benefits: [
        { title: "Personalized Kundli guidance", copy: "Birth details se answers generic nahi rehte." },
        { title: "Career, marriage, finance insights", copy: "Question category ke hisaab se answer zyada useful hota hai." },
        { title: "Remedies and timing support", copy: "AI calm, practical aur non-fear-based guidance deta hai." }
      ],
      safetyNote: "Naksharix AI guidance self-reflection ke liye hai. Medical, legal, financial ya mental-health decisions ke liye qualified professional se advice lein."
    };
  }
  return {
    title: "Personalize Your AI Astrologer",
    subtitle: "Share your birth details once. Naksharix AI will use them to answer career, marriage, finance, love, health, remedies, dosha, gemstone, kundli, and timing questions more personally.",
    name: "Full Name",
    gender: "Gender",
    genderPlaceholder: "Male / Female / Other",
    birthDate: "Date of Birth",
    birthTime: "Time of Birth",
    birthPlace: "Birth Place",
    placePlaceholder: "City, state, country",
    category: "Main Concern / Question Category",
    categoryPlaceholder: "Choose optional category",
    categories,
    general: "General",
    saveCta: "Save Birth Details & Start Chat",
    lockedMessage: "Complete your birth details to start personalized AI astrology guidance.",
    savedNotice: "Birth details saved.",
    savedDetails: "Saved Birth Details",
    savedDetailsNote: "AI will use these details as context for each answer.",
    editDetails: "Edit Birth Details",
    clearMemory: "Clear Memory",
    memoryCleared: "Memory cleared. Please complete birth details again.",
    contextChips: "Context Status",
    clearChat: "Clear chat",
    benefits: [
      { title: "Personalized Kundli guidance", copy: "Birth details keep answers from feeling generic." },
      { title: "Career, marriage, finance insights", copy: "Your main concern helps shape more useful answers." },
      { title: "Remedies and timing support", copy: "Guidance stays calm, practical, and non-fear-based." }
    ],
    safetyNote: "Naksharix AI guidance is for reflection. For medical, legal, financial, or mental-health decisions, consult a qualified professional."
  };
}

function welcomeMessage(profile: BirthProfile, language: ChatLanguage) {
  const name = profile.name || (language === "Hindi" ? "साधक" : "seeker");
  if (language === "Hindi") return `धन्यवाद, ${name}. आपकी जन्म जानकारी सेव हो गई है। अब आप करियर, विवाह, धन, प्रेम, स्वास्थ्य, उपाय, रत्न, दोष, कुंडली या समय से जुड़े प्रश्न पूछ सकते हैं।`;
  if (language === "Hinglish") return `Dhanyavaad, ${name}. Aapki birth details save ho gayi hain. Ab aap career, marriage, finance, love, health, remedies, gemstone, dosha, kundli ya timing ke questions pooch sakte hain.`;
  return `Thank you, ${name}. Your birth details are saved. You can now ask about career, marriage, finance, love, health, remedies, gemstone, dosha, kundli, or timing.`;
}

function providerFallback(language: ChatLanguage) {
  if (language === "Hindi") return "अभी उत्तर तैयार नहीं हो पाया। कृपया थोड़ी देर बाद फिर प्रयास करें।";
  if (language === "Hinglish") return "Abhi response generate nahi ho paya. Thodi der baad try karein.";
  return "I could not generate a response right now. Please try again in a moment.";
}

function missingConfigMessage(language: ChatLanguage) {
  if (language === "Hindi") return "AI सेवा अभी कॉन्फ़िगर नहीं है। कृपया GEMINI_API_KEY जोड़ें।";
  if (language === "Hinglish") return "AI service abhi configured nahi hai. Please GEMINI_API_KEY add karein.";
  return "AI service is not configured yet. Please add GEMINI_API_KEY.";
}

function safeUiText(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const text = value.trim();
  if (!text || text === "undefined" || text === "null" || text === "[object Object]") return fallback;
  if (/^\s*[{[]/.test(text)) return fallback;
  return text;
}

function safeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeCategory(value: unknown): ConcernCategory {
  return ["career", "marriage", "finance", "love", "health", "general"].includes(String(value)) ? value as ConcernCategory : "";
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
