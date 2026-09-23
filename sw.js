const gradiCACHE = 'v6';
const ASSETS = [
  './',
  './index.html',
  './script.js',
  './style.css',
  './manifest.json',
  './icon512.png',
  './icon192.png'
];

self.addEventListener(
  'install', ins=>{
    ins.waitUntil(
      caches.open(gradiCACHE).then(graCA=>graCA.addAll(ASSETS))
      .then(()=>self.skipWaiting()
      )//thenここまで
    );//waitUntilここまで
});//イベリスここまで

//次に古いキャッシュの削除
self.addEventListener('activate',acti=>{acti.waitUntil(
  caches.keys()
  .then(KEYS=>Promise.all(KEYS.filter(k=> k !== gradiCACHE)
  .map(k=>caches.delete(k)
  )//mapここまで
  )//Promise.allここまで
  )//caches.keys().thenここまで
  .then(()=>clients.claim()
  )//クライアントクレームを始めるthenここまで
);//waitUntilここまで
});//イベリスここまで

//中身を取ってくる
self.addEventListener('fetch',fe=>{
  if(fe.request.method !== 'GET')return;

  fe.respondWith(

    caches.match(fe.request).then(cachedRes=>{
    const fetchPromise=fetch(fe.request).then(networkRes=>{
      if(networkRes && networkRes.status===200){
        const netCopy=networkRes.clone();
        caches.open(gradiCACHE).then(graCA=>graCA.put(fe.request,netCopy));//open().then
        }//if
      return networkRes;
    }//fetch().then arrow
    )//fetch().then
    .catch(()=>{});

    return cachedRes || fetchPromise
  }//match().then arrow
  )//match().then
  )//respondWith
});//イベリスここまで