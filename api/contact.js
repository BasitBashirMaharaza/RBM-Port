const RECIPIENT = 'basitr82@gmail.com';
const requests = new Map();
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

function reply(res, status, data) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(data);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return reply(res, 405, { ok: false, error: 'Method not allowed.' });
  }
  if (!req.headers['content-type']?.toLowerCase().startsWith('application/json')) return reply(res, 415, { ok: false, error: 'Invalid request format.' });
  if (Number(req.headers['content-length'] || 0) > 12000) return reply(res, 413, { ok: false, error: 'Message is too large.' });
  const origin = req.headers.origin;
  if (origin && req.headers.host) {
    try {
      if (new URL(origin).host !== req.headers.host) return reply(res, 403, { ok: false, error: 'Invalid request origin.' });
    } catch { return reply(res, 403, { ok: false, error: 'Invalid request origin.' }); }
  }

  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
  if (JSON.stringify(body).length > 12000) return reply(res, 413, { ok: false, error: 'Message is too large.' });
  if (body.website) return reply(res, 400, { ok: false, error: 'Invalid request.' });
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const subject = String(body.subject || '').trim();
  const message = String(body.message || '').trim();
  if (!name || name.length > 100 || !EMAIL.test(email) || email.length > 254 || !subject || subject.length > 160 || /[\r\n]/.test(subject) || message.length < 10 || message.length > 5000) {
    return reply(res, 400, { ok: false, error: 'Please check your name, email, subject, and message.' });
  }
  const startedAt = Number(body.startedAt);
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 1200 || Date.now() - startedAt > 86400000) {
    return reply(res, 400, { ok: false, error: 'Please reopen the form and try again.' });
  }
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const now = Date.now();
  for (const [key, value] of requests) if (now - value > 60000) requests.delete(key);
  if (requests.has(ip)) {
    res.setHeader('Retry-After', '60');
    return reply(res, 429, { ok: false, error: 'Please wait a minute before sending another message.' });
  }
  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_FROM_EMAIL) return reply(res, 503, { ok: false, error: 'Email is not configured yet. Please try again later.' });

  requests.set(ip, now);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL,
        to: [RECIPIENT],
        reply_to: email,
        subject: `Portfolio contact: ${subject}`,
        text: `From: ${name} <${email}>\n\n${message}`,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.id) {
      requests.delete(ip);
      console.error('Contact email provider rejected the request', response.status, result?.name || '');
      return reply(res, response.status === 401 || response.status === 403 ? 503 : 502, { ok: false, error: response.status === 401 || response.status === 403 ? 'Email service configuration needs attention. Please try again later.' : 'The email service could not accept your message. Please try again.' });
    }
    return reply(res, 200, { ok: true });
  } catch {
    requests.delete(ip);
    return reply(res, 502, { ok: false, error: 'The email service is temporarily unavailable. Please try again.' });
  } finally {
    clearTimeout(timeout);
  }
}
