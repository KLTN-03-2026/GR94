/**
 * Custom Nodemailer transport that sends emails via Brevo (Sendinblue) HTTP API.
 * This bypasses SMTP port blocking on platforms like Render free tier.
 *
 * Brevo free tier: 300 emails/day, no domain verification needed.
 */
export function createBrevoTransport(apiKey: string) {
  return {
    name: 'brevo',
    version: '1.0.0',
    send(
      mail: { data: Record<string, any> },
      callback: (err: Error | null, info?: any) => void,
    ) {
      const { from, to, subject, html, text } = mail.data;

      // Normalize "from" field
      let senderEmail: string;
      let senderName: string;
      if (typeof from === 'string') {
        senderEmail = from;
        senderName = 'Gia Kế';
      } else if (from?.address) {
        senderEmail = from.address;
        senderName = from.name || 'Gia Kế';
      } else {
        senderEmail = 'noreply@giake.app';
        senderName = 'Gia Kế';
      }

      // Normalize "to" field — Brevo expects [{email, name}]
      const toArr: { email: string; name?: string }[] = (
        Array.isArray(to) ? to : [to]
      ).map((t: any) => {
        if (typeof t === 'string') return { email: t };
        return { email: t.address || t.email || t, name: t.name };
      });

      fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: toArr,
          subject: subject || '(no subject)',
          htmlContent: html || undefined,
          textContent: text || undefined,
        }),
      })
        .then(async (res) => {
          const body = await res.json().catch(() => ({}));
          if (!res.ok) {
            const msg =
              (body as any).message || `Brevo API error: ${res.status}`;
            console.error('[Brevo] Send failed:', msg);
            throw new Error(msg);
          }
          callback(null, {
            messageId: (body as any).messageId || 'brevo-ok',
            accepted: toArr.map((t) => t.email),
          });
        })
        .catch((err) => {
          callback(err instanceof Error ? err : new Error(String(err)));
        });
    },
  };
}
