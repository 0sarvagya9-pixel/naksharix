export type CourseData={orderId:string;modules:{id:string;title:string;completed:boolean}[];lesson:{id:string;title:string;objective:string;caseStudy:string;chapter:string[];exercise:string;questions:{prompt:string;choices:string[]}[]}};
export type CourseFeedback={orderId:string;moduleId:string;passed:boolean;feedback:{correct:boolean;explanation:string}[]};
const record=(v:unknown):v is Record<string,unknown>=>Boolean(v)&&typeof v==="object"&&!Array.isArray(v);
const text=(v:unknown):v is string=>typeof v==="string"&&v.trim().length>0;
export function readCourseData(value:unknown,orderId:string,selected:string):CourseData|null{
 if(!record(value)||value.orderId!==orderId||!Array.isArray(value.modules)||!value.modules.length||!record(value.lesson))return null;
 const modules=value.modules,lesson=value.lesson;
 if(!modules.every(m=>record(m)&&text(m.id)&&text(m.title)&&typeof m.completed==="boolean")||new Set(modules.map(m=>m.id)).size!==modules.length)return null;
 if(!text(lesson.id)||!modules.some(m=>m.id===lesson.id)||(selected&&lesson.id!==selected)||!selected&&lesson.id!==modules[0].id)return null;
 if(![lesson.title,lesson.objective,lesson.caseStudy,lesson.exercise].every(text)||!Array.isArray(lesson.chapter)||!lesson.chapter.length||!lesson.chapter.every(text))return null;
 if(!Array.isArray(lesson.questions)||lesson.questions.length!==2||!lesson.questions.every(q=>record(q)&&text(q.prompt)&&Array.isArray(q.choices)&&q.choices.length===3&&q.choices.every(text)))return null;
 return value as CourseData;
}
export function completeCourseAnswers(data:CourseData,answers:number[]):boolean{return answers.length===data.lesson.questions.length&&data.lesson.questions.every((q,i)=>Number.isInteger(answers[i])&&answers[i]>=0&&answers[i]<q.choices.length);}
export function readCourseFeedback(value:unknown,orderId:string,moduleId:string,questions:number):CourseFeedback|null{
 if(!record(value)||value.orderId!==orderId||value.moduleId!==moduleId||typeof value.passed!=="boolean"||!Array.isArray(value.feedback)||value.feedback.length!==questions)return null;
 if(!value.feedback.every(f=>record(f)&&typeof f.correct==="boolean"&&text(f.explanation))||value.passed!==value.feedback.every(f=>f.correct))return null;
 return value as CourseFeedback;
}
