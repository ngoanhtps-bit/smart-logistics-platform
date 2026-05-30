import {
  isInvoicesEnabled,
  supabaseCreateInvoice,
  supabaseListInvoices,
  supabaseMarkInvoicePaid,
  type InvoiceRow
} from "@/lib/supabase/invoices";
import { createAppNotification } from "@/lib/notifications/app-notifications";

export type Invoice = {
  id: string;
  code: string;
  shipmentCode: string;
  customerId: string;
  amount: string;
  status: "pending" | "paid" | "cancelled";
  statusLabel: string;
  note?: string;
  issuedAt: string;
  paidAt?: string;
};

const statusLabels: Record<string, string> = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  cancelled: "Đã hủy"
};

function mapRow(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    code: row.code,
    shipmentCode: row.shipment_code,
    customerId: row.customer_id,
    amount: row.amount,
    status: row.status as Invoice["status"],
    statusLabel: statusLabels[row.status] ?? row.status,
    note: row.note ?? undefined,
    issuedAt: row.issued_at,
    paidAt: row.paid_at ?? undefined
  };
}

const fallback: Invoice[] = [
  {
    id: "inv-mock-1",
    code: "INV-2026-0528",
    shipmentCode: "SPL-260528-01",
    customerId: "u1",
    amount: "24.8 triệu",
    status: "paid",
    statusLabel: "Đã thanh toán",
    issuedAt: new Date().toISOString()
  }
];

export async function listInvoices(filters?: { customerId?: string; shipmentCode?: string }) {
  if (isInvoicesEnabled()) {
    const rows = await supabaseListInvoices(filters);
    if (rows.length > 0) return rows.map(mapRow);
    if (filters?.customerId || filters?.shipmentCode) return [];
  }
  return fallback.filter((inv) => {
    if (filters?.customerId && inv.customerId !== filters.customerId) return false;
    if (filters?.shipmentCode && inv.shipmentCode !== filters.shipmentCode) return false;
    return true;
  });
}

export async function createInvoiceForShipment(input: {
  shipmentCode: string;
  customerId: string;
  amount?: string;
  weight?: string;
}) {
  const amount = input.amount ?? estimateAmount(input.weight ?? "15");
  if (!isInvoicesEnabled()) return null;

  const row = await supabaseCreateInvoice({
    shipmentCode: input.shipmentCode,
    customerId: input.customerId,
    amount,
    note: `Hóa đơn tự động — ${input.shipmentCode}`
  });

  if (row) {
    void createAppNotification({
      title: `Hóa đơn ${row.code}`,
      body: `${amount} · ${input.shipmentCode}`,
      type: "info",
      shipmentCode: input.shipmentCode
    });
  }

  return row ? mapRow(row) : null;
}

export async function markInvoicePaid(invoiceId: string) {
  if (!isInvoicesEnabled()) return null;
  const row = await supabaseMarkInvoicePaid(invoiceId);
  return row ? mapRow(row) : null;
}

function estimateAmount(weight: string) {
  const w = parseFloat(weight) || 15;
  return `${(18 + w * 0.35).toFixed(1)} triệu`;
}
