"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import Link from "next/link";
import { Bot, Eraser, Loader2, MessageCircleQuestion, Send, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/section";
import { useLanguage } from "@/components/language-provider";
import { secureFetch } from "@/lib/security/csrf";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function AiAstrologerChat() {
  const { locale, apiLocale } = useLanguage();
  const labels = chatLabels(locale);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [memory, setMemory] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [loading, messages]);

  async function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const content = input.trim();
    if (!content || loading) return;
    if (!consent) {
      setStatus(labels.consentRequired);
      return;
    }

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content };
    const outbound = [...messages, userMessage]
      .slice(-24)
      .map(({ role, content: messageContent }) => ({ role, content: messageContent }));

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setStatus("");
    setLoading(true);

    try {
      const response = await secureFetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: outbound,
          language: apiLocale,
          kundliContext: memory || undefined
        })
      });
      const json = await response.json().catch(() => null);

      if (!response.ok || typeof json?.data?.answer !== "string") {
        setStatus(json?.error || labels.error);
        return;
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: json.data.answer.trim()
      };
      setMessages((current) => [...current, assistantMessage].slice(-24));
      if (typeof json.data.memory === "string") setMemory(json.data.memory.slice(0, 3500));
    } catch {
      setStatus(labels.error);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      void submit();
    }
  }

  function clearChat() {
    setMessages([]);
    setMemory("");
    setInput("");
    setStatus("");
  }

  return (
    <main className="inner-page-shell star-field min-h-screen">
      <Section first>
        <div className="inner-section rounded-3xl border border-[#263957] bg-[#0a1224]/88 p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-2xl border border-[#dca956]/35 bg-[#142647] text-[#f3d382]">
                  <Bot className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#00f5a0]">{labels.eyebrow}</p>
                  <h1 className="mt-1 font-cinzel text-3xl font-black text-[#f3d382] sm:text-4xl">{labels.title}</h1>
                </div>
              </div>
              <p className="mt-5 text-base leading-7 text-[#cbd5e1]">{labels.subtitle}</p>
            </div>
            <div className="rounded-2xl border border-[#00f5a0]/20 bg-[#00f5a0]/8 p-4 text-sm text-[#cbd5e1] lg:max-w-sm">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#00f5a0]" />
                <p>{labels.safety}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_320px]">
          <Card className="inner-card overflow-hidden border-[#263957] bg-[#071326]/92">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-[#263957] px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#f3d382]">
                  <MessageCircleQuestion className="h-4 w-4" />
                  {labels.chatTitle}
                </div>
                <Button type="button" size="sm" variant="outline" onClick={clearChat} disabled={loading || (!messages.length && !input)}>
                  <Eraser className="h-4 w-4" />
                  {labels.clear}
                </Button>
              </div>

              <div className="h-[min(58vh,560px)] min-h-[360px] overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite">
                {!messages.length ? (
                  <div className="max-w-2xl rounded-2xl rounded-tl-sm border border-[#dca956]/25 bg-[#142647]/85 p-4 text-sm leading-6 text-[#dbeafe]">
                    <div className="mb-2 flex items-center gap-2 font-semibold text-[#f3d382]"><Bot className="h-4 w-4" />Naksharix</div>
                    {labels.welcome}
                  </div>
                ) : null}

                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[88%] rounded-2xl p-4 text-sm leading-6 sm:max-w-[78%] ${message.role === "user" ? "rounded-tr-sm bg-[#b8862e] text-white" : "rounded-tl-sm border border-[#263957] bg-[#142647]/85 text-[#dbeafe]"}`}>
                        <div className={`mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] ${message.role === "user" ? "text-white/80" : "text-[#f3d382]"}`}>
                          {message.role === "user" ? <UserRound className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                          {message.role === "user" ? labels.you : "Naksharix"}
                        </div>
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                    </div>
                  ))}

                  {loading ? (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-[#263957] bg-[#142647]/85 px-4 py-3 text-sm text-[#cbd5e1]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {labels.thinking}
                      </div>
                    </div>
                  ) : null}
                  <div ref={endRef} />
                </div>
              </div>

              <form onSubmit={submit} className="border-t border-[#263957] p-4 sm:p-5">
                <label htmlFor="ai-astrologer-message" className="sr-only">{labels.inputLabel}</label>
                <textarea
                  id="ai-astrologer-message"
                  value={input}
                  onChange={(event) => setInput(event.target.value.slice(0, 2000))}
                  onKeyDown={handleKeyDown}
                  rows={3}
                  maxLength={2000}
                  placeholder={labels.placeholder}
                  disabled={loading}
                  className="w-full resize-none rounded-xl border border-[#334b70] bg-[#020b1d] px-4 py-3 text-sm text-white outline-none placeholder:text-[#7f8da3] focus:border-[#dca956] focus:ring-2 focus:ring-[#dca956]/20"
                />
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-[#94a3b8]">{input.length}/2000 · {labels.shortcut}</p>
                  <Button type="submit" disabled={loading || !input.trim()} className="bg-[#006b50] text-white hover:bg-[#00583f]">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {labels.send}
                  </Button>
                </div>
                {status ? <p className="mt-3 rounded-lg border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-sm text-amber-100" role="alert">{status}</p> : null}
              </form>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card className="inner-card border-[#263957] bg-[#0f1c3a]/82">
              <CardContent className="p-5">
                <h2 className="flex items-center gap-2 font-cinzel text-xl font-bold text-[#f3d382]"><Sparkles className="h-5 w-5" />{labels.tryTitle}</h2>
                <div className="mt-4 grid gap-2">
                  {labels.suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setInput(suggestion)}
                      disabled={loading}
                      className="rounded-xl border border-[#263957] bg-[#071326]/75 px-3 py-3 text-left text-sm leading-5 text-[#cbd5e1] transition hover:border-[#dca956]/50 hover:text-white disabled:opacity-60"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="inner-card border-[#263957] bg-[#0f1c3a]/82">
              <CardContent className="p-5">
                <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-[#cbd5e1]">
                  <input type="checkbox" checked={consent} onChange={(event) => { setConsent(event.target.checked); setStatus(""); }} className="mt-1 h-4 w-4 accent-[#b8862e]" />
                  <span>{labels.consent}</span>
                </label>
                <p className="mt-4 text-xs leading-5 text-[#94a3b8]">{labels.privacy}</p>
              </CardContent>
            </Card>

            <Card className="inner-card border-[#263957] bg-[#0f1c3a]/82">
              <CardContent className="p-5">
                <h2 className="font-cinzel text-xl font-bold text-[#f3d382]">{labels.deeperTitle}</h2>
                <p className="mt-3 text-sm leading-6 text-[#cbd5e1]">{labels.deeperCopy}</p>
                <div className="mt-4 grid gap-2">
                  <Button variant="outline" asChild><Link href="/kundli">{labels.openKundli}</Link></Button>
                  <Button variant="outline" asChild><Link href="/consultation">{labels.bookConsultation}</Link></Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>
    </main>
  );
}

function chatLabels(locale: "en" | "hi" | "hinglish") {
  if (locale === "hi") return {
    eyebrow: "AI Guidance",
    title: "Naksharix AI Astrologer",
    subtitle: "करियर, विवाह, धन, प्रेम, समय, दोष या उपाय पर चिंतनात्मक मार्गदर्शन पूछें। अधिक व्यक्तिगत उत्तर के लिए जन्म तिथि, समय और स्थान दें।",
    safety: "यह AI आधारित चिंतनात्मक मार्गदर्शन है, निश्चित भविष्यवाणी या चिकित्सा, कानूनी और वित्तीय सलाह नहीं।",
    chatTitle: "AI से बातचीत",
    clear: "साफ़ करें",
    welcome: "नमस्ते। अपना प्रश्न लिखें। यदि आप व्यक्तिगत मार्गदर्शन चाहते हैं तो जन्म तिथि, सही समय और जन्म स्थान भी साझा करें।",
    you: "आप",
    thinking: "उत्तर तैयार हो रहा है…",
    inputLabel: "अपना प्रश्न लिखें",
    placeholder: "उदाहरण: मेरे करियर के अगले चरण के लिए किन बातों पर ध्यान दूँ?",
    shortcut: "भेजने के लिए Ctrl/⌘ + Enter",
    send: "भेजें",
    error: "अभी उत्तर नहीं मिल पाया। कृपया कुछ देर बाद फिर प्रयास करें।",
    consentRequired: "आगे बढ़ने से पहले गोपनीयता और AI processing की सहमति दें।",
    tryTitle: "इन प्रश्नों से शुरू करें",
    suggestions: ["मेरे करियर में अभी किस दिशा पर ध्यान देना चाहिए?", "विवाह और रिश्तों के लिए कौन-सी जानकारी आवश्यक है?", "मेरे प्रश्न की सटीकता बढ़ाने के लिए आपको क्या चाहिए?"],
    consent: "मैं समझता/समझती हूँ कि मेरा संदेश AI उत्तर बनाने के लिए Gemini सेवा को भेजा जाएगा।",
    privacy: "सरकारी पहचान, बैंक विवरण, पासवर्ड, पूर्ण मेडिकल रिकॉर्ड या अन्य अत्यधिक संवेदनशील जानकारी साझा न करें।",
    deeperTitle: "अधिक गहराई चाहिए?",
    deeperCopy: "सटीक चार्ट डेटा के लिए पहले कुंडली बनाएं या किसी अनुमोदित ज्योतिषी से परामर्श बुक करें।",
    openKundli: "कुंडली खोलें",
    bookConsultation: "परामर्श बुक करें"
  };
  if (locale === "hinglish") return {
    eyebrow: "AI Guidance",
    title: "Naksharix AI Astrologer",
    subtitle: "Career, marriage, finance, love, timing, dosha ya remedies par reflective guidance poochein. Personalized answer ke liye birth date, exact time aur place dein.",
    safety: "Ye AI-based reflective guidance hai, guaranteed prediction ya medical, legal aur financial advice nahi.",
    chatTitle: "AI se baat karein",
    clear: "Clear",
    welcome: "Namaste. Apna question likhein. Personalized guidance ke liye birth date, exact birth time aur birth place bhi share karein.",
    you: "Aap",
    thinking: "Answer prepare ho raha hai…",
    inputLabel: "Apna question likhein",
    placeholder: "Example: Mere career ke next phase me kis direction par focus karna chahiye?",
    shortcut: "Send ke liye Ctrl/⌘ + Enter",
    send: "Send",
    error: "Abhi answer nahi mil paaya. Thodi der baad dobara try karein.",
    consentRequired: "Continue karne se pehle privacy aur AI processing consent dein.",
    tryTitle: "In questions se start karein",
    suggestions: ["Mere career me abhi kis direction par focus karna chahiye?", "Marriage guidance ke liye aapko kaunsi details chahiye?", "Mere question ki accuracy improve karne ke liye kya information chahiye?"],
    consent: "Main samajhta/samajhti hoon ki mera message AI answer generate karne ke liye Gemini service ko bheja jayega.",
    privacy: "Government ID, bank details, passwords, full medical records ya highly sensitive information share na karein.",
    deeperTitle: "Deeper guidance chahiye?",
    deeperCopy: "Exact chart data ke liye pehle Kundli generate karein ya approved astrologer ke saath consultation book karein.",
    openKundli: "Open Kundli",
    bookConsultation: "Book Consultation"
  };
  return {
    eyebrow: "AI Guidance",
    title: "Naksharix AI Astrologer",
    subtitle: "Ask reflective questions about career, marriage, finance, love, timing, dosha, or remedies. Add birth date, exact time, and place for more personal guidance.",
    safety: "This is AI-generated reflective guidance, not a guaranteed prediction or medical, legal, or financial advice.",
    chatTitle: "Chat with AI",
    clear: "Clear",
    welcome: "Namaste. Write your question. For personalized guidance, also share your birth date, exact birth time, and birth place.",
    you: "You",
    thinking: "Preparing a response…",
    inputLabel: "Write your question",
    placeholder: "Example: What should I focus on in the next phase of my career?",
    shortcut: "Ctrl/⌘ + Enter to send",
    send: "Send",
    error: "A response is not available right now. Please try again later.",
    consentRequired: "Please accept the privacy and AI-processing notice before continuing.",
    tryTitle: "Try asking",
    suggestions: ["What direction should I focus on in my career right now?", "What details do you need for marriage guidance?", "What information would improve the accuracy of my question?"],
    consent: "I understand that my message will be sent to the Gemini service to generate an AI response.",
    privacy: "Do not share government IDs, banking details, passwords, full medical records, or other highly sensitive information.",
    deeperTitle: "Need deeper guidance?",
    deeperCopy: "Generate a Kundli for exact chart data, or book a consultation with an approved astrologer.",
    openKundli: "Open Kundli",
    bookConsultation: "Book Consultation"
  };
}
