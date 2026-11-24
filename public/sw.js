const CACHE_NAME = "naksharix-v3";
const OFFLINE_URL = "/offline";
const PRECACHE_URLS = ["/", OFFLINE_URL, "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
      self.clients.claim()
    ])
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || request.mode !== "navigate") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(OFFLINE_URL);
      return cached || Response.error();
    })
  );
});

// Payloadless account-update signals. Never show private birth, payment, order,
// support or practitioner details on a lock screen. No marketing pushes.
self.addEventListener("push",(event)=>{
 event.waitUntil(self.registration.showNotification("Naksharix account update",{
  body:"Sign in to check your account for an update.",
  tag:"naksharix-account-update",renotify:false,
  icon:"/images/naksharix-final-logo-symbol.png"
 }));
});
self.addEventListener("notificationclick",(event)=>{
 event.notification.close();
 const target=new URL("/dashboard",self.location.origin).href;
 event.waitUntil((async()=>{
  const windows=await self.clients.matchAll({type:"window",includeUncontrolled:true});
  const existing=windows.find(client=>new URL(client.url).origin===self.location.origin&&new URL(client.url).pathname==="/dashboard");
  if(existing){await existing.focus();return;}
  await self.clients.openWindow(target);
 })());
});
