import { NextResponse } from "next/server";
import { driverRoles, requireApiRoles } from "@/lib/auth/api-guard";
import { listDocuments, uploadDocument } from "@/lib/documents-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("shipment") ?? undefined;
  return NextResponse.json(await listDocuments(code));
}

export async function POST(request: Request) {
  const { error } = await requireApiRoles(driverRoles);
  if (error) return error;

  const body = await request.json();
  if (!body.shipmentCode || !body.fileName) {
    return NextResponse.json({ message: "Thiếu thông tin" }, { status: 400 });
  }
  const doc = await uploadDocument({
    shipmentCode: body.shipmentCode,
    type: body.type ?? "pod",
    fileName: body.fileName
  });
  return NextResponse.json(doc, { status: 201 });
}
