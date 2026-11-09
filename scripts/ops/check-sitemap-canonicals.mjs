import assert from "node:assert/strict";
const origin = "https://www.naksharix.com";
const sitemapResponse=await fetch(origin+"/sitemap.xml",{cache:"no-store",redirect:"manual",signal:AbortSignal.timeout(20000)});
assert.equal(sitemapResponse.status,200,"Live sitemap must be HTTP 200");
assert.ok(/xml/i.test(sitemapResponse.headers.get("content-type")||""),"Sitemap must be XML");
const xml=await sitemapResponse.text();
const urls=[...xml.matchAll(/<loc>\s*(https:\/\/[^<\s]+)\s*<\/loc>/g)].map(m=>m[1].replaceAll("&amp;","&"));
assert.ok(urls.length>=40&&urls.length<=2000,"Unexpected sitemap loc count");
assert.equal(urls.length,new Set(urls).size,"Duplicate sitemap loc");
assert.ok(urls.every(u=>u===origin||u.startsWith(origin+"/")),"Noncanonical sitemap host");
let i=0;const failures=[];
function attr(tag,key){
  const rx=new RegExp(key+"\\s*=\\s*['\\\"]([^'\\\"]+)['\\\"]","i");
  return tag?.match(rx)?.[1]||null;
}
function findTag(html,tag,attribute,value) {
  return [...html.matchAll(new RegExp("<"+tag+"\\b[^>]*>","gi"))].map(m=>m[0]).find(t=>attr(t,attribute)?.toLowerCase()===value);
}
async function worker(){
  while(i<urls.length){const url=urls[i++];
    try{const r=await fetch(url,{redirect:"manual",cache:"no-store",signal:AbortSignal.timeout(20000)});
      if(r.status!==200){failures.push({url,code:"HTTP_"+r.status});continue;}
      if(!/html/i.test(r.headers.get("content-type")||"")){failures.push({url,code:"NOT_HTML"});continue;}
      const html=(await r.text()).slice(0,550000);
      const canonical=attr(findTag(html,"link","rel","canonical"),"href");
      const expected=url.endsWith("/")?url.slice(0,-1):url;
      if(canonical!==expected&&!(url===origin&&canonical===origin+"/"))failures.push({url,code:"CANONICAL_MISMATCH"});
      const robots=attr(findTag(html,"meta","name","robots"),"content")||"";
      if(/noindex/i.test(robots+" "+(r.headers.get("x-robots-tag")||"")))failures.push({url,code:"SITEMAP_NOINDEX"});
    }catch(e){failures.push({url,code:"NETWORK_"+(e?.name||"UNKNOWN")});}
  }
}
await Promise.all(Array.from({length:8},worker));
console.log("NAKSHARIX_FULL_SITEMAP_CRAWL="+JSON.stringify({urls:urls.length,failures:failures.length,details:failures.slice(0,12)}));
if(failures.length)process.exitCode=1;
