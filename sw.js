/* Offline support. Always tries the network first, so an updated app shows up as soon as you are online;
   falls back to the last copy it saved when you are not. */
const CACHE='wardrobe-shell-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  for(const k of await caches.keys()){if(k!==CACHE)await caches.delete(k);}
  await self.clients.claim();
})()));
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
  e.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try{
      const res=await fetch(req);
      if(res&&res.ok)cache.put(req,res.clone());
      return res;
    }catch(err){
      const hit=await cache.match(req,{ignoreSearch:true})||(req.mode==='navigate'?await cache.match('./',{ignoreSearch:true})||await cache.match('./index.html'):null);
      if(hit)return hit;
      throw err;
    }
  })());
});
