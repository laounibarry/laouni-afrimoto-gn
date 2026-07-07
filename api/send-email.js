// Vercel Function — envoi d'emails via Resend
export default async function handler(req, res) {

  // CORS — accepter les deux variantes du domaine
  const origin = req.headers.origin || '';
  const allowedOrigins = [
    'https://laouni-securite-ultime.com',
    'https://www.laouni-securite-ultime.com',
    'https://laouni-afrimoto-gn.vercel.app'
  ];
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');

  if(req.method === 'OPTIONS') return res.status(200).end();
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { to, subject, text, html, attachments } = req.body;

    if(!to || !subject) {
      return res.status(400).json({ error: 'Paramètres manquants : to et subject requis' });
    }

    const RESEND_KEY = process.env.RESEND_API_KEY;
    if(!RESEND_KEY) {
      console.error('RESEND_API_KEY manquante');
      return res.status(500).json({ error: 'Clé Resend non configurée' });
    }

    const htmlBody = html || `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;color:#111;padding:24px;max-width:600px;margin:auto}
  h2{color:#f97316;border-bottom:2px solid #f97316;padding-bottom:8px}
  pre{white-space:pre-wrap;font-family:Arial,sans-serif;font-size:13px;line-height:1.6}
  .footer{font-size:11px;color:#999;margin-top:24px;border-top:1px solid #eee;padding-top:12px}
</style>
</head><body>
<h2>🛡️ Laouni AfriMoto · Registre sécurisé · Guinée</h2>
<pre>${(text||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
<div class="footer">Laouni AfriMoto · laouni-securite-ultime.com · Ne répondez pas à cet email.</div>
</body></html>`;

    const body = {
      from: 'Laouni AfriMoto <noreply@laouni-securite-ultime.com>',
      to: Array.isArray(to) ? to : [to],
      subject,
      text: text || '',
      html: htmlBody
    };

    if(attachments && attachments.length) {
      body.attachments = attachments.map(a => ({
        filename: a.filename || 'fiche-afrimoto.html',
        content: a.content
      }));
    }

    console.log('Envoi email à:', body.to, '| Sujet:', subject);

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await r.json();

    if(!r.ok) {
      console.error('Resend error', r.status, JSON.stringify(data));
      return res.status(r.status).json({ error: data.message || 'Erreur Resend', detail: data, status: r.status });
    }

    console.log('Email envoyé OK, id:', data.id);
    return res.status(200).json({ ok: true, id: data.id });

  } catch(e) {
    console.error('Exception send-email:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
