// ════════════════════════════════════════════════════════════════════════════
//  L'ANCIEN SERVICE WORKER SE RETIRE — 01/11/2026
//
//  Le site n'est plus une page écrite à la main : c'est l'application Flutter.
//  Ce fichier-ci servait l'ancien site depuis la mémoire du navigateur, et
//  c'est précisément le piège : quelqu'un qui a déjà ouvert AfriMoto a ce
//  programme installé chez lui. Sans rien faire, il continuerait de recevoir
//  l'ANCIEN site pour toujours — jamais le nouveau, et sans comprendre
//  pourquoi.
//
//  Un navigateur revérifie TOUJOURS ce fichier-ci au moment où l'on navigue.
//  Il reçoit donc cette version, qui :
//    1. vide tout ce qui avait été gardé en mémoire ;
//    2. se désinscrit elle-même ;
//    3. recharge les fenêtres ouvertes, pour que le nouveau site paraisse
//       tout de suite au lieu d'attendre la visite suivante.
//
//  Flutter installe ensuite le sien (flutter_service_worker.js), qui garde en
//  mémoire les quelques mégaoctets du moteur graphique : c'est lui qui rend
//  les ouvertures suivantes rapides.
//
//  ⚠️ NE PAS SUPPRIMER CE FICHIER. Supprimé, il répondrait « introuvable », et
//  certains navigateurs garderaient l'ancien programme actif plus longtemps.
//  Il doit répondre, et dire de se retirer.
// ════════════════════════════════════════════════════════════════════════════

self.addEventListener('install', () => {
  // On ne fait pas la queue derrière l'ancien : on prend la main tout de suite.
  self.skipWaiting();
});

self.addEventListener('activate', (evenement) => {
  evenement.waitUntil((async () => {
    try {
      const noms = await caches.keys();
      await Promise.all(noms.map((n) => caches.delete(n)));
    } catch (e) {
      // Un cache qu'on n'arrive pas à vider ne doit pas empêcher la suite.
    }
    try {
      await self.registration.unregister();
    } catch (e) {}
    try {
      const fenetres = await self.clients.matchAll({ type: 'window' });
      for (const f of fenetres) {
        // « navigate » recharge en passant par le réseau : la fenêtre ouverte
        // reçoit le nouveau site sans que personne ait à y penser.
        f.navigate(f.url);
      }
    } catch (e) {}
  })());
});

// Tant qu'il est encore là, il ne répond plus rien depuis la mémoire : tout
// repart au réseau. Sans cette ligne, la page servie pendant la désinscription
// serait encore l'ancienne.
self.addEventListener('fetch', () => {});
