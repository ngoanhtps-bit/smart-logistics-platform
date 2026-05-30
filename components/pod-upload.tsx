"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, ExternalLink, FileText, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

export function PodUpload({ shipmentCode }: { shipmentCode: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const qc = useQueryClient();

  const { data: docs } = useQuery({
    queryKey: ["documents", shipmentCode],
    queryFn: () =>
      fetch(`/api/documents?shipment=${shipmentCode}`, { credentials: "include" }).then((r) => r.json())
  });

  const uploadMut = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      form.append("shipmentCode", shipmentCode);
      form.append("type", "pod");
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        credentials: "include",
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Upload thất bại");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents", shipmentCode] });
      setError("");
      if (fileRef.current) fileRef.current.value = "";
    },
    onError: (e) => setError((e as Error).message)
  });

  return (
    <div className="rounded-3xl border border-slate-200 p-5 dark:border-slate-700">
      <h3 className="font-black text-[#102033] dark:text-white">POD & chứng từ</h3>
      <p className="mt-1 text-xs text-slate-500">Ảnh/PDF tối đa 10MB — lưu Supabase Storage (nếu đã cấu hình bucket).</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="flex-1 text-sm"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadMut.mutate(file);
          }}
        />
        <button
          className="btn-secondary shrink-0"
          type="button"
          disabled={uploadMut.isPending}
          onClick={() => fileRef.current?.click()}
        >
          {uploadMut.isPending ? <Loader2 className="animate-spin" size={16} /> : <Camera size={16} />}
          Chọn file
        </button>
      </div>

      {error ? <p className="mt-2 text-xs font-bold text-red-600">{error}</p> : null}
      {uploadMut.isSuccess && (uploadMut.data as { warning?: string })?.warning ? (
        <p className="mt-2 text-xs font-bold text-amber-700">{(uploadMut.data as { warning: string }).warning}</p>
      ) : null}

      <ul className="mt-4 grid gap-2">
        {docs?.map((d: { id: string; fileName: string; type: string; url: string }) => (
          <li
            key={d.id}
            className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 text-sm font-semibold dark:bg-slate-800 dark:text-slate-200"
          >
            <span className="flex items-center gap-2">
              <FileText size={16} className="text-[#2563eb]" />
              {d.fileName} <span className="text-slate-400">({d.type})</span>
            </span>
            {d.url && d.url.startsWith("http") ? (
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-bold text-[#2563eb]"
              >
                Xem <ExternalLink size={14} />
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
