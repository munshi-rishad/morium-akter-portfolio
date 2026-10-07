const V='ma-v8',CORE=['./','index.html','assets/css/style.css','assets/js/main.js','assets/js/extra.js','assets/images/morium-akter-profile.webp','assets/fonts/figtree-latin.woff2','assets/fonts/newsreader-600.woff2'];
const STATIC=/\.(?:woff2|webp|jpg|png|svg|pdf)$/i;
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
const save=res=>{if(res&&res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res};
if(STATIC.test(new URL(r.url).pathname)){
/* fonts, images, icons: serve from cache instantly, refresh quietly */
e.respondWith(caches.match(r).then(m=>m||fetch(r).then(save)));return}
/* page, CSS, JS: newest first, cached copy if the network is slow or offline */
e.respondWith(new Promise(ok=>{let done=false;const fall=()=>caches.match(r).then(m=>m||caches.match('index.html'));
const t=setTimeout(()=>{if(!done)fall().then(m=>{if(m&&!done){done=true;ok(m)}})},3000);
fetch(r).then(save).then(res=>{if(!done){done=true;clearTimeout(t);ok(res)}}).catch(()=>{if(!done){done=true;clearTimeout(t);fall().then(ok)}})}))});
