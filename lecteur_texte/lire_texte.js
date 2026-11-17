// ════════════════════════════════════════════════════════════════════════════
//  LA LECTURE DU TEXTE D'UNE PHOTO, DANS LE NAVIGATEUR — 16/11/2026
//
//  ══ LA DEMANDE ══
//
//  « La lecture de plaque toujours pas disponible sur le site. »
//  Le téléphone lit la plaque avec le composant de Google, qui n'existe pas
//  dans un navigateur. Le site lit donc avec Tesseract.js (licence Apache 2.0,
//  voir LICENCE-tesseract.js.txt), HÉBERGÉ ICI, sur le site lui-même :
//    • tesseract.min.js, worker.min.js   — tesseract.js 5.1.1
//    • core/                              — tesseract.js-core 5.1.1 (LSTM)
//    • lang/eng.traineddata.gz            — @tesseract.js-data/eng 1.0.0
//                                           (4.0.0_best_int)
//
//  ══ ⚠️ LA PHOTO NE SORT PAS DU TÉLÉPHONE ══
//
//  La lecture se fait DANS le navigateur. Aucune image n'est envoyée nulle
//  part — c'est la règle du projet, la même que sur le téléphone. Seuls les
//  fichiers du lecteur sont téléchargés, depuis ce site, et une seule fois :
//  le navigateur les garde ensuite.
//
//  ══ ⚠️ RIEN N'EST CHARGÉ TANT QU'ON N'APPUIE PAS ══
//
//  Environ 7 Mo, sur un réseau 3G. On ne les impose à personne qui ne
//  photographie pas de plaque : tout part au premier appel.
//
//  ══ ⚠️ NE LÈVE JAMAIS ══
//
//  « afriLireTexte(url) » rend le texte lu, ou null. Une panne (fichier
//  absent, réseau coupé, vieux navigateur) rend null : l'écran dit alors
//  « tapez la plaque », comme avant.
// ════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  var base = new URL('lecteur_texte/', document.baseURI).href;
  var chargement = null;
  var lecteur = null;

  function chargerLaBibliotheque() {
    if (window.Tesseract) return Promise.resolve();
    if (chargement) return chargement;
    chargement = new Promise(function (ok, ko) {
      var s = document.createElement('script');
      s.src = base + 'tesseract.min.js';
      s.async = true;
      s.onload = function () { ok(); };
      s.onerror = function () {
        chargement = null;
        ko(new Error('lecteur de texte introuvable'));
      };
      document.head.appendChild(s);
    });
    return chargement;
  }

  function obtenirLeLecteur() {
    if (lecteur) return lecteur;
    lecteur = chargerLaBibliotheque().then(function () {
      return window.Tesseract.createWorker('eng', 1, {
        workerPath: base + 'worker.min.js',
        corePath: base + 'core',
        langPath: base + 'lang',
        gzip: true,
        // Le lecteur vient du même site : pas besoin de le déguiser.
        workerBlobURL: false,
      });
    }).then(function (w) {
      // ⚠️ LE MODE DE LECTURE NORMAL (« 3 »), PAS LE « TEXTE ÉPARS » (« 11 ») :
      // essayé le 16/11 sur des plaques dessinées, le mode épars ne lisait
      // RIEN, quand le mode normal lisait « RC 1311 SL », « AB-0123 »,
      // « RC-123-AB » et « EL 764 A », même penchées et floues.
      //
      // Et seulement les caractères d'une plaque : sans cette liste, le « SL »
      // d'une plaque mal cadrée devenait « § ». Ce lecteur ne sert sur le site
      // qu'aux plaques (la pièce d'identité n'y est pas lue).
      return w.setParameters({
        tessedit_pageseg_mode: '3',
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789- ',
      }).then(function () {
        return w;
      });
    });
    // Une panne au chargement ne doit pas bloquer l'essai suivant.
    lecteur.catch(function () { lecteur = null; });
    return lecteur;
  }

  window.afriLireTexte = function (url) {
    return obtenirLeLecteur()
      .then(function (w) { return w.recognize(url); })
      .then(function (r) {
        var t = (r && r.data && r.data.text) ? String(r.data.text).trim() : '';
        return t.length ? t : null;
      })
      .catch(function () { return null; });
  };
})();
