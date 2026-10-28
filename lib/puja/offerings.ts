import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { pujaTopics } from "@/lib/puja/service-catalogue";

/** Owner-approved published base price for every listed Puja. This is NOT
 * a guarantee of partner availability or a payment authorization.
 */
export const STANDARD_PUJA_PRICE_PAISE=110000;
export type PublicPujaOffer = { topicId:string; pricePaise:number; durationMinutes:number|null; note:string };
export function effectivePujaPrice(override:{available:boolean;pricePaise:number|null}|null|undefined):number|null{
  if(!override)return STANDARD_PUJA_PRICE_PAISE;
  return override.available&&override.pricePaise!==null&&override.pricePaise>=100?override.pricePaise:null;
}
export async function getPublishedPujaOffers():Promise<Record<string,PublicPujaOffer>>{
  try{
    const rows=await prisma.pujaOffering.findMany({
      select:{topicId:true,pricePaise:true,durationMinutes:true,note:true,available:true}
    });
    const offers:Record<string,PublicPujaOffer>=Object.fromEntries(pujaTopics.map(topic=>[
      topic.id,{topicId:topic.id,pricePaise:STANDARD_PUJA_PRICE_PAISE,durationMinutes:null,
        note:"Standard service fee. Pandit and muhurat confirmation required before payment."}
    ]));
    for(const row of rows){
      if(!(row.topicId in offers))continue;
      const pricePaise=effectivePujaPrice(row);
      if(pricePaise===null){delete offers[row.topicId];continue;}
      offers[row.topicId]={topicId:row.topicId,pricePaise,durationMinutes:row.durationMinutes,note:row.note};
    }
    return offers;
  }catch(error){
    // Never imply Book Now works if the required booking schema is unavailable.
    if(error instanceof Prisma.PrismaClientKnownRequestError && error.code==="P2021")return {};
    throw error;
  }
}
export function displayPujaPrice(paise:number){
  return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(paise/100);
}
