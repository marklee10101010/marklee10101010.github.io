/* 별빛 학습 퀘스트 3D - 오프라인 서비스워커 */
const CACHE='starquest-v3.7.2';
const CORE=[
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
];
self.addEventListener('message', e=>{
  if(e.data && e.data.type==='SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch', e=>{
  const req=e.request;
  if(req.method!=='GET') return;
  /* 페이지 이동: 네트워크 우선(최신 버전), 실패 시 캐시(오프라인) */
  if(req.mode==='navigate'){
    e.respondWith(
      fetch(req).then(res=>{
        const cl=res.clone();
        caches.open(CACHE).then(c=>c.put('./index.html', cl));
        return res;
      }).catch(()=>caches.match('./index.html'))
    );
    return;
  }
  /* 그 외: 캐시 우선, 없으면 네트워크 후 캐시 */
  e.respondWith(
    caches.match(req).then(hit=>hit || fetch(req).then(res=>{
      const cl=res.clone();
      caches.open(CACHE).then(c=>c.put(req, cl));
      return res;
    }))
  );
});
