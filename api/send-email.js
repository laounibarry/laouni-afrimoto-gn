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
// bouclier au trajet — montree et confirmee par le fondateur le 13/10), réduite, légèrement
// flouté, posé au PLEIN CENTRE à 10 % d'opacité — on le voit, il ne gêne
// jamais la lecture. Fabriqué une fois pour toutes (JPEG, 6 Ko) et embarqué
// ici même : la fonction ne dépend d'aucun fichier au moment d'envoyer.
const LOGO_FILIGRANE_B64 = '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';

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
  corps += 'q /GS1 gs 300 0 0 300 147.5 271 cm /Im1 Do Q\n';
  // La bande orange du haut, comme les courriers.
  corps += '0.976 0.451 0.086 rg 0 792 595 50 re f\n';
  corps += '1 1 1 rg\n';
  L(60, 812, 18, 'F2', 'Laouni AfriMoto GN');
  L(60, 798, 9, 'F1', 'Registre des vehicules - Guinee - laouni-securite-ultime.com');
  corps += '0 0 0 rg\n';

  let y = 740;
  L(60, y, 16, 'F2', att.titre || 'Attestation'); y -= 18;
  if(att.sous_titre) { L(60, y, 11, 'F1', att.sous_titre); y -= 16; }
  y -= 12;
  const lignes = Array.isArray(att.lignes) ? att.lignes.slice(0, 28) : [];
  for(const paire of lignes) {
    const lab = String((paire && paire[0]) || '');
    const val = String((paire && paire[1]) || '');
    if(!lab && !val) { y -= 9; continue; } // une paire vide aère le document
    L(60, y, 11, 'F2', lab + (lab ? ' :' : ''));
    L(225, y, 11, 'F1', val);
    y -= 19;
    if(y < 110) break;
  }
  y = Math.min(y - 14, 96);
  for(const p of String(att.pied || '').split('\n').slice(0, 3)) { L(60, y, 9, 'F1', p); y -= 12; }

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
    '<< /Type /XObject /Subtype /Image /Width 300 /Height 300 /ColorSpace /DeviceRGB '
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if(req.method === 'OPTIONS') return res.status(200).end();
  if(req.method === 'GET') return res.status(200).json({ status: 'ok', message: 'API send-email opérationnelle' });
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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
