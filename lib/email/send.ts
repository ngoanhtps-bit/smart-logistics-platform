/** Gửi email qua Resend API (tuỳ chọn — set RESEND_API_KEY) */

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  html: string;
}) {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    console.log("[email:queued]", input.to, input.subject);
    return { ok: false, queued: true };
  }

  const from = process.env.EMAIL_FROM ?? "Logistics <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html
    })
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[email:error]", err);
    return { ok: false, queued: false };
  }

  return { ok: true, queued: false };
}

export function shipmentEmailHtml(opts: { title: string; body: string; code: string; appUrl: string }) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
      <h2 style="color:#102033">${opts.title}</h2>
      <p>${opts.body}</p>
      <p><a href="${opts.appUrl}/tracking/${opts.code}" style="color:#2563eb;font-weight:bold">Theo dõi ${opts.code}</a></p>
      <p style="color:#64748b;font-size:12px">Logistics Thông minh</p>
    </div>
  `;
}
