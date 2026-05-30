import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseConfig } from "@/lib/supabase/config";

const BUCKET = "documents";

export function getPublicStorageUrl(path: string) {
  const { url } = getSupabaseConfig();
  if (!url) return path;
  return `${url}/storage/v1/object/public/${BUCKET}/${path}`;
}

export async function uploadDocumentFile(input: {
  shipmentCode: string;
  fileName: string;
  bytes: Buffer;
  contentType: string;
}) {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${input.shipmentCode}/${Date.now()}-${safeName}`;

  const { error } = await admin.storage.from(BUCKET).upload(path, input.bytes, {
    contentType: input.contentType,
    upsert: false
  });

  if (error) return { error: error.message, url: null as string | null, path: null as string | null };

  return { error: null, url: getPublicStorageUrl(path), path };
}
