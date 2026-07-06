// Vercel Function — envoi d'emails via Resend (avec pièces jointes PDF en base64)
// Fichier à placer dans : /api/send-email.js (à la racine du repo GitHub)

export default async function handler(req, res) {

  // ── CORS ──
  res.setHeader('Access-Control-Allow-Origin', 'https://laouni-securite-ultime.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if(req.method === 'OPTIONS') return res.status(200).end();
  if(req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { to, subject, text, html, attachments, type } = req.body;

    // Validation minimale
    if(!to || !subject) {
      return res.status(400).json({ error: 'Paramètres manquants : to et subject requis' });
    }

    const RESEND_KEY = process.env.RESEND_API_KEY;
    if(!RESEND_KEY) return res.status(500).json({ error: 'Clé Resend non configurée sur Vercel' });

    // Corps de l'email
    const htmlBody = html ||
      `<!DOCTYPE html>
      <html><head><meta charset="UTF-8">
      <style>body{font-family:Arial,sans-serif;color:#111;padding:24px;max-width:600px;margin:auto}
      h2{color:#f97316}.sep{border:none;border-top:1px solid #eee;margin:16px 0}
      .footer{font-size:11px;color:#999;margin-top:24px}</style>
      </head><body>
      <h2>🛡️ Laouni AfriMoto — Registre sécurisé · Guinée</h2>
      <hr class="sep"/>
      <pre style="font-family:Arial,sans-serif;font-size:13px;white-space:pre-wrap">${
        (text||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      }</pre>
      <hr class="sep"/>
      <div class="footer">Laouni AfriMoto · laouni-securite-ultime.com<br>
      Ne répondez pas à cet email — contactez un agent pour toute question.</div>
      </body></html>`;

    const body = {
      from: 'Laouni AfriMoto <noreply@laouni-securite-ultime.com>',
      to:   Array.isArray(to) ? to : [to],
      subject,
      text:  text  || '',
      html:  htmlBody
    };

    // Pièces jointes PDF en base64
    if(attachments && attachments.length) {
      body.attachments = attachments.map(a => ({
        filename: a.filename || 'fiche-afrimoto.pdf',
        content:  a.content   // chaîne base64 pure (sans "data:application/pdf;base64,")
      }));
    }

    const r = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await r.json();
    if(!r.ok) {
      console.error('Resend error:', data);
      return res.status(r.status).json({ error: data.message || 'Erreur Resend', detail: data });
    }
    return res.status(200).json({ ok: true, id: data.id });

  } catch(e) {
    console.error('send-email exception:', e);
    return res.status(500).json({ error: e.message });
  }
}
