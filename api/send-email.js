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

export default async function handler(req, res) {
  // CORS complet
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if(req.method === 'OPTIONS') return res.status(200).end();
  if(req.method === 'GET') return res.status(200).json({ status: 'ok', message: 'API send-email opérationnelle' });
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { to, subject, text } = req.body || {};
    if(!to || !subject) return res.status(400).json({ error: 'to et subject requis' });

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
            html: html
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
