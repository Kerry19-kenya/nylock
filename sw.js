const V='greylock-v5';
const CORE=['./','index.html','manifest.json','icon.svg','icon-192.png','icon-512.png'];
const FBJS=['app','auth','firestore'].map(n=>'https://www.gstatic.com/firebasejs/10.12.2/firebase-'+n+'.js');
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(async c=>{await c.addAll(CORE);await Promise.allSettled(FBJS.map(u=>c.add(u)))}).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  // only our own files and the Firebase JS files; leave sign-in and database traffic alone
  if(!(u.origin===location.origin||u.hostname==='www.gstatic.com'))return;
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put('index.html',cp));return res}).catch(()=>caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(hit=>{
    const net=fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>hit);
    return hit||net;
  }));
});
