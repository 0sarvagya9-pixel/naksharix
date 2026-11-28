import shard0 from "./data/cities-0.json";
import shard1 from "./data/cities-1.json";
import shard2 from "./data/cities-2.json";
import shard3 from "./data/cities-3.json";
import shard4 from "./data/cities-4.json";
import shard5 from "./data/cities-5.json";
import shard6 from "./data/cities-6.json";
import shard7 from "./data/cities-7.json";
type Row=[number,string,string,number,number,string,string,string,number];
export type PlaceSuggestion={displayName:string;city:string;state?:string;country:string;latitude:number;longitude:number;timezone:string;timezoneOffset?:number;source:"built-in"|"geonames";geonameId?:number;regionCode?:string};
const fallbackPlaces = [
  { displayName: "Delhi, India", city: "Delhi", state: "Delhi", country: "India", latitude: 28.6139, longitude: 77.209, timezone: "Asia/Kolkata", timezoneOffset: 5.5 },
  { displayName: "Mumbai, Maharashtra, India", city: "Mumbai", state: "Maharashtra", country: "India", latitude: 19.076, longitude: 72.8777, timezone: "Asia/Kolkata", timezoneOffset: 5.5 },
  { displayName: "Jaipur, Rajasthan, India", city: "Jaipur", state: "Rajasthan", country: "India", latitude: 26.9124, longitude: 75.7873, timezone: "Asia/Kolkata", timezoneOffset: 5.5 },
  { displayName: "Tikamgarh, Madhya Pradesh, India", city: "Tikamgarh", state: "Madhya Pradesh", country: "India", latitude: 24.75, longitude: 79.0, timezone: "Asia/Kolkata", timezoneOffset: 5.5 },
  { displayName: "Gadarwara, Madhya Pradesh, India", city: "Gadarwara", state: "Madhya Pradesh", country: "India", latitude: 22.9235, longitude: 78.7849, timezone: "Asia/Kolkata", timezoneOffset: 5.5 },
  { displayName: "London, United Kingdom", city: "London", state: "England", country: "United Kingdom", latitude: 51.5072, longitude: -0.1276, timezone: "Europe/London", timezoneOffset: 0 },
  { displayName: "New York, United States", city: "New York", state: "New York", country: "United States", latitude: 40.7128, longitude: -74.006, timezone: "America/New_York", timezoneOffset: -5 }
];


const rows:Row[]=[...(shard0 as unknown as Row[]),...(shard1 as unknown as Row[]),...(shard2 as unknown as Row[]),...(shard3 as unknown as Row[]),...(shard4 as unknown as Row[]),...(shard5 as unknown as Row[]),...(shard6 as unknown as Row[]),...(shard7 as unknown as Row[])];
const names=new Intl.DisplayNames(["en"],{type:"region"}),cache=new Map<string,string>();
const norm=(v:string)=>v.normalize("NFKD").replace(/\p{M}/gu,"").toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim();
function countryName(code:string){let n=cache.get(code);if(!n){try{n=names.of(code)||code}catch{n=code}cache.set(code,n)}return n}
const indexed=rows.map(row=>({row,primary:norm(row[1]),ascii:norm(row[2]),country:norm(countryName(row[5]))}));
export const LOCATION_DIRECTORY_STATS={rows:rows.length,countries:244,source:"GeoNames cities15000",license:"CC BY 4.0"};
export function searchPlaceDirectory(raw:string):PlaceSuggestion[]{
 const q=norm(raw);if(q.length<2||q.length>120)return [];
 const tokens=q.split(/\s+/);
 const local=fallbackPlaces.filter(x=>tokens.every(t=>norm(x.displayName).includes(t))).map(x=>({...x,source:"built-in" as const}));
 const matches:{row:Row;rank:number}[]=[];
 for(const x of indexed){
  if(!tokens.every(t=>x.primary.includes(t)||x.ascii.includes(t)||x.country.includes(t)||x.row[5].toLowerCase()===t||x.row[6].toLowerCase()===t))continue;
  matches.push({row:x.row,rank:x.primary===q||x.ascii===q?0:x.primary.startsWith(q)||x.ascii.startsWith(q)?1:2});
 }
 matches.sort((a,b)=>a.rank-b.rank||b.row[8]-a.row[8]||a.row[0]-b.row[0]);
 const out:PlaceSuggestion[]=[...local];
 for(const {row:r} of matches){
  if(out.length>=8)break;
  const country=countryName(r[5]);
  if(out.some(p=>norm(p.city)===norm(r[1])&&p.country===country&&Math.abs(p.latitude-r[3])<.5&&Math.abs(p.longitude-r[4])<.5))continue;
  out.push({displayName:r[1]+", "+country,city:r[1],country,latitude:r[3],longitude:r[4],timezone:r[7],...(r[5]==="IN"?{timezoneOffset:5.5}:{}),regionCode:r[6],geonameId:r[0],source:"geonames"});
 }
 return out.slice(0,8);
}
