"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {secureFetch} from "@/lib/security/csrf";
type Module={id:string;title:string;completed:boolean};
type Data={modules:Module[];lesson:{id:string;title:string;objective:string;caseStudy:string;chapter:string[];exercise:string;questions:{prompt:string;choices:string[]}[]}};
type Feedback={passed:boolean;feedback:{correct:boolean;explanation:string}[]};
export function PaidCourseWorkspace({orderId}:{orderId:string}){
 const [data,setData]=useState<Data|null>(null),[selected,setSelected]=useState(""),[answers,setAnswers]=useState<number[]>([]),[feedback,setFeedback]=useState<Feedback|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const sequence=useRef(0),requestPending=useRef(false);
 const load=useCallback(async(moduleId:string)=>{
 const n=++sequence.current;setError("");setData(null);setFeedback(null);setAnswers([]);setBusy(true);
 try{const q=new URLSearchParams({orderId,...(moduleId?{moduleId}:{})});const r=await fetch("/api/learn/paid-course?"+q,{cache:"no-store"});const j=await r.json();if(n!==sequence.current)return;if(!r.ok||!j.data)throw Error(j.error??"Course unavailable.");setData(j.data);}
 catch(e){if(n===sequence.current)setError(e instanceof Error?e.message:"Course unavailable.");}
 finally{if(n===sequence.current)setBusy(false);}
 },[orderId]);
 useEffect(()=>{void load(selected);return()=>{sequence.current++;};},[selected,load]);
 async function assess(e:React.FormEvent<HTMLFormElement>){
 e.preventDefault();if(!data||requestPending.current||busy||answers.length!==data.lesson.questions.length||answers.some(a=>!Number.isInteger(a)))return;
 requestPending.current=true;setBusy(true);setError("");
 const n=sequence.current,lesson=data.lesson.id;
 try{const r=await secureFetch("/api/learn/paid-course",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderId,moduleId:lesson,answers}),silent:true});const j=await r.json();if(n!==sequence.current)return;if(!r.ok||!j.data)throw Error(j.error??"Assessment not saved.");setFeedback(j.data);if(j.data.passed)setData(old=>old?{...old,modules:old.modules.map(m=>m.id===lesson?{...m,completed:true}:m)}:old);}
 catch(e){if(n===sequence.current)setError(e instanceof Error?e.message:"Assessment not saved.");}
 finally{requestPending.current=false;if(n===sequence.current)setBusy(false);}
 }
 return <div className="space-y-6">{error?<p role="alert" className="rounded-xl border border-[#b37265] bg-white p-4 text-[#7b3043]">{error}</p>:null}{!data?<><p role="status">{busy?"Checking course access…":"Verified course access is required."}</p><Button type="button" variant="outline" disabled={busy} onClick={()=>void load(selected)}>Retry</Button><Link className="ml-3 underline" href="/digital-packages">Your packages</Link></>:<>
 <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
 <aside className="rounded-2xl border border-[#e4cbaa] bg-white p-4"><h2 className="font-bold text-lg">Course modules</h2><p role="status" className="mt-3 text-sm">{data.modules.filter(m=>m.completed).length} of {data.modules.length} formative checks passed</p><progress aria-label="Learning progress" className="mt-2 w-full" value={data.modules.filter(m=>m.completed).length} max={data.modules.length}/><nav aria-label="Course modules" className="mt-4 space-y-2">{data.modules.map(m=><button key={m.id} type="button" disabled={busy} aria-current={data.lesson.id===m.id?"step":undefined} onClick={()=>setSelected(m.id)} className={"block w-full rounded-lg border p-3 text-left text-sm "+(data.lesson.id===m.id?"border-[#70283d] bg-[#fff3e1]":"border-[#e4cbaa]")}>{m.title}{m.completed?" · Passed":""}</button>)}</nav></aside>
 <article className="rounded-2xl border border-[#e4cbaa] bg-white p-5 sm:p-8"><h2 className="text-2xl font-black text-[#70283d]">{data.lesson.title}</h2><p className="mt-3 font-semibold">{data.lesson.objective}</p><div className="mt-4 space-y-4 leading-7">{data.lesson.chapter.map(p=><p key={p}>{p}</p>)}</div><h3 className="mt-6 text-lg font-bold">Worked example</h3><p className="mt-2 rounded-lg bg-[#fff3e1] p-4 leading-7">{data.lesson.caseStudy}</p><h3 className="mt-6 text-lg font-bold">Try it yourself</h3><p className="mt-2 leading-7">{data.lesson.exercise}</p><form className="mt-6 space-y-5" onSubmit={assess}><h3 className="font-bold text-lg">Check your understanding</h3>{data.lesson.questions.map((q,i)=><fieldset key={q.prompt} className="rounded-xl border p-4" disabled={busy}><legend className="px-2 font-semibold">{i+1}. {q.prompt}</legend>{q.choices.map((choice,j)=><label key={choice} className="mt-3 flex items-start gap-2 text-sm"><input required type="radio" name={"q-"+i} checked={answers[i]===j} onChange={()=>{setFeedback(null);setAnswers(prev=>{const next=[...prev];next[i]=j;return next;});}}/>{choice}</label>)}</fieldset>)}<Button disabled={busy||answers.length!==data.lesson.questions.length||data.lesson.questions.some((_,i)=>!Number.isInteger(answers[i]))}>{busy?"Checking…":"Check answers and save progress"}</Button></form>
 {feedback?<section aria-live="polite" className="mt-4 rounded-xl border p-4"><p className="font-bold">{feedback.passed?"Module check passed and progress saved.":"Review these explanations and try again."}</p>{feedback.feedback.map((x,i)=><p key={i} className="mt-2 text-sm">{i+1}. {x.correct?"Correct. ":"Review. "}{x.explanation}</p>)}</section>:null}
 <p className="mt-6 text-xs">These checks measure understanding of the lesson examples, not professional qualification or accredited certification.</p></article></div><Link href="/digital-packages" className="underline">Return to purchased workbook and package</Link></>}</div>;
}
