"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {useLanguage} from "@/components/language-provider";
import {secureFetch} from "@/lib/security/csrf";
import {courseCustomerCopy,courseFailure,type CourseNotice} from "@/lib/learning/course-customer-copy";
import {readCourseData,readCourseFeedback,completeCourseAnswers,type CourseData,type CourseFeedback} from "@/lib/learning/course-client-contract";

export function PaidCourseWorkspace({orderId}:{orderId:string}){
 const {locale}=useLanguage(),c=courseCustomerCopy(locale);
 const [data,setData]=useState<CourseData|null>(null),[selected,setSelected]=useState(""),[answers,setAnswers]=useState<number[]>([]),[feedback,setFeedback]=useState<CourseFeedback|null>(null),[busy,setBusy]=useState(false),[notice,setNotice]=useState<CourseNotice|null>(null),[uncertain,setUncertain]=useState(false);
 const sequence=useRef(0),requestPending=useRef(false);
 const load=useCallback(async(moduleId:string)=>{
  const n=++sequence.current;setNotice(null);setData(null);setFeedback(null);setAnswers([]);setBusy(true);
  try{const q=new URLSearchParams({orderId,...(moduleId?{moduleId}:{})});const response=await fetch("/api/learn/paid-course?"+q,{cache:"no-store"});const json=await response.json().catch(()=>null);if(n!==sequence.current)return;
   const next=response.ok?readCourseData(json?.data,orderId,moduleId):null;
   if(!next){setNotice(courseFailure(response.status));return;}setData(next);setUncertain(false);
  }catch{if(n===sequence.current)setNotice("unavailable");}
  finally{if(n===sequence.current)setBusy(false);}
 },[orderId]);
 useEffect(()=>{void load(selected);return()=>{sequence.current++;};},[selected,load]);
 async function assess(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();if(!data||data.orderId!==orderId||requestPending.current||busy||uncertain||!completeCourseAnswers(data,answers))return;
  requestPending.current=true;setBusy(true);setNotice(null);setFeedback(null);
  const n=sequence.current,moduleId=data.lesson.id,submitted=[...answers];
  try{const response=await secureFetch("/api/learn/paid-course",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderId,moduleId,answers:submitted}),silent:true});const json=await response.json().catch(()=>null);if(n!==sequence.current)return;
   const result=response.ok?readCourseFeedback(json?.data,orderId,moduleId,data.lesson.questions.length):null;
   if(!result){setNotice(response.ok?"unconfirmed":courseFailure(response.status));setUncertain(true);return;}
   setFeedback(result);if(result.passed)setData(old=>old?{...old,modules:old.modules.map(m=>m.id===moduleId?{...m,completed:true}:m)}:old);
  }catch{if(n===sequence.current){setNotice("unconfirmed");setUncertain(true);}}
  finally{requestPending.current=false;if(n===sequence.current)setBusy(false);}
 }
 return <div className="space-y-6">{notice?<p role="alert" className="rounded-xl border border-[#b37265] bg-white p-4 text-[#7b3043]">{c[notice]}</p>:null}
 {!data?<><p role="status">{busy?c.checking:c.required}</p><Button type="button" variant="outline" disabled={busy} onClick={()=>void load(selected)}>{c.retry}</Button><Link className="ml-3 underline" href="/digital-packages">{c.packages}</Link></>:<>
 {uncertain?<Button type="button" variant="outline" disabled={busy} onClick={()=>void load(selected)}>{c.retry}</Button>:null}
 <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
 <aside className="rounded-2xl border border-[#e4cbaa] bg-white p-4"><h2 className="font-bold text-lg">{c.modules}</h2><p role="status" className="mt-3 text-sm">{data.modules.filter(m=>m.completed).length} / {data.modules.length} {c.progress}</p><progress aria-label={c.progressLabel} className="mt-2 w-full" value={data.modules.filter(m=>m.completed).length} max={data.modules.length}/><nav aria-label={c.modules} className="mt-4 space-y-2">{data.modules.map(m=><button key={m.id} type="button" disabled={busy} aria-current={data.lesson.id===m.id?"step":undefined} onClick={()=>setSelected(m.id)} className={"block w-full rounded-lg border p-3 text-left text-sm "+(data.lesson.id===m.id?"border-[#70283d] bg-[#fff3e1]":"border-[#e4cbaa]")}><span lang="en">{m.title}</span>{m.completed?" · "+c.passed:""}</button>)}</nav></aside>
 <article className="rounded-2xl border border-[#e4cbaa] bg-white p-5 sm:p-8"><h2 lang="en" className="text-2xl font-black text-[#70283d]">{data.lesson.title}</h2><p lang="en" className="mt-3 font-semibold">{data.lesson.objective}</p><div lang="en" className="mt-4 space-y-4 leading-7">{data.lesson.chapter.map(p=><p key={p}>{p}</p>)}</div><h3 className="mt-6 text-lg font-bold">{c.example}</h3><p lang="en" className="mt-2 rounded-lg bg-[#fff3e1] p-4 leading-7">{data.lesson.caseStudy}</p><h3 className="mt-6 text-lg font-bold">{c.exercise}</h3><p lang="en" className="mt-2 leading-7">{data.lesson.exercise}</p>
 <form className="mt-6 space-y-5" onSubmit={assess}><h3 className="font-bold text-lg">{c.understanding}</h3>{data.lesson.questions.map((q,i)=><fieldset lang="en" key={q.prompt} className="rounded-xl border p-4" disabled={busy||uncertain}><legend className="px-2 font-semibold">{i+1}. {q.prompt}</legend>{q.choices.map((choice,j)=><label key={choice} className="mt-3 flex items-start gap-2 text-sm"><input required type="radio" name={"q-"+i} checked={answers[i]===j} onChange={()=>{setFeedback(null);setAnswers(prev=>{const next=[...prev];next[i]=j;return next;});}}/>{choice}</label>)}</fieldset>)}<Button disabled={busy||uncertain||!completeCourseAnswers(data,answers)}>{busy?c.assessing:c.assess}</Button></form>
 {feedback?<section aria-live="polite" className="mt-4 rounded-xl border p-4"><p className="font-bold">{feedback.passed?c.saved:c.review}</p>{feedback.feedback.map((x,i)=><p key={i} className="mt-2 text-sm">{i+1}. {x.correct?c.correct:c.revise} <span lang="en">{x.explanation}</span></p>)}</section>:null}
 <p className="mt-6 text-xs">{c.limits}</p></article></div><Link href="/digital-packages" className="underline">{c.return}</Link></>}</div>;
}
