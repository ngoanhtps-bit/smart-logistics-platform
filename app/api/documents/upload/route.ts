import { NextResponse } from "next/server";
import { driverRoles, requireApiRoles } from "@/lib/auth/api-guard";
import { uploadDocument } from "@/lib/documents-store";
import { uploadDocumentFile } from "@/lib/supabase/storage";

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const { error } = await requireApiRoles(driverRoles);
  if (error) return error;

  const form = await request.formData();
  const file = form.get("file");
  const shipmentCode = String(form.get("shipmentCode") ?? "");
  const type = String(form.get("type") ?? "pod");

  if (!shipmentCode || !(file instanceof File)) {
    return NextResponse.json({ message: "Thiếu file hoặc mã vận đơn" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ message: "File tối đa 10MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const upload = await uploadDocumentFile({
    shipmentCode,
    fileName: file.name,
    bytes: buffer,
    contentType: file.type || "application/octet-stream"
  });

  if (!upload || upload.error) {
    const doc = await uploadDocument({
      shipmentCode,
      type: type as "pod",
      fileName: file.name
    });
    return NextResponse.json({
      ...doc,
      warning: upload?.error ?? "Storage chưa cấu hình — chỉ lưu metadata"
    });
  }

  const doc = await uploadDocument({
    shipmentCode,
    type: type as "pod",
    fileName: file.name,
    storageUrl: upload.url!
  });

  return NextResponse.json(doc, { status: 201 });
}
