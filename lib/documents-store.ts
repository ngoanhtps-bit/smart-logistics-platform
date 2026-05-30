import {
  isOperationalDbEnabled,
  supabaseInsertDocument,
  supabaseListDocuments
} from "@/lib/supabase/operational-data";
import { createAppNotification } from "@/lib/notifications/app-notifications";

export type DocumentRecord = {
  id: string;
  shipmentCode: string;
  type: "pod" | "invoice" | "bbgn" | "other";
  fileName: string;
  url: string;
  uploadedAt: string;
};

const documents: DocumentRecord[] = [
  {
    id: "doc1",
    shipmentCode: "SPL-260528-01",
    type: "pod",
    fileName: "POD-SPL-260528-01.pdf",
    url: "#",
    uploadedAt: "2026-05-28T14:00:00Z"
  }
];

function mapRow(row: {
  id: string;
  shipment_code: string;
  type: string;
  file_name: string;
  url: string;
  uploaded_at: string;
}): DocumentRecord {
  return {
    id: row.id,
    shipmentCode: row.shipment_code,
    type: row.type as DocumentRecord["type"],
    fileName: row.file_name,
    url: row.url,
    uploadedAt: row.uploaded_at
  };
}

export async function listDocuments(shipmentCode?: string) {
  if (isOperationalDbEnabled()) {
    const rows = await supabaseListDocuments(shipmentCode);
    if (rows.length > 0 || shipmentCode) return rows.map(mapRow);
  }
  if (!shipmentCode) return [...documents];
  return documents.filter((d) => d.shipmentCode === shipmentCode);
}

export async function uploadDocument(
  input: Omit<DocumentRecord, "id" | "uploadedAt" | "url"> & { storageUrl?: string }
) {
  if (isOperationalDbEnabled()) {
    const row = await supabaseInsertDocument({
      shipmentCode: input.shipmentCode,
      type: input.type,
      fileName: input.fileName,
      url: input.storageUrl
    });
    if (row) {
      void createAppNotification({
        title: "POD / chứng từ mới",
        body: `${input.fileName} — ${input.shipmentCode}`,
        type: "success",
        shipmentCode: input.shipmentCode
      });
      return mapRow(row);
    }
  }

  const doc: DocumentRecord = {
    shipmentCode: input.shipmentCode,
    type: input.type,
    fileName: input.fileName,
    id: `DOC-${Date.now()}`,
    url: input.storageUrl ?? `/tracking/${input.shipmentCode}#documents`,
    uploadedAt: new Date().toISOString()
  };
  documents.unshift(doc);
  return doc;
}
