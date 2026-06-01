"use client";

import { OperationsControlCenter } from "@/components/operations-control-center";

/** Admin xem toàn bộ vận hành — cùng trung tâm điều khiển với điều phối */
export function AdminOperationsTab() {
  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-950">
        <strong>Quyền admin:</strong> xem và điều khiển mọi vận đơn, nhật ký sự kiện, đổi trạng thái. Gán tài xế chi
        tiết tại tab Điều phối hoặc link «Gán xe» trong bảng điều khiển.
      </div>
      <OperationsControlCenter />
    </div>
  );
}
