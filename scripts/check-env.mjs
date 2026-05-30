#!/usr/bin/env node
/**
 * Kiểm tra biến môi trường tối thiểu trước deploy production.
 * Chạy: node scripts/check-env.mjs
 */

const required = [
  ["NEXT_PUBLIC_SUPABASE_URL", "Supabase project URL"],
  ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "Supabase anon/publishable key"]
];

const recommended = [
  ["NEXT_PUBLIC_APP_URL", "URL production (Vercel domain)"],
  ["SUPABASE_SERVICE_ROLE_KEY", "Admin API & đồng bộ users"]
];

let failed = false;

console.log("\n=== Kiểm tra env production ===\n");

for (const [key, label] of required) {
  const ok = Boolean(process.env[key]?.trim());
  console.log(`${ok ? "✓" : "✗"} ${key} — ${label}`);
  if (!ok) failed = true;
}

console.log("\n--- Khuyến nghị ---\n");
for (const [key, label] of recommended) {
  const ok = Boolean(process.env[key]?.trim());
  console.log(`${ok ? "✓" : "○"} ${key} — ${label}`);
}

if (failed) {
  console.log("\nThiếu biến bắt buộc. Copy .env.example → .env.local và điền giá trị.\n");
  process.exit(1);
}

console.log("\nĐủ điều kiện tối thiểu. Tiếp theo: chạy SQL Supabase (001–009) và vercel --prod\n");
