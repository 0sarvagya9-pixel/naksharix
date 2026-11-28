import {NextRequest} from "next/server";
import {z} from "zod";
import {handleApiError,ok} from "@/lib/api";
import {checkRateLimit} from "@/lib/rate-limit";
import {searchPlaceDirectory,LOCATION_DIRECTORY_STATS} from "@/lib/location/place-directory";
const schema=z.string().trim().min(2).max(120);
export async function GET(request:NextRequest){
 try{
  const limited=await checkRateLimit({request,key:"location-search",limit:80,windowSeconds:60*10});if(limited)return limited;
  const parsed=schema.safeParse(request.nextUrl.searchParams.get("q")??"");
  const response=ok({suggestions:parsed.success?searchPlaceDirectory(parsed.data):[],source:LOCATION_DIRECTORY_STATS.source,attribution:"GeoNames, CC BY 4.0",manualCoordinatesSupported:true});
  response.headers.set("Cache-Control","private, no-store");return response;
 }catch(error){return handleApiError(error);}
}
