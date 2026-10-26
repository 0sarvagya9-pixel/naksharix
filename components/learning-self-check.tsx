"use client";
import { useState } from "react";

// Educational only; no accredited exam, teacher verification or certification.
const questions = [
 { id: "birth-chart", title: "Birth chart", question: "Which inputs affect the calculated Ascendant?", choices: ["Favourite colour", "Birth time and location", "Name spelling"], correct: 1, explanation: "The Ascendant uses the date, birth time and location; approximation can change the calculation." },
 { id: "panchang", title: "Panchang", question: "Which traditional element describes the Sun–Moon angular relationship?", choices: ["Tithi", "Vara", "Lagna"], correct: 0, explanation: "Tithi follows the angular relationship. Transition times depend on location and conventions." },
 { id: "nakshatras", title: "Nakshatras", question: "How many Nakshatras are used in the common 27-part framework?", choices: ["12", "27", "108"], correct: 1, explanation: "The common framework uses 27 Nakshatras, distinct from twelve zodiac signs." },
 { id: "dasha", title: "Dasha", question: "A Dasha period should be treated as:", choices: ["A certain prediction", "A traditional interpretive timeline", "Medical guidance"], correct: 1, explanation: "A Dasha is a traditional timeline and not a guaranteed forecast or professional advice." }
] as const;

export function LearningSelfCheck() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState(false);
  const attempted = Object.keys(answers).length;
  const correct = questions.filter((q) => answers[q.id] === q.correct).length;
  return (
    <section className="mt-8 rounded-2xl border border-[#D4AF37]/25 bg-[#061D3C]/80 p-5 sm:p-7"
      aria-label="Learning self-check">
      <p className="text-xs font-bold tracking-[0.2em] text-[#FFD700]">PRACTICE QUESTIONS</p>
      <h2 className="mt-2 font-cinzel text-2xl font-bold">Check your understanding</h2>
      <p className="mt-3 text-sm leading-7 naksh-muted-text">Four questions based on the lessons. Answers remain on this page. No official examination or certificate is offered.</p>
      <div className="mt-6 space-y-6">
        {questions.map((item, i) => (
          <fieldset key={item.id} className="rounded-xl border border-[#D4AF37]/20 p-4">
            <legend className="px-2 text-sm font-bold">{i + 1}. {item.title}</legend>
            <p className="mb-3 text-sm">{item.question}</p>
            <div className="grid gap-2">
              {item.choices.map((choice, index) => (
                <label className="flex cursor-pointer items-start gap-3 text-sm" key={choice}>
                  <input type="radio" name={"question-" + item.id}
                    checked={answers[item.id] === index}
                    onChange={() => { setAnswers((before) => ({ ...before, [item.id]: index })); setRevealed(false); }}
                    className="mt-1 accent-amber-500" />
                  <span>{choice}</span>
                </label>
              ))}
            </div>
            {revealed ? <p role="status" className="mt-3 text-sm leading-6 text-[#f6d6a4]">
              {answers[item.id] === item.correct ? "Correct. " : "Review: "}{item.explanation}
            </p> : null}
          </fieldset>
        ))}
      </div>
      <button type="button" disabled={attempted < questions.length}
        onClick={() => setRevealed(true)}
        className="mt-5 rounded-lg bg-[#e7b965] px-5 py-3 font-bold text-[#161225] disabled:cursor-not-allowed disabled:opacity-50">
        Check answers
      </button>
      {revealed ? <p role="status" className="mt-3 text-sm">Self-check: {correct}/{questions.length}. Learning only; not an accredited result.</p>
        : <p className="mt-3 text-xs naksh-muted-text">Answer all four questions to reveal explanations.</p>}
    </section>
  );
}
