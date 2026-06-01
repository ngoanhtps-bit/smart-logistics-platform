/** Thông báo trình duyệt (Web Notification API) — dùng khi có chuyến chờ chốt / sự kiện vận hành */

export async function ensureNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export function showBrowserNotification(title: string, options?: NotificationOptions) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    const n = new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      ...options
    });
    n.onclick = () => {
      window.focus();
      if (options?.data && typeof options.data === "object" && "url" in options.data) {
        const url = (options.data as { url?: string }).url;
        if (url) window.location.href = url;
      }
      n.close();
    };
  } catch {
    /* ignore */
  }
}

export function playOpsChime() {
  if (typeof window === "undefined") return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
    setTimeout(() => void ctx.close(), 200);
  } catch {
    /* ignore */
  }
}
