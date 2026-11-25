import assert from "node:assert/strict";
const base="http://localhost:3000";
const db=new URL(process.env.DATABASE_URL||"postgresql://invalid/invalid");
assert.ok(process.env.CI==="true"&&["localhost","127.0.0.1"].includes(db.hostname)&&db.pathname==="/naksharix"&&db.port==="5432"&&process.env.EMAIL_PROVIDER==="disabled","DISPOSABLE_CRAWL_ONLY");
const get=path=>fetch(base+path,{redirect:"manual",cache:"no-store",signal:AbortSignal.timeout(25000)});
const sitemap=await get("/sitemap.xml");assert.equal(sitemap.status,200);
const xml=await sitemap.text(),urls=[...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(x=>new URL(x[1].replaceAll("&amp;","&")));
assert.ok(urls.length>=40&&urls.length<=1000);assert.equal(new Set(urls.map(u=>u.href)).size,urls.length);
const forbidden=/^\/(?:admin|api|dashboard|auth|login|profile|saved-reports|my-readings|payment|report-request)(?:\/|$)/;
assert.ok(urls.every(u=>u.origin===base&&!u.search&&!u.hash&&!forbidden.test(u.pathname)));
const failures=[];let cursor=0;
const attr=(tag,name)=>tag?.match(new RegExp("\\b"+name+"=['\"]([^'\"]*)['\"]","i"))?.[1]??"";
const withoutScripts=html=>html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<!--[\s\S]*?-->/g,"");
async function worker(){while(cursor<urls.length){
 const u=urls[cursor++],path=u.pathname;
 try{
  const response=await get(path),html=withoutScripts(await response.text());
  const links=[...html.matchAll(/<link\b[^>]*>/gi)].map(x=>x[0]).filter(x=>attr(x,"rel").toLowerCase()==="canonical");
  const meta=[...html.matchAll(/<meta\b[^>]*>/gi)].map(x=>x[0]);
  const robots=meta.filter(t=>attr(t,"name").toLowerCase()==="robots").map(t=>attr(t,"content")).join(" ");
  const title=html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  if(response.status!==200||!response.headers.get("content-type")?.includes("text/html"))failures.push({path,code:"HTTP_"+response.status});
  else if(links.length!==1||new URL(attr(links[0],"href"),base).href!==u.href)failures.push({path,code:"CANONICAL"});
  else if(/noindex/i.test(robots+" "+(response.headers.get("x-robots-tag")||"")))failures.push({path,code:"NOINDEX"});
  else if(!title||!meta.some(t=>attr(t,"name").toLowerCase()==="description"&&attr(t,"content").trim().length>0))failures.push({path,code:"METADATA"});
 }catch{failures.push({path,code:"NETWORK_OR_PARSE"});}
}}
await Promise.all(Array.from({length:4},worker));
console.log("ISOLATED_FULL_SITEMAP_CRAWL="+JSON.stringify({urls:urls.length,passed:urls.length-failures.length,failures,scope:"local built app, not Google index coverage or production"}));
assert.equal(failures.length,0,"Every advertised local sitemap URL must pass");
