import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

async function getClient() {
  const admin = createSupabaseAdminClient();
  if (admin) return admin;
  return createSupabaseServerClient();
}

export function isOperationalDbEnabled() {
  return getSupabaseConfig().enabled;
}

export type BidRow = {
  id: string;
  shipment_code: string;
  carrier: string;
  amount: string;
  eta: string;
  created_at: string;
};

export async function supabaseListBids(shipmentCode?: string): Promise<BidRow[]> {
  const client = await getClient();
  if (!client) return [];

  let q = client.from("marketplace_bids").select("*").order("created_at", { ascending: false });
  if (shipmentCode) q = q.eq("shipment_code", shipmentCode);

  const { data, error } = await q;
  if (error || !data) return [];
  return data as BidRow[];
}

export async function supabaseInsertBid(input: {
  shipmentCode: string;
  carrier: string;
  amount: string;
  eta: string;
}) {
  const client = await getClient();
  if (!client) return null;

  const id = `bid-${Date.now()}`;
  const { data, error } = await client
    .from("marketplace_bids")
    .insert({
      id,
      shipment_code: input.shipmentCode,
      carrier: input.carrier,
      amount: input.amount,
      eta: input.eta
    })
    .select()
    .single();

  if (error) return null;
  return data as BidRow;
}

export type AppNotificationRow = {
  id: string;
  user_id: string | null;
  title: string;
  body: string;
  type: string;
  read: boolean;
  shipment_code: string | null;
  created_at: string;
};

export async function supabaseListNotifications(userId?: string | null): Promise<AppNotificationRow[]> {
  const client = await getClient();
  if (!client) return [];

  let q = client.from("app_notifications").select("*").order("created_at", { ascending: false }).limit(50);
  if (userId) {
    q = q.or(`user_id.is.null,user_id.eq.${userId}`);
  }

  const { data, error } = await q;
  if (error || !data) return [];
  return data as AppNotificationRow[];
}

export async function supabaseCreateNotification(input: {
  title: string;
  body: string;
  type?: "info" | "warning" | "success";
  userId?: string | null;
  shipmentCode?: string;
}) {
  const client = await getClient();
  if (!client) return null;

  const { data, error } = await client
    .from("app_notifications")
    .insert({
      id: `ntf-${Date.now()}`,
      user_id: input.userId ?? null,
      title: input.title,
      body: input.body,
      type: input.type ?? "info",
      shipment_code: input.shipmentCode ?? null,
      read: false
    })
    .select()
    .single();

  if (error) return null;
  return data as AppNotificationRow;
}

export async function supabaseMarkNotificationRead(id: string) {
  const client = await getClient();
  if (!client) return false;
  const { error } = await client.from("app_notifications").update({ read: true }).eq("id", id);
  return !error;
}

export async function supabaseMarkAllNotificationsRead() {
  const client = await getClient();
  if (!client) return false;
  const { error } = await client.from("app_notifications").update({ read: true }).eq("read", false);
  return !error;
}

export type DocumentRow = {
  id: string;
  shipment_code: string;
  type: string;
  file_name: string;
  url: string;
  uploaded_at: string;
};

export async function supabaseListDocuments(shipmentCode?: string): Promise<DocumentRow[]> {
  const client = await getClient();
  if (!client) return [];

  let q = client.from("shipment_documents").select("*").order("uploaded_at", { ascending: false });
  if (shipmentCode) q = q.eq("shipment_code", shipmentCode);

  const { data, error } = await q;
  if (error || !data) return [];
  return data as DocumentRow[];
}

export async function supabaseInsertDocument(input: {
  shipmentCode: string;
  type: string;
  fileName: string;
  url?: string;
}) {
  const client = await getClient();
  if (!client) return null;

  const id = `DOC-${Date.now()}`;
  const { data, error } = await client
    .from("shipment_documents")
    .insert({
      id,
      shipment_code: input.shipmentCode,
      type: input.type,
      file_name: input.fileName,
      url: input.url ?? `/tracking/${input.shipmentCode}#documents`
    })
    .select()
    .single();

  if (error) return null;
  return data as DocumentRow;
}

export async function supabaseSearchShipmentsByQuery(query: string) {
  const client = await getClient();
  if (!client || !query.trim()) return [];

  const q = query.trim();
  const { data, error } = await client
    .from("shipments")
    .select("code, pickup_location, delivery_location, status, cargo_type")
    .or(`code.ilike.%${q}%,pickup_location.ilike.%${q}%,delivery_location.ilike.%${q}%,cargo_type.ilike.%${q}%`)
    .limit(12);

  if (error || !data) return [];
  return data as {
    code: string;
    pickup_location: string;
    delivery_location: string;
    status: string;
    cargo_type: string;
  }[];
}
