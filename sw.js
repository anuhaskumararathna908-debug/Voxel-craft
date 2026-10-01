const CACHE = 'voxelcraft-v1';
const CDN_THREE = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const LOCAL = ['./','index.html','manifest.json','icon-192.png','icon-512.png','icon-maskable-512.png'];

self.addEventListener('install', e=>{
  e.waitUntil((async()=>{
    const c = await caches.open(CACHE);
    await c.addAll(LOCAL);
    // three.js: optional local copy, plus the CDN copy (opaque no-cors response is fine for <script>)
    try{ const r = await fetch('three.min.js'); if(r.ok) await c.put('three.min.js', r); }catch(_){}
    try{ const r = await fetch(CDN_THREE, {mode:'no-cors'}); await c.put(CDN_THREE, r); }catch(_){}
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e=>{
  e.waitUntil((async()=>{ for(const k of await caches.keys()) if(k!==CACHE) await caches.delete(k); await self.clients.claim(); })());
});
self.addEventListener('fetch', e=>{
  const req = e.request; if(req.method!=='GET') return;
  e.respondWith((async()=>{
    const c = await caches.open(CACHE);
    const hit = await c.match(req, {ignoreSearch:true});
    if(hit) return hit;
    try{
      const res = await fetch(req);
      if(res && (res.ok || res.type==='opaque')) c.put(req, res.clone());
      return res;
    }catch(err){
      if(req.mode==='navigate') return (await c.match('index.html')) || Response.error();
      return Response.error();
    }
  })());
});
