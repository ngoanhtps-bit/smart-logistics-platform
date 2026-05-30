#!/usr/bin/env node
/**
 * Tạo 4 tài khoản demo trong Supabase Auth (production/staging).
 *
 * Cần env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Chạy: node --env-file=.env.local scripts/create-demo-auth-users.mjs
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const demos = [
  { email: "customer@demo.vn", password: "demo1234", role: "customer", name: "Khách hàng Demo", legacyId: "u1" },
  { email: "dispatcher@demo.vn", password: "demo1234", role: "dispatcher", name: "Điều phối Demo", legacyId: "u2" },
  { email: "admin@demo.vn", password: "demo1234", role: "admin", name: "Quản trị Demo", legacyId: "u3" },
  { email: "driver@demo.vn", password: "demo1234", role: "driver", name: "Tài xế Demo", legacyId: "u4", phone: "0901111222" }
];

async function adminFetch(path, options = {}) {
  const res = await fetch(`${url}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      "Content-Type": "application/json",
      ...options.headers
    }
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json };
}

async function upsertPublicUser({ id, email, name, role, phone }) {
  const res = await adminFetch("/rest/v1/users", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({
      id,
      email: email.toLowerCase(),
      name,
      role,
      password: "supabase-auth",
      phone: phone ?? null
    })
  });
  return res;
}

async function main() {
  console.log("Tạo user demo Supabase Auth...\n");

  for (const d of demos) {
    const create = await adminFetch("/auth/v1/admin/users", {
      method: "POST",
      body: JSON.stringify({
        email: d.email,
        password: d.password,
        email_confirm: true,
        user_metadata: { name: d.name, role: d.role, phone: d.phone ?? null }
      })
    });

    let userId = create.json?.id ?? create.json?.user?.id;

    if (!create.ok) {
      const list = await adminFetch("/auth/v1/admin/users?per_page=1000");
      const found = list.json?.users?.find((u) => u.email?.toLowerCase() === d.email.toLowerCase());
      if (found) {
        userId = found.id;
        await adminFetch(`/auth/v1/admin/users/${userId}`, {
          method: "PUT",
          body: JSON.stringify({
            password: d.password,
            user_metadata: { name: d.name, role: d.role }
          })
        });
        console.log(`↻ Cập nhật Auth: ${d.email}`);
      } else {
        console.error(`✗ ${d.email}:`, create.json);
        continue;
      }
    } else {
      console.log(`✓ Auth: ${d.email}`);
    }

    const profile = await upsertPublicUser({
      id: userId,
      email: d.email,
      name: d.name,
      role: d.role,
      phone: d.phone
    });

    if (!profile.ok) {
      console.warn(`  ⚠ public.users:`, profile.json);
    }

    if (d.role === "driver" && userId) {
      const driverRes = await adminFetch("/rest/v1/drivers", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({
          id: "d1",
          user_id: userId,
          license_number: "GPLX-DEMO-01",
          vehicle_id: "v1"
        })
      });
      if (!driverRes.ok) {
        await adminFetch("/rest/v1/drivers?id=eq.d1", {
          method: "PATCH",
          body: JSON.stringify({ user_id: userId })
        });
      }
    }
  }

  console.log("\nXong. Đăng nhập: *@demo.vn / demo1234\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
