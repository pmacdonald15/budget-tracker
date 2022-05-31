const FILES_TO_CACHE = [
    "./index.html",
    "./css/style.css",
    "./icons/icon-72X72.png",
    "./icons/icon-96X96.png",
    "./icons/icon-128X128.png",
    "./icons/icon-144X144.png",
    "./icons/icon-152X152.png",
    "./icons/icon-192X192.png",
    "./icons/icon-384X384.png",
    "./icons/icon-512X512.png",
    "./js/idb.js",
    "./js/index.js"
  ];
  
  const APP_PREFIX = 'BudgetTracker-';     
  const VERSION = 'version_01';
  const CACHE_NAME = APP_PREFIX + VERSION;
  
  self.addEventListener('install', function (e) {
    e.waitUntil(
      caches.open(CACHE_NAME).then(function (cache) {
        console.log('installing cache : ' + CACHE_NAME);
        return cache.addAll(FILES_TO_CACHE);
      })
    )
  });
  
  self.addEventListener('activate', function(e) {
    e.waitUntil(
      caches.keys().then(function(keyList) {
        let cacheKeeplist = keyList.filter(function(key) {
          return key.indexOf(APP_PREFIX);
        });
        cacheKeeplist.push(CACHE_NAME);
  
        return Promise.all(
          keyList.map(function(key, i) {
            if (cacheKeeplist.indexOf(key) === -1) {
              console.log('deleting cache : ' + keyList[i]);
              return caches.delete(keyList[i]);
            }
          })
        );
      })
    );
  });
  
  self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url)
    e.respondWith(
      caches.match(e.request).then(function (request) {
        if (request) {
          console.log('responding with cache : ' + e.request.url);
          return request;
        } else {      
          console.log('file is not cached, fetching : ' + e.request.url);
          return fetch(e.request);
        }
      })
    )
  });