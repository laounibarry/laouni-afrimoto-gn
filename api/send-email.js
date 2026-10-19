// ════════════════════════════════════════════════════════════════════════════
//  /api/send-email — LA SEULE PORTE DE SORTIE DES COURRIELS
//
//  Tout passe ici : les courriers de validation envoyés par la base, les
//  récupérations de compte du site, et le « Nous écrire » de l'application.
//
//  ══ 11/10/2026 — LE SECOURS EMAILJS, CÔTÉ SERVEUR AUSSI ══
//
//  Depuis des semaines, Resend refusait tout : « 401 API key is invalid »
//  (prouvé en lisant net._http_response, fichier SQL 114). Le SITE, lui,
//  retombait sur EmailJS dans le navigateur et ses mails partaient — mais les
//  courriers de VALIDATION partent de la base, arrivent ici, et ici il n'y
//  avait pas de secours : Resend ou rien. Résultat : « le mail ne part pas
//  quand la validation », signalé trois fois.
//
//  Décision du fondateur, le 11/10 : les validations doivent partir par le
//  canal qui marche. Désormais :
//
//    1. RESEND D'ABORD — meilleur expéditeur (noreply@laouni-securite-ultime.com,
//       notre domaine), 3 000 courriels/mois. Le jour où sa clé est réparée,
//       il reprend la main sans qu'on touche à rien.
//    2. EMAILJS EN SECOURS — le même compte que le site, le même modèle.
//       Prouvé le 11/10 : un essai réel envoyé d'ici même est arrivé dans sa
//       boîte. ⚠️ 200 courriels/mois seulement, et l'expéditeur est le Gmail
//       du compte : c'est une béquille, pas une maison.
//
//  La réponse dit TOUJOURS par où le courriel est parti (« via »), pour que
//  net._http_response raconte la vérité — on a assez souffert d'un journal
//  qui disait « parti » sans savoir.
//
//  ⚠️ Les identifiants EmailJS ci-dessous sont les mêmes que ceux écrits dans
//  la page du site : ils sont déjà publics par nature (clé « publique »).
//  Rien de secret ne s'ajoute ici.
// ════════════════════════════════════════════════════════════════════════════

const EMAILJS = {
  serviceId: 'service_0rvox9x',
  templateId: 'template_6uq04fr', // variables : to_email, titre, contenu
  publicKey: 'awxu35zCxrmJzkyOZ',
  // EmailJS n'accepte que les appels « de navigateur » : il vérifie l'origine.
  // On se présente comme le site — c'est le nôtre.
  origine: 'https://www.laouni-securite-ultime.com',
};

// ══ 13/10/2026 — L'ATTESTATION, FABRIQUÉE ICI MÊME ══
//
// Décision du fondateur : « le mail de validation doit tout contenir sauf le
// QR code et doit partir direct avec le PDF dans le même mail, dès
// validation ». La base ne sait pas fabriquer un PDF : elle envoie les CHAMPS
// (champ « attestation » : { titre, sous_titre?, lignes: [[libelle, valeur]…],
// pied?, fichier? }), et c'est cette fonction qui dessine le document — une
// page A4, l'en-tête AfriMoto, les champs, le pied. Aucune bibliothèque :
// le PDF est écrit à la main, offsets exacts, lisible par tout lecteur.
//
// ⚠️ Le QR et le code d'accès ne figurent JAMAIS ici : celui qui appelle ne
// les envoie pas, et ce dessinateur ne saurait pas les dessiner.
//
// Le filigrane : L ICONE DU TELEPHONE (afrimoto-flutter/assets/logo.png, le
// bouclier au trajet, GARDE SEUL : le carre orange du fond faisait un vilain
// rectangle — on ne garde que le dessin blanc, devenu trait gris), légèrement
// flouté, posé au PLEIN CENTRE à 10 % d'opacité — on le voit, il ne gêne
// jamais la lecture. Fabriqué une fois pour toutes (JPEG, 6 Ko) et embarqué
// ici même : la fonction ne dépend d'aucun fichier au moment d'envoyer.
const LOGO_FILIGRANE_B64 = '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b8FQXIaWz+STrigDibvTL/SpsujoR/EKANXSfGV7YkJOTIg9aAOz07xXp18APMCOexoAdqPijT7BCfNDt6CgDitW8ZXt8SkBMaH0oAyrTTL/AFWbKI7k/wARoA7bRPBUFsFlvPnk64oA6uOJIkCRqFA7CgB9ABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQAUAFABQBBc2dvdoUmjVgfUUAcnq/gWKXdJZHa392gDjbzSL/TpSHicY7igBbPSb/UpQqRuc9zQB2OkeBYotsl6dzf3aAOstrO3tECQxqoHoKAJ6ACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAimtoZxiWNW+ooAIbaGAYijVfoKAJaACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKACgAoAKAP//Z';

function pdfAttestation(att) {
  // Texte en WinAnsi (latin1) : les accents français passent, le reste est
  // retiré, et ( ) \ sont échappés — sinon le PDF se casse sur un nom.
  const t = (s) => String(s == null ? '' : s)
    .replace(/[—–]/g, '-').replace(/[’‘]/g, "'")
    .replace(/[«»“”]/g, '"')
    .replace(/[^\x20-\x7EÀ-ÿ©°]/g, '')
    .replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

  let corps = '';
  const L = (x, y, taille, police, s) => {
    corps += 'BT /' + police + ' ' + taille + ' Tf ' + x + ' ' + y + ' Td (' + t(s) + ') Tj ET\n';
  };
  // Le filigrane D'ABORD : il se dessine sous tout le reste, au plein centre
  // de la page (A4 : 595×842), à 10 % d'opacité via l'état graphique GS1.
  const logo = Buffer.from(LOGO_FILIGRANE_B64, 'base64');
  corps += 'q /GS1 gs 320 0 0 320 137.5 261 cm /Im1 Do Q\n';
  // La bande orange du haut, comme les courriers.
  corps += '0.976 0.451 0.086 rg 0 792 595 50 re f\n';
  corps += '1 1 1 rg\n';
  L(60, 812, 18, 'F2', 'Laouni AfriMoto GN');
  L(60, 798, 9, 'F1', 'Registre des vehicules - Guinee - laouni-securite-ultime.com');
  corps += '0 0 0 rg\n';

  let y = 740;
  L(60, y, 18, 'F2', att.titre || 'Attestation'); y -= 20;
  if(att.sous_titre) { L(60, y, 12.5, 'F1', att.sous_titre); y -= 17; }
  y -= 12;
  // 13/10 — demande du fondateur : la police des lignes en plus grand (13 au
  // lieu de 11, interligne 23) ; la page A4 tient toujours 24 lignes pleines.
  const lignes = Array.isArray(att.lignes) ? att.lignes.slice(0, 28) : [];
  for(const paire of lignes) {
    const lab = String((paire && paire[0]) || '');
    const val = String((paire && paire[1]) || '');
    if(!lab && !val) { y -= 11; continue; } // une paire vide aère le document
    L(60, y, 13, 'F2', lab + (lab ? ' :' : ''));
    L(240, y, 13, 'F1', val);
    y -= 23;
    if(y < 110) break;
  }
  y = Math.min(y - 14, 96);
  for(const p of String(att.pied || '').split('\n').slice(0, 3)) { L(60, y, 10, 'F1', p); y -= 13; }

  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources '
      + '<< /Font << /F1 4 0 R /F2 6 0 R >> /XObject << /Im1 7 0 R >> '
      + '/ExtGState << /GS1 8 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Length ' + Buffer.byteLength(corps, 'latin1') + ' >>\nstream\n' + corps + '\nendstream',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    // L'image du filigrane : un JPEG embarqué tel quel (DCTDecode).
    '<< /Type /XObject /Subtype /Image /Width 320 /Height 320 /ColorSpace /DeviceRGB '
      + '/BitsPerComponent 8 /Filter /DCTDecode /Length ' + logo.length + ' >>\n'
      + 'stream\n' + logo.toString('latin1') + '\nendstream',
    // L'état graphique du filigrane : 10 % d'opacité, lecture intacte.
    '<< /Type /ExtGState /ca 0.1 /CA 0.1 >>',
  ];
  let pdf = '%PDF-1.4\n'; const offs = [];
  objs.forEach((o, i) => {
    offs.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += (i + 1) + ' 0 obj\n' + o + '\nendobj\n';
  });
  const xref = Buffer.byteLength(pdf, 'latin1');
  pdf += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n'
    + offs.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('')
    + 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF';
  return Buffer.from(pdf, 'latin1').toString('base64');
}

export default async function handler(req, res) {
  // CORS complet
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-afrimoto-cle');

  if(req.method === 'OPTIONS') return res.status(200).end();
  if(req.method === 'GET') return res.status(200).json({ status: 'ok', message: 'API send-email opérationnelle' });
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // ══ 19/10/2026 — LA PORTE N'EST PLUS OUVERTE À N'IMPORTE QUI ══
  //
  // Trouvé par l'audit : cette adresse acceptait tout appelant. Quelqu'un
  // pouvait vider le quota (200 courriels par mois en secours) ou écrire au
  // nom du domaine. Désormais la base envoie une clé dans l'en-tête
  // « x-afrimoto-cle » (SQL 151), et elle doit être la même que MAIL_SECRET
  // dans les variables d'environnement Vercel.
  //
  // ⚠️ TOLÉRANT TANT QUE LA VARIABLE N'EST PAS POSÉE : sans MAIL_SECRET côté
  // Vercel, rien ne change — sinon le jour du déploiement, tous les courriels
  // tomberaient avant que le fondateur ait eu le temps de coller la clé.
  // Dès qu'elle est posée, tout appel sans la bonne clé est refusé.
  const CLE_ATTENDUE = (process.env.MAIL_SECRET || '').trim();
  if(CLE_ATTENDUE) {
    const CLE_RECUE = String(req.headers['x-afrimoto-cle'] || '').trim();
    if(CLE_RECUE !== CLE_ATTENDUE) {
      return res.status(401).json({ error: 'cle manquante ou invalide' });
    }
  }

  try {
    const { to, subject, text, pieces, attestation } = req.body || {};
    if(!to || !subject) return res.status(400).json({ error: 'to et subject requis' });

    // ══ 13/10/2026 — LES PIÈCES JOINTES (PDF), PAR RESEND SEULEMENT ══
    //
    // Demande du fondateur : « envoi des mails contenant des PDF ». Le champ
    // « pieces » : [{ nom: 'attestation.pdf', contenu_b64: '...', type?: 'application/pdf' }].
    //
    //  · 5 pièces au plus, ~3 Mo en tout : au-delà, Vercel coupe la requête
    //    avant même qu'elle n'arrive ici (sa limite est ~4,5 Mo) ;
    //  · le nom est nettoyé : pas de chemin, pas de caractères de contrôle ;
    //  · ⚠️ PAS DE SECOURS EmailJS pour un courrier à pièces : la béquille ne
    //    sait pas les porter, et un courrier qui annonce un document mais
    //    arrive sans lui est pire qu'un échec franc — on répond l'échec, avec
    //    la raison, et l'appelant réessaie.
    let attachments = [];
    if(pieces != null) {
      if(!Array.isArray(pieces) || pieces.length === 0 || pieces.length > 5) {
        return res.status(400).json({ error: 'pieces : un tableau de 1 à 5 documents' });
      }
      let totalB64 = 0;
      for(const p of pieces) {
        const nom = String((p && p.nom) || '').replace(/[\\/ -]/g, '').trim();
        const b64 = String((p && p.contenu_b64) || '').replace(/\s+/g, '');
        if(!nom || !b64) return res.status(400).json({ error: 'chaque piece exige nom et contenu_b64' });
        if(!/^[A-Za-z0-9+/=]+$/.test(b64)) return res.status(400).json({ error: 'contenu_b64 n est pas du base64 : ' + nom });
        totalB64 += b64.length;
        if(totalB64 > 4 * 1024 * 1024) return res.status(400).json({ error: 'pieces trop lourdes : ~3 Mo au plus par courrier' });
        attachments.push({ filename: nom, content: b64, content_type: String((p && p.type) || 'application/pdf') });
      }
    }

    // L'attestation : la base envoie les champs, le PDF se dessine ici.
    if(attestation != null) {
      if(typeof attestation !== 'object' || Array.isArray(attestation)) {
        return res.status(400).json({ error: 'attestation : un objet { titre, lignes, ... }' });
      }
      const fichier = String(attestation.fichier || 'attestation-afrimoto.pdf')
        .replace(/[\\/ -]/g, '').trim() || 'attestation-afrimoto.pdf';
      attachments.push({ filename: fichier, content: pdfAttestation(attestation), content_type: 'application/pdf' });
    }

    // ── 1. RESEND D'ABORD ───────────────────────────────────────────────────
    let pourquoiResend = '';
    const RESEND_KEY = process.env.RESEND_API_KEY;
    if(!RESEND_KEY) {
      pourquoiResend = 'RESEND_API_KEY manquante dans Vercel env';
    } else {
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
        body{font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;color:#111}
        .header{background:linear-gradient(135deg,#f97316,#ea6c00);padding:20px;border-radius:12px;margin-bottom:20px;text-align:center}
        .header h1{color:#fff;margin:0;font-size:20px}
        .content{background:#f9f9f9;padding:16px;border-radius:8px;white-space:pre-wrap;font-size:14px;line-height:1.6}
        .footer{font-size:11px;color:#999;margin-top:20px;text-align:center}
      </style></head><body>
        <div class="header"><h1>🛡️ Laouni AfriMoto GN</h1><div style="color:rgba(255,255,255,.8);font-size:12px">Registre sécurisé · Guinée</div></div>
        <div class="content">${(text||'').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')}</div>
        <div class="footer">Laouni AfriMoto · laouni-securite-ultime.com</div>
      </body></html>`;

      try {
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Laouni AfriMoto <noreply@laouni-securite-ultime.com>',
            to: Array.isArray(to) ? to : [to],
            subject: subject,
            text: text || '',
            html: html,
            // Les documents joints, s'il y en a (voir le bloc « pieces »).
            ...(attachments.length ? { attachments } : {})
          })
        });
        const data = await r.json();
        console.log('[send-email] Réponse Resend:', r.status, JSON.stringify(data));
        if(r.ok) return res.status(200).json({ ok: true, via: 'resend', id: data.id });
        pourquoiResend = `${r.status} ${data.message || 'Erreur Resend'}`;
      } catch(e) {
        pourquoiResend = e.message || 'exception Resend';
      }
    }

    // Un courrier à pièces jointes ne part JAMAIS amputé par la béquille :
    // l'échec est franc, nommé, et l'appelant réessaie quand Resend revit.
    if(attachments.length) {
      return res.status(502).json({
        error: 'Resend a refusé, et un courrier à pièces jointes ne part pas sans elles',
        resend: pourquoiResend,
      });
    }

    // ── 2. EMAILJS EN SECOURS ───────────────────────────────────────────────
    //
    // ⚠️ Le modèle n'accepte qu'UNE adresse : si plusieurs arrivent, on prend
    // la première. Aujourd'hui tous les appelants n'en envoient qu'une.
    console.warn('[send-email] Resend a échoué (' + pourquoiResend + ') — secours EmailJS');
    const premiere = Array.isArray(to) ? String(to[0] || '') : String(to);
    try {
      const r2 = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': EMAILJS.origine,
          'Referer': EMAILJS.origine + '/',
        },
        body: JSON.stringify({
          service_id: EMAILJS.serviceId,
          template_id: EMAILJS.templateId,
          user_id: EMAILJS.publicKey,
          template_params: {
            to_email: premiere,
            titre: String(subject),
            contenu: String(text || ''),
          },
        }),
      });
      const corps = await r2.text();
      console.log('[send-email] Réponse EmailJS:', r2.status, corps.slice(0, 200));
      if(r2.ok) {
        // « secours: true » : le journal saura que Resend est toujours malade.
        return res.status(200).json({ ok: true, via: 'emailjs', secours: true, resend: pourquoiResend });
      }
      return res.status(502).json({
        error: 'Resend et EmailJS ont tous les deux refusé',
        resend: pourquoiResend,
        emailjs: `${r2.status} ${corps.slice(0, 160)}`,
      });
    } catch(e2) {
      return res.status(502).json({
        error: 'Resend et EmailJS ont tous les deux échoué',
        resend: pourquoiResend,
        emailjs: e2.message || 'exception EmailJS',
      });
    }

  } catch(e) {
    console.error('[send-email] Exception:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
