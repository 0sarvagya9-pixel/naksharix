import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { pujaTopics } from "@/lib/puja/service-catalogue";
export type PublicPujaOffer = { topicId:string; pricePaise:number; durationMinutes:number|null; note:string };
export async function getPublishedPujaOffers():Promise<Record<string,PublicPujaOffer>>{
  try{
    const rows=await prisma.pujaOffering.findMany({
      where:{available:true,pricePaise:{gte:100}},
      select:{topicId:true,pricePaise:true,durationMinutes:true,note:true}
    });
    const known=new Set(pujaTopics.map(p=>p.id));
    return Object.fromEntries(rows.filter(x=>known.has(x.topicId)&&x.pricePaise!==null).map(x=>[
      x.topicId,{topicId:x.topicId,pricePaise:x.pricePaise!,durationMinutes:x.durationMinutes,note:/(verified Pandit availability|no payment is collected before confirmation|payment stays disabled until a verified Pandit)/i.test(x.note)?"":x.note}
    ]));
  }catch(error){
    if(error instanceof Prisma.PrismaClientKnownRequestError && error.code==="P2021")return {};
    throw error;
  }
}
export function displayPujaPrice(paise:number){
  return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(paise/100);
}
