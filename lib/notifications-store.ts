import {
  fetchAppNotifications,
  markAllAppNotificationsRead,
  markAppNotificationRead
} from "@/lib/notifications/app-notifications";

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  type: "info" | "warning" | "success";
  read: boolean;
  createdAt: string;
};

let notifications: AppNotification[] = [
  {
    id: "n1",
    title: "ETA lệch 42 phút",
    body: "SPL-260528-01 đi qua đoạn ùn tắc — cần báo khách hàng.",
    type: "warning",
    read: false,
    createdAt: new Date(Date.now() - 300_000).toISOString()
  },
  {
    id: "n2",
    title: "Báo giá mới",
    body: "Khách hàng yêu cầu mooc rào Hải Phòng → Bình Dương.",
    type: "info",
    read: false,
    createdAt: new Date(Date.now() - 900_000).toISOString()
  },
  {
    id: "n3",
    title: "POD đã upload",
    body: "Tài xế đã gửi biên bản giao nhận SPL-260528-01.",
    type: "success",
    read: true,
    createdAt: new Date(Date.now() - 3_600_000).toISOString()
  }
];

export async function listNotifications(userId?: string | null) {
  const fromDb = await fetchAppNotifications(userId);
  if (fromDb) return fromDb;
  return [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listNotificationsSync() {
  return [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function markRead(id: string) {
  const ok = await markAppNotificationRead(id);
  if (ok) return;
  notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
}

export async function markAllRead() {
  const ok = await markAllAppNotificationsRead();
  if (ok) return;
  notifications = notifications.map((n) => ({ ...n, read: true }));
}
