"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCircle2,
  Loader2,
  MapPinned,
  Navigation,
  ThumbsDown,
  ThumbsUp,
  Truck
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { driverTripUrl } from "@/lib/navigation/shipment-links";
import { useDriverAutoGps } from "@/hooks/use-driver-auto-gps";
import { useDriverPendingAlerts } from "@/hooks/use-driver-pending-alerts";
import { ensureNotificationPermission } from "@/lib/browser/notify";
import { mapsDirectionsUrl } from "@/lib/maps/navigation";
import { PodUpload } from "@/components/pod-upload";
import { api } from "@/lib/api/client";
import { invalidateShipmentFlow } from "@/lib/query/invalidate-shipments";
import type { DriverTripOffer, ShipmentStatus } from "@/types/logistics";

type TripsPayload = {
  pending: DriverTripOffer[];
  active: DriverTripOffer[];
  history: DriverTripOffer[];
  noDriverProfile?: boolean;
};

const statusActions: { key: ShipmentStatus; label: string }[] = [
  { key: "pickup", label: "Đã tới điểm lấy" },
  { key: "loaded", label: "Đã xếp hàng" },
  { key: "in_transit", label: "Đang vận chuyển" },
  { key: "delivered", label: "Đã giao hàng" }
];

async function fetchTrips() {
  const res = await fetch("/api/driver/trips", { credentials: "include", cache: "no-store" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? "Không tải được chuyến");
  return json as TripsPayload;
}

type DriverTab = "pending" | "active" | "history" | "profile";

export function DriverDashboard() {
  const qc = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as DriverTab | null;
  const focusCode = searchParams.get("focus");
  const [tab, setTab] = useState<DriverTab>(
    tabParam === "active" || tabParam === "history" || tabParam === "profile" ? tabParam : "pending"
  );
  const [acceptForm, setAcceptForm] = useState({ plate: "", phone: "", note: "" });
  const [declineReason, setDeclineReason] = useState("");
  const [selectedPending, setSelectedPending] = useState<string | null>(null);
  const [gpsMsg, setGpsMsg] = useState<string | null>(null);
  const [notifyPerm, setNotifyPerm] = useState<string>("default");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["driver-trips"],
    queryFn: fetchTrips,
    refetchInterval: 15_000
  });

  const { data: profileData } = useQuery({
    queryKey: ["driver-profile"],
    queryFn: async () => {
      const res = await fetch("/api/driver/profile", { credentials: "include" });
      const json = await res.json();
      return json.profile as { plate?: string; phone?: string; name?: string; vehicleType?: string } | null;
    }
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetch("/api/notifications").then((r) => r.json()),
    refetchInterval: 30_000
  });
  const unread = (notifications as { read?: boolean }[] | undefined)?.filter((n) => !n.read).length ?? 0;

  const respondMut = useMutation({
    mutationFn: async ({
      code,
      action
    }: {
      code: string;
      action: "accept" | "decline";
    }) => {
      const res = await fetch(`/api/driver/trips/${code}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          plate: acceptForm.plate,
          phone: acceptForm.phone,
          note: acceptForm.note,
          declineReason: action === "decline" ? declineReason : undefined
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Thất bại");
      return json;
    },
    onSuccess: (_data, vars) => {
      setSelectedPending(null);
      setAcceptForm({ plate: "", phone: "", note: "" });
      setDeclineReason("");
      invalidateShipmentFlow(qc, vars.code);
    }
  });

  const active = data?.active?.[0];
  const pendingList = data?.pending ?? [];

  useDriverPendingAlerts(pendingList, true);
  const autoGps = useDriverAutoGps(
    active?.code,
    Boolean(active && ["assigned", "pickup", "loaded", "in_transit"].includes(active.status))
  );

  const focusPending = useMemo(() => pendingList[0], [pendingList]);

  useEffect(() => {
    if (tabParam === "active" || tabParam === "history" || tabParam === "profile" || tabParam === "pending") {
      setTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (focusCode && pendingList.some((t) => t.code === focusCode)) {
      setTab("pending");
      setSelectedPending(focusCode);
    }
  }, [focusCode, pendingList]);

  useEffect(() => {
    if (!tabParam && pendingList.length > 0) setTab("pending");
  }, [pendingList.length, tabParam]);

  function setDriverTab(next: DriverTab) {
    setTab(next);
    router.replace(`/driver?tab=${next}`);
  }

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifyPerm(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!profileData) return;
    setAcceptForm((f) => ({
      plate: f.plate || profileData.plate || "",
      phone: f.phone || profileData.phone || "",
      note: f.note
    }));
  }, [profileData?.plate, profileData?.phone]);

  const statusMut = useMutation({
    mutationFn: (status: ShipmentStatus) => api.patchShipment(active!.code, { status }),
    onSuccess: () => {
      invalidateShipmentFlow(qc, active?.code);
    }
  });

  const gpsMut = useMutation({
    mutationFn: async () => {
      if (!active) throw new Error("Không có chuyến");
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 12_000 });
      });
      const res = await fetch(`/api/tracking/${active.code}/gps`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          speed: pos.coords.speed ?? 50
        })
      });
      if (!res.ok) throw new Error("Gửi GPS thất bại");
      return res.json();
    },
    onSuccess: () => {
      setGpsMsg("Đã gửi vị trí GPS");
      invalidateShipmentFlow(qc, active?.code);
    },
    onError: () => setGpsMsg("Bật quyền vị trí trên trình duyệt")
  });

  if (data?.noDriverProfile) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
        <p className="font-black text-amber-900">Chưa có hồ sơ tài xế</p>
        <p className="mt-2 text-sm text-amber-800">
          Admin cần duyệt tài khoản và tạo dòng <code>drivers</code> (đăng ký role Tài xế hoặc admin tạo user tài xế).
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-orange-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#102033]">
              {tab === "pending" ? "Chốt chuyến" : tab === "active" ? "Đang chạy" : tab === "history" ? "Lịch sử" : "Hồ sơ"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-2 text-sm font-black text-[#2563eb]">
              <Bell size={16} />
              {unread > 0 ? `${unread} mới` : "Thông báo"}
            </span>
            {notifyPerm !== "granted" ? (
              <button
                type="button"
                className="btn-ghost text-sm"
                onClick={async () => {
                  const p = await ensureNotificationPermission();
                  setNotifyPerm(p === "unsupported" ? "denied" : p);
                }}
              >
                Bật thông báo
              </button>
            ) : null}
            <button type="button" className="btn-ghost text-sm" onClick={() => refetch()}>
              Làm mới
            </button>
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Điều phối gửi chuyến → bạn nhận thông báo → <strong>Chốt</strong> hoặc <strong>Từ chối</strong> → thông tin xe về
          bảng điều phối.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 lg:hidden">
          {(
            [
              ["pending", `Chốt (${pendingList.length})`],
              ["active", `Chạy (${data?.active?.length ?? 0})`],
              ["history", `Lịch sử`],
              ["profile", "Hồ sơ"]
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setDriverTab(id)}
              className={`rounded-xl px-3 py-2 text-xs font-bold ${
                tab === id ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {isLoading ? (
        <p className="flex items-center gap-2 text-slate-500">
          <Loader2 className="animate-spin" size={18} /> Đang tải chuyến...
        </p>
      ) : error ? (
        <p className="text-sm font-bold text-red-600">{(error as Error).message}</p>
      ) : null}

      {focusPending && tab === "pending" ? (
        <section className="rounded-3xl border-2 border-amber-300 bg-amber-50 p-5">
          <p className="text-xs font-black uppercase text-amber-800">Ưu tiên — chốt ngay</p>
          <p className="mt-1 text-xl font-black text-[#102033]">{focusPending.code}</p>
          <p className="text-sm font-semibold text-slate-600">{focusPending.route}</p>
          <button
            type="button"
            className="btn-primary mt-3 w-full"
            onClick={() => setSelectedPending(focusPending.code)}
          >
            <Truck size={18} /> Mở form chốt
          </button>
        </section>
      ) : null}

      {tab === "pending" ? (
        <div className="grid gap-4">
          {pendingList.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
              Không có chuyến chờ chốt. Khi điều phối tạo đơn / gửi cho bạn, thông báo sẽ hiện ở chuông trên thanh menu.
            </p>
          ) : (
            pendingList.map((trip) => (
              <article
                key={trip.code}
                className={`rounded-3xl border p-5 shadow-sm ${
                  selectedPending === trip.code ? "border-[#2563eb] bg-blue-50/40" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-2xl font-black text-[#102033]">{trip.code}</p>
                    <p className="mt-1 font-semibold text-slate-600">{trip.route}</p>
                    <p className="mt-2 text-sm text-slate-500">
                      {trip.cargoType} · {trip.weight} · {trip.vehicleType}
                    </p>
                    <p className="mt-1 text-xs font-bold text-amber-700">ETA {trip.eta}</p>
                    <Link href={driverTripUrl(trip.code)} className="mt-2 text-xs font-bold text-orange-600">
                      Chi tiết chuyến →
                    </Link>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-900">
                    Chờ bạn chốt
                  </span>
                </div>

                {selectedPending === trip.code ? (
                  <div className="mt-4 grid gap-2 border-t border-slate-200 pt-4">
                    <input
                      className="rounded-xl border px-3 py-2 text-sm font-semibold"
                      placeholder="Biển số xe bạn chạy *"
                      value={acceptForm.plate}
                      onChange={(e) => setAcceptForm({ ...acceptForm, plate: e.target.value })}
                    />
                    <input
                      className="rounded-xl border px-3 py-2 text-sm font-semibold"
                      placeholder="SĐT liên hệ"
                      value={acceptForm.phone}
                      onChange={(e) => setAcceptForm({ ...acceptForm, phone: e.target.value })}
                    />
                    <input
                      className="rounded-xl border px-3 py-2 text-sm font-semibold"
                      placeholder="Ghi chú (tuỳ chọn)"
                      value={acceptForm.note}
                      onChange={(e) => setAcceptForm({ ...acceptForm, note: e.target.value })}
                    />
                    <select
                      className="rounded-xl border px-3 py-2 text-sm font-semibold"
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                    >
                      <option value="">Lý do từ chối (nếu từ chối)</option>
                      <option value="xe_hong">Xe hỏng / sửa chữa</option>
                      <option value="trung_lich">Trùng lịch chuyến</option>
                      <option value="tuyen_xa">Tuyến quá xa</option>
                      <option value="khac">Lý do khác</option>
                    </select>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn-primary flex-1"
                        disabled={!acceptForm.plate || respondMut.isPending}
                        onClick={() => respondMut.mutate({ code: trip.code, action: "accept" })}
                      >
                        <ThumbsUp size={18} /> Xác nhận chạy
                      </button>
                      <button
                        type="button"
                        className="btn-secondary flex-1"
                        disabled={respondMut.isPending || !declineReason}
                        onClick={() => respondMut.mutate({ code: trip.code, action: "decline" })}
                      >
                        <ThumbsDown size={18} /> Từ chối
                      </button>
                    </div>
                    {respondMut.isError ? (
                      <p className="text-xs font-bold text-red-600">{(respondMut.error as Error).message}</p>
                    ) : null}
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn-primary mt-4 w-full"
                    onClick={() => {
                      setSelectedPending(trip.code);
                      setAcceptForm({
                        plate: profileData?.plate ?? "",
                        phone: profileData?.phone ?? "",
                        note: ""
                      });
                    }}
                  >
                    <Truck size={18} /> Chốt chuyến này
                  </button>
                )}
              </article>
            ))
          )}
        </div>
      ) : null}

      {tab === "active" ? (
        <div className="grid gap-6">
          {!active ? (
            <p className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">
              Chưa có chuyến đang chạy — chốt chuyến ở tab «Chờ chốt» trước.
            </p>
          ) : (
            <>
              <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-[#102033] to-[#1e3a5f] p-6 text-white">
                <p className="text-sm font-black uppercase text-orange-300">Chuyến đang chạy</p>
                <p className="mt-2 text-3xl font-black">{active.code}</p>
                <p className="mt-2 text-slate-300">{active.route}</p>
                <p className="mt-2 font-bold text-orange-300">
                  {active.driverReportPlate || "—"} · {active.vehicleType}
                </p>
                <p className="text-sm text-slate-400">{active.statusLabel}</p>
                {autoGps.isSending ? (
                  <p className="mt-2 text-xs font-bold text-emerald-300">Đang gửi GPS tự động…</p>
                ) : (
                  <p className="mt-2 text-xs font-bold text-emerald-300/80">GPS tự động mỗi 4 phút khi chuyến đang chạy</p>
                )}
                <Link href={driverTripUrl(active.code)} className="mt-3 inline-block text-sm font-bold text-orange-300">
                  Mở chi tiết chuyến →
                </Link>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6">
                <h3 className="font-black text-[#102033]">Cập nhật trạng thái</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {statusActions.map((action) => (
                    <button
                      key={action.key}
                      type="button"
                      className="flex items-center gap-2 rounded-2xl border px-4 py-3 font-bold hover:bg-blue-50 disabled:opacity-50"
                      disabled={statusMut.isPending}
                      onClick={() => statusMut.mutate(action.key)}
                    >
                      <CheckCircle2 className="text-green-600" size={18} />
                      {action.label}
                    </button>
                  ))}
                </div>
              </section>

              <PodUpload shipmentCode={active.code} />

              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  className="btn-primary inline-flex items-center justify-center gap-2"
                  href={mapsDirectionsUrl(active.delivery)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation size={18} /> Chỉ đường điểm giao
                </a>
                <a
                  className="btn-secondary inline-flex items-center justify-center gap-2"
                  href={mapsDirectionsUrl(active.pickup)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPinned size={18} /> Điểm lấy hàng
                </a>
                <button
                  className="btn-ghost sm:col-span-2"
                  type="button"
                  disabled={gpsMut.isPending}
                  onClick={() => gpsMut.mutate()}
                >
                  <MapPinned size={18} /> Gửi vị trí GPS
                </button>
              </div>
              {gpsMsg ? <p className="text-center text-sm font-semibold text-slate-600">{gpsMsg}</p> : null}
            </>
          )}
          {(data?.active?.length ?? 0) > 1 ? (
            <div className="grid gap-2">
              <p className="text-xs font-bold uppercase text-slate-400">Chuyến khác đang chạy</p>
              {data?.active?.slice(1).map((t) => (
                <Link
                  key={t.code}
                  href={`/tracking/${t.code}`}
                  className="rounded-xl border border-slate-100 p-3 font-bold text-[#2563eb]"
                >
                  {t.code} · {t.route}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === "profile" ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <h3 className="font-black text-[#102033]">Hồ sơ tài xế</h3>
          {profileData ? (
            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Tên</dt>
                <dd className="font-bold">{profileData.name || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">SĐT</dt>
                <dd className="font-bold">{profileData.phone || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Biển số</dt>
                <dd className="font-bold">{profileData.plate || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Loại xe</dt>
                <dd className="font-bold">{profileData.vehicleType || "—"}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Đang tải hồ sơ…</p>
          )}
        </section>
      ) : null}

      {tab === "history" ? (
        <div className="grid gap-2">
          {(data?.history ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có lịch sử.</p>
          ) : (
            data?.history?.map((t) => (
              <Link
                key={t.code}
                href={`/tracking/${t.code}`}
                className="rounded-2xl border border-slate-100 bg-white p-4 hover:bg-slate-50"
              >
                <p className="font-black">{t.code}</p>
                <p className="text-sm text-slate-600">{t.route}</p>
                <p className="text-xs font-bold text-slate-500">{t.statusLabel}</p>
              </Link>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
