export type NotificationChannel = "email" | "sms" | "zalo" | "push";

export type SendNotificationInput = {
  channel: NotificationChannel;
  to: string;
  title: string;
  body: string;
  meta?: Record<string, string>;
};

import { createAppNotification } from "@/lib/notifications/app-notifications";
import { sendTransactionalEmail, shipmentEmailHtml } from "@/lib/email/send";
import { getSiteUrl } from "@/lib/site-url";

export type NotificationLog = SendNotificationInput & {
  id: string;
  status: "sent" | "queued" | "failed";
  sentAt: string;
};

const logs: NotificationLog[] = [];

async function sendEmail(to: string, title: string, body: string) {
  if (process.env.SMTP_HOST) {
    // Production: nodemailer / Resend / SendGrid
    console.log("[email]", { to, title, body: body.slice(0, 80) });
  }
  return { ok: true };
}

async function sendSms(to: string, body: string) {
  if (process.env.SMS_API_KEY) {
    console.log("[sms]", { to, body: body.slice(0, 160) });
  }
  return { ok: true };
}

async function sendZalo(to: string, title: string, body: string) {
  if (process.env.ZALO_OA_TOKEN) {
    console.log("[zalo]", { to, title, body: body.slice(0, 80) });
  }
  return { ok: true };
}

export async function dispatchNotification(input: SendNotificationInput): Promise<NotificationLog> {
  let status: NotificationLog["status"] = "sent";

  try {
    switch (input.channel) {
      case "email":
        await sendEmail(input.to, input.title, input.body);
        break;
      case "sms":
        await sendSms(input.to, input.body);
        break;
      case "zalo":
        await sendZalo(input.to, input.title, input.body);
        break;
      case "push":
        break;
      default:
        status = "failed";
    }
  } catch {
    status = "failed";
  }

  const entry: NotificationLog = {
    ...input,
    id: `NTF-${Date.now()}`,
    status: process.env.SMS_API_KEY || process.env.ZALO_OA_TOKEN || process.env.SMTP_HOST ? status : "queued",
    sentAt: new Date().toISOString()
  };
  logs.unshift(entry);
  return entry;
}

/** Gửi đa kênh cho sự kiện logistics */
export async function notifyShipmentEvent(opts: {
  event: "created" | "assigned" | "delivered" | "eta_late";
  code: string;
  phone?: string;
  email?: string;
}) {
  const messages: Record<string, { title: string; body: string }> = {
    created: {
      title: `Đơn ${opts.code} đã tạo`,
      body: "Điều phối đang xử lý báo giá và gán xe phù hợp."
    },
    assigned: {
      title: `Đã gán xe cho ${opts.code}`,
      body: "Tài xế sẽ liên hệ và cập nhật GPS thời gian thực trên hệ thống."
    },
    delivered: {
      title: `Giao thành công ${opts.code}`,
      body: "POD đã sẵn sàng tải trên customer dashboard."
    },
    eta_late: {
      title: `Cảnh báo ETA ${opts.code}`,
      body: "Chuyến chậm tiến độ. Điều phối đang xử lý."
    }
  };

  const msg = messages[opts.event];

  void createAppNotification({
    title: msg.title,
    body: msg.body,
    type: opts.event === "eta_late" ? "warning" : opts.event === "delivered" ? "success" : "info",
    shipmentCode: opts.code
  });

  const tasks: Promise<NotificationLog>[] = [];

  if (opts.phone) {
    tasks.push(dispatchNotification({ channel: "sms", to: opts.phone, title: msg.title, body: msg.body }));
    tasks.push(dispatchNotification({ channel: "zalo", to: opts.phone, title: msg.title, body: msg.body }));
  }
  if (opts.email) {
    tasks.push(dispatchNotification({ channel: "email", to: opts.email, title: msg.title, body: msg.body }));
    void sendTransactionalEmail({
      to: opts.email,
      subject: msg.title,
      html: shipmentEmailHtml({
        title: msg.title,
        body: msg.body,
        code: opts.code,
        appUrl: getSiteUrl()
      })
    });
  }

  return Promise.all(tasks);
}

export function listNotificationLogs() {
  return [...logs];
}
