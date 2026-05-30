import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export type InvoiceRow = {
  id: string;
  code: string;
  shipment_code: string;
  customer_id: string;
  amount: string;
  status: string;
  note: string | null;
  issued_at: string;
  paid_at: string | null;
};

async function getClient() {
  const admin = createSupabaseAdminClient();
  if (admin) return admin;
  return createSupabaseServerClient();
}

export function isInvoicesEnabled() {
  return getSupabaseConfig().enabled;
}

export async function supabaseListInvoices(filters?: { customerId?: string; shipmentCode?: string }) {
  const client = await getClient();
  if (!client) return [];

  let q = client.from("invoices").select("*").order("issued_at", { ascending: false });
  if (filters?.customerId) q = q.eq("customer_id", filters.customerId);
  if (filters?.shipmentCode) q = q.eq("shipment_code", filters.shipmentCode);

  const { data, error } = await q;
  if (error || !data) return [];
  return data as InvoiceRow[];
}

export async function supabaseFindInvoiceByShipment(shipmentCode: string) {
  const client = await getClient();
  if (!client) return null;
  const { data } = await client.from("invoices").select("*").eq("shipment_code", shipmentCode).maybeSingle();
  return (data as InvoiceRow) ?? null;
}

function generateInvoiceCode() {
  const d = new Date();
  return `INV-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 900 + 100)}`;
}

export async function supabaseCreateInvoice(input: {
  shipmentCode: string;
  customerId: string;
  amount: string;
  note?: string;
}) {
  const client = await getClient();
  if (!client) return null;

  const existing = await supabaseFindInvoiceByShipment(input.shipmentCode);
  if (existing) return existing;

  const id = `inv-${Date.now()}`;
  const code = generateInvoiceCode();

  const { data, error } = await client
    .from("invoices")
    .insert({
      id,
      code,
      shipment_code: input.shipmentCode,
      customer_id: input.customerId,
      amount: input.amount,
      status: "pending",
      note: input.note ?? null
    })
    .select()
    .single();

  if (error) return null;
  return data as InvoiceRow;
}

export async function supabaseMarkInvoicePaid(invoiceId: string) {
  const client = await getClient();
  if (!client) return null;

  const { data, error } = await client
    .from("invoices")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", invoiceId)
    .select()
    .single();

  if (error) return null;
  return data as InvoiceRow;
}
