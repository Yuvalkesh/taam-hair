// Vercel serverless function: emails the admin whenever a new place is submitted.
// Called fire-and-forget from src/lib/supabase.ts after a successful remote insert.
// Env (set in Vercel): RESEND_API_KEY, RESEND_FROM_EMAIL, ADMIN_EMAIL.

export const config = { runtime: 'nodejs' }

interface Body {
  id?: string
  name?: string
  city?: string
  region?: string
  category?: string
  address?: string
  description?: string
  googleMapsUrl?: string
  submittedBy?: string
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' })
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL || 'hello@aimakerslab.io'
  const to = process.env.ADMIN_EMAIL || 'yuval.kesh@gmail.com'
  if (!apiKey) {
    res.status(500).json({ error: 'RESEND_API_KEY not configured' })
    return
  }

  const p: Body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  const name = p.name || 'מקום חדש'
  const adminUrl = 'https://taam-hair.vercel.app/?admin=1'
  const placeUrl = p.id ? `https://taam-hair.vercel.app/?place=${encodeURIComponent(p.id)}` : adminUrl

  const rows: Array<[string, string | undefined]> = [
    ['שם', p.name],
    ['עיר', p.city],
    ['אזור', p.region],
    ['קטגוריה', p.category],
    ['כתובת', p.address],
    ['תיאור', p.description],
    ['נשלח ע"י', p.submittedBy],
  ]
  const tableRows = rows
    .filter(([, v]) => v && String(v).trim())
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;color:#888;white-space:nowrap;vertical-align:top">${esc(
          k
        )}</td><td style="padding:6px 12px;color:#111">${esc(String(v))}</td></tr>`
    )
    .join('')

  const html = `
  <div dir="rtl" style="font-family:system-ui,Arial,sans-serif;max-width:560px;margin:0 auto">
    <h2 style="margin:0 0 4px">🍴 גם חדש נוסף לטעם העיר</h2>
    <p style="margin:0 0 16px;color:#666">${esc(name)}</p>
    <table style="border-collapse:collapse;width:100%;font-size:14px;border:1px solid #eee;border-radius:8px">${tableRows}</table>
    <p style="margin:16px 0">
      <a href="${placeUrl}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:8px">לצפייה במקום</a>
      &nbsp;
      ${p.googleMapsUrl ? `<a href="${esc(p.googleMapsUrl)}" style="display:inline-block;padding:10px 16px;background:#f3f3f3;color:#111;text-decoration:none;border-radius:8px">Google Maps</a>` : ''}
    </p>
    <p style="margin:8px 0 0;color:#aaa;font-size:12px">פאנל אדמין: <a href="${adminUrl}" style="color:#aaa">${adminUrl}</a></p>
  </div>`

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `טעם העיר <${from}>`,
        to: [to],
        subject: `🍴 גם חדש נוסף: ${name}${p.city ? ` (${p.city})` : ''}`,
        html,
      }),
    })
    if (!r.ok) {
      const txt = await r.text()
      res.status(502).json({ error: 'resend failed', detail: txt })
      return
    }
    res.status(200).json({ ok: true })
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message || e) })
  }
}
