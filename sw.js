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

  // v9.354 : adresse COMPLETE. Avec une adresse relative (« / »), Android ne
  // rattache pas toujours la notification a l'application installee et ouvre
  // le navigateur a la place.
  var brut = (e.notification.data && e.notification.data.url) || '/';
  var cible;
  try { cible = new URL(brut, self.location.origin).href; }
  catch (err) { cible = self.location.origin + '/'; }

  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (liste) {
        // 1) Une fenetre de l'application est deja ouverte : on la ramene devant
        for (var i = 0; i < liste.length; i++) {
          var c = liste[i];
          if (c.url && c.url.indexOf(self.location.origin) === 0 && 'focus' in c) {
            return c.focus().then(function (fen) {
              // On ne recharge que si l'on n'est pas deja au bon endroit,
              // pour ne pas perdre ce que l'utilisateur avait a l'ecran.
              if (fen && fen.navigate && fen.url !== cible) {
                return fen.navigate(cible).catch(function () { return fen; });
              }
              return fen;
            }).catch(function () {
              return self.clients.openWindow ? self.clients.openWindow(cible) : null;
            });
          }
        }
        // 2) Application fermee : on l'ouvre
        if (self.clients.openWindow) {
          return self.clients.openWindow(cible).catch(function () {
            return self.clients.openWindow(self.location.origin + '/');
          });
        }
      })
      .catch(function () {
        if (self.clients.openWindow) return self.clients.openWindow(self.location.origin + '/');
      })
  );
});
