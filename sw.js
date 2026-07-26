/* Laouni AfriMoto GN - service worker
   Strategie RESEAU D'ABORD : l'utilisateur voit TOUJOURS la derniere version
   du site. Le cache ne sert que de secours quand il n'y a pas de connexion. */
const CACHE = 'afrimoto-v1';

self.addEventListener('install', function (e) {
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
                             .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  // On ne touche pas aux appels Supabase ni aux domaines externes
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        return hit || caches.match('/');
      });
    })
  );
});


/* ══════════════════════════════════════════════════════════
   v9.336 — NOTIFICATIONS PUSH
   Android reveille ce service worker meme application fermee.
   ══════════════════════════════════════════════════════════ */
self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = {}; }
  var titre = d.titre || 'AfriMoto GN';
  var options = {
    body: d.message || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [300, 120, 300, 120, 300],
    tag: d.tag || 'afrimoto',
    renotify: true,
    requireInteraction: true,
    data: { url: d.url || '/' }
  };
  e.waitUntil(self.registration.showNotification(titre, options));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var cible = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (liste) {
      for (var i = 0; i < liste.length; i++) {
        if ('focus' in liste[i]) {
          if (liste[i].navigate) { try { liste[i].navigate(cible); } catch (err) {} }
          return liste[i].focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(cible);
    })
  );
});
