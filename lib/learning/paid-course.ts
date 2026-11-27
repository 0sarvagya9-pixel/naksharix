import "server-only";
import {prisma} from "@/lib/db";
import {lockPackage,hasUnrefundedPackageEntitlement} from "@/lib/digital-packages/ledger";
import {studyChapters} from "@/lib/digital-packages/workbooks";
import {COURSE_KEY,COURSE_VERSION,courseModules,courseProgressKey,courseQuizResult,publicCourseModule} from "@/lib/learning/paid-course-contract";
import type {Prisma} from "@prisma/client";
export async function loadPaidCourse(userId:string,orderId:string,tx:Prisma.TransactionClient=prisma){
 const order=await tx.digitalPackageOrder.findFirst({where:{id:orderId,userId,productKey:COURSE_KEY,productVersion:COURSE_VERSION},include:{payment:true}});
 return order&&await hasUnrefundedPackageEntitlement(tx,order,order.payment)?order:null;
}
export async function readPaidCourse(userId:string,orderId:string,moduleId:string|undefined){
 return prisma.$transaction(async tx=>{
  await lockPackage(tx,orderId);
  if(!await loadPaidCourse(userId,orderId,tx))return null;
  const keys=courseModules.map(m=>courseProgressKey(orderId,m.id));
  const records=await tx.learningProgress.findMany({where:{userId,lessonId:{in:keys},completedAt:{not:null}},select:{lessonId:true}});
  const selected=moduleId??courseModules[0].id,index=courseModules.findIndex(m=>m.id===selected);
  if(index<0)return null;
  const lessonModule=publicCourseModule(selected);
  return {orderId,modules:courseModules.map((m,i)=>({id:m.id,title:studyChapters[i].title,completed:records.some(r=>r.lessonId===keys[i])})),lesson:{...lessonModule,chapter:studyChapters[index].body,title:studyChapters[index].title,exercise:studyChapters[index].exercise}};
 });
}
export async function assessPaidCourse(userId:string,orderId:string,moduleId:string,answers:number[]){
 const outcome=courseQuizResult(moduleId,answers);if(!outcome)return null;
 return prisma.$transaction(async tx=>{
  await lockPackage(tx,orderId);
  if(!await loadPaidCourse(userId,orderId,tx))return null;
  const lessonId=courseProgressKey(orderId,moduleId);
  // A later practice attempt cannot erase a previously passed formative check.
  if(outcome.passed)await tx.learningProgress.upsert({where:{userId_lessonId:{userId,lessonId}},create:{userId,lessonId,completedAt:new Date()},update:{completedAt:new Date()}});
  return {...outcome,orderId,moduleId};
 });
}
