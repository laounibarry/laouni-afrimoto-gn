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

    const RESEND_KEY = process.env.RESEND_API_KEY;
    if(!RESEND_KEY) return res.status(500).json({ error: 'RESEND_API_KEY manquante dans Vercel env' });

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

    const payload = {
      from: 'Laouni AfriMoto <noreply@laouni-securite-ultime.com>',
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      text: text || '',
      html: html
    };

    console.log('[send-email] Envoi à:', payload.to, '| Sujet:', subject);

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await r.json();
    console.log('[send-email] Réponse Resend:', r.status, JSON.stringify(data));

    if(!r.ok) return res.status(r.status).json({ error: data.message || 'Erreur Resend', detail: data });
    return res.status(200).json({ ok: true, id: data.id });

  } catch(e) {
    console.error('[send-email] Exception:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
