"use client";



import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Check, Loader2, Plus, UserPlus, X } from "lucide-react";
import { accountStatusLabel } from "@/lib/auth/account-status";
import type { AccountStatus } from "@/types/logistics";

import { useMemo, useState } from "react";
import { ListToolbar, RowCheckbox } from "@/components/list-toolbar";
import { useBulkSelect } from "@/hooks/use-bulk-select";
import { matchesSearch } from "@/lib/list-search";

import type { UserRole } from "@/types/logistics";

import { roleLabelsVi } from "@/lib/vi-labels";



type DbUser = {

  id: string;

  email: string;

  name: string;

  role: UserRole;

  phone: string | null;

  accountStatus: AccountStatus;

};



const emptyCreate = {

  email: "",

  password: "",

  name: "",

  phone: "",

  role: "customer" as UserRole,

  licenseNumber: ""

};



export function AdminUsersTab({ globalSearch = "" }: { globalSearch?: string }) {

  const qc = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);

  const [createForm, setCreateForm] = useState(emptyCreate);

  const [msg, setMsg] = useState("");
  const [msgOk, setMsgOk] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");




  const { data, isLoading, error } = useQuery({

    queryKey: ["admin-users"],

    queryFn: async () => {

      const res = await fetch("/api/admin/users", { credentials: "include" });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message ?? "Lỗi tải users");

      return json as { users: DbUser[]; pendingCount?: number };

    }

  });



  const createMut = useMutation({

    mutationFn: async () => {

      const res = await fetch("/api/admin/users", {

        method: "POST",

        credentials: "include",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          email: createForm.email,

          password: createForm.password,

          name: createForm.name,

          phone: createForm.phone || undefined,

          role: createForm.role,

          licenseNumber: createForm.role === "driver" ? createForm.licenseNumber : undefined

        })

      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message ?? "Tạo tài khoản thất bại");

      return json as { user: DbUser; message: string };

    },

    onSuccess: (data) => {
      setMsgOk(true);
      setMsg(data.message);
      setCreateForm(emptyCreate);
      setShowCreate(false);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e) => {
      setMsgOk(false);
      setMsg((e as Error).message);
    }
  });



  const statusMut = useMutation({
    mutationFn: async ({ id, accountStatus }: { id: string; accountStatus: AccountStatus }) => {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, accountStatus })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      return json as { message?: string };
    },
    onSuccess: (data) => {
      setMsgOk(true);
      setMsg(data.message ?? "Đã cập nhật trạng thái.");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e) => {
      setMsgOk(false);
      setMsg((e as Error).message);
    }
  });

  const updateMut = useMutation({

    mutationFn: async ({ id, role }: { id: string; role: UserRole }) => {

      const res = await fetch("/api/admin/users", {

        method: "PATCH",

        credentials: "include",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ id, role })

      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message);

      return json;

    },

    onSuccess: () => {
      setMsgOk(true);
      setMsg("Đã cập nhật vai trò.");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e) => {
      setMsgOk(false);
      setMsg((e as Error).message);
    }
  });

  const combinedSearch = [globalSearch, search].filter(Boolean).join(" ");

  const filteredUsers = useMemo(() => {
    const list = data?.users ?? [];
    return list.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      return matchesSearch(combinedSearch, [u.name, u.email, u.phone, u.role, roleLabelsVi[u.role]]);
    });
  }, [data?.users, combinedSearch, roleFilter]);

  const bulk = useBulkSelect(filteredUsers);

  const deleteMut = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Xóa thất bại");
      return json as { message: string };
    },
    onSuccess: (data) => {
      setMsgOk(true);
      setMsg(data.message);
      bulk.clear();
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e) => {
      setMsgOk(false);
      setMsg((e as Error).message);
    }
  });

  function confirmBulkDeleteUsers() {
    if (!bulk.selectedIds.length) return;
    if (!window.confirm(`Xóa ${bulk.selectedIds.length} tài khoản đã chọn? Không hoàn tác được.`)) return;
    deleteMut.mutate(bulk.selectedIds);
  }

  if (isLoading) {

    return (

      <p className="flex items-center gap-2 text-slate-500">

        <Loader2 className="animate-spin" size={18} /> Đang tải người dùng...

      </p>

    );

  }



  if (error) {

    return (

      <p className="rounded-xl bg-amber-50 p-4 text-sm font-bold text-amber-800">

        {(error as Error).message}. Thêm <code>SUPABASE_SERVICE_ROLE_KEY</code> vào Vercel rồi redeploy.

      </p>

    );

  }



  return (

    <section className="rounded-3xl border border-slate-200 bg-white p-6">

      <div className="flex flex-wrap items-start justify-between gap-3">

        <div>

          <h2 className="text-xl font-black text-[#102033]">Người dùng & phân quyền</h2>

          <p className="mt-1 text-sm text-slate-500">

            Duyệt đăng ký điều phối/tài xế, tạo tài khoản, hoặc đổi vai trò.
            {(data?.pendingCount ?? 0) > 0 ? (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-black text-amber-800">
                {data?.pendingCount} chờ duyệt
              </span>
            ) : null}

          </p>

        </div>

        <button

          className="btn-primary flex items-center gap-2 text-sm md:w-auto"

          type="button"

          onClick={() => {

            setShowCreate(!showCreate);

            setMsg("");

          }}

        >

          {showCreate ? <Plus size={16} /> : <UserPlus size={16} />}

          {showCreate ? "Đóng form" : "Tạo tài khoản"}

        </button>

      </div>



      {showCreate ? (

        <div className="mt-6 grid gap-3 rounded-2xl border border-emerald-100 bg-[#f0fdf4] p-4 md:grid-cols-2">

          <label className="block md:col-span-2">

            <span className="text-xs font-bold uppercase text-slate-500">Vai trò</span>

            <select

              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold"

              value={createForm.role}

              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as UserRole })}

            >

              {(["customer", "dispatcher", "driver", "admin"] as UserRole[]).map((r) => (

                <option key={r} value={r}>

                  {roleLabelsVi[r] ?? r}

                </option>

              ))}

            </select>

          </label>

          <label className="block">

            <span className="text-xs font-bold uppercase text-slate-500">Họ tên *</span>

            <input

              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"

              value={createForm.name}

              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}

              placeholder="Nguyễn Văn A"

            />

          </label>

          <label className="block">

            <span className="text-xs font-bold uppercase text-slate-500">Số điện thoại</span>

            <input

              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"

              type="tel"

              value={createForm.phone}

              onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}

            />

          </label>

          <label className="block md:col-span-2">

            <span className="text-xs font-bold uppercase text-slate-500">Email *</span>

            <input

              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"

              type="email"

              value={createForm.email}

              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}

              placeholder="nhanvien@congty.vn"

            />

          </label>

          <label className="block md:col-span-2">

            <span className="text-xs font-bold uppercase text-slate-500">Mật khẩu * (tối thiểu 6 ký tự)</span>

            <input

              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"

              type="password"

              value={createForm.password}

              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}

              placeholder="Gửi cho nhân viên để đăng nhập /login"

              minLength={6}

            />

          </label>

          {createForm.role === "driver" ? (

            <label className="block md:col-span-2">

              <span className="text-xs font-bold uppercase text-slate-500">Số GPLX (tuỳ chọn)</span>

              <input

                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"

                value={createForm.licenseNumber}

                onChange={(e) => setCreateForm({ ...createForm, licenseNumber: e.target.value })}

                placeholder="GPLX-001"

              />

            </label>

          ) : null}

          <button

            className="btn-primary flex items-center justify-center gap-2 md:col-span-2"

            type="button"

            disabled={

              createMut.isPending ||

              !createForm.email ||

              !createForm.password ||

              createForm.password.length < 6 ||

              !createForm.name

            }

            onClick={() => createMut.mutate()}

          >

            {createMut.isPending ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}

            Tạo & gửi thông tin đăng nhập

          </button>

          <p className="text-xs text-slate-600 md:col-span-2">

            Tài khoản tạo trong <strong>Supabase Auth</strong> — đăng nhập bằng email/mật khẩu tại{" "}

            <code>/login</code>. Tài xế tự tạo dòng <code>drivers</code>. Email đã tồn tại → cập nhật mật khẩu &

            role.

          </p>

        </div>

      ) : null}



      {msg ? (

        <p

          className={`mt-4 rounded-xl p-3 text-sm font-bold ${
            msgOk ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
          }`}

        >

          {msg}

        </p>

      ) : null}



      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Tìm họ tên, email, SĐT, vai trò…"
        total={data?.users.length ?? 0}
        filtered={filteredUsers.length}
        selectedCount={bulk.selectedCount}
        allSelected={bulk.allSelected}
        onSelectAll={bulk.selectAll}
        onClearSelection={bulk.clear}
        onDeleteSelected={confirmBulkDeleteUsers}
        deleteLabel="Xóa người dùng đã chọn"
        deleting={deleteMut.isPending}
        extra={
          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "all" | UserRole)}
          >
            <option value="all">Tất cả vai trò</option>
            <option value="customer">Khách hàng</option>
            <option value="dispatcher">Điều phối</option>
            <option value="driver">Tài xế</option>
            <option value="admin">Quản trị</option>
          </select>
        }
      />

      <div className="mt-2 grid gap-3">

        {filteredUsers.map((u) => (

          <div

            key={u.id}

            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-[#f8fafc] p-4"

          >

            <div className="flex min-w-0 flex-1 gap-3">
              <RowCheckbox checked={bulk.isSelected(u.id)} onChange={() => bulk.toggle(u.id)} />
            <div>

              <p className="font-black text-[#102033]">{u.name}</p>

              <p className="text-sm text-slate-600">{u.email}</p>

              <p className="text-xs font-bold text-[#2563eb]">
                {roleLabelsVi[u.role] ?? u.role}
                <span className="mx-1">·</span>
                <span
                  className={
                    u.accountStatus === "pending"
                      ? "text-amber-600"
                      : u.accountStatus === "rejected"
                        ? "text-red-600"
                        : "text-emerald-600"
                  }
                >
                  {accountStatusLabel(u.accountStatus)}
                </span>
              </p>

              {u.phone ? <p className="text-xs text-slate-500">{u.phone}</p> : null}

            </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {u.accountStatus === "pending" ? (
                <>
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white"
                    disabled={statusMut.isPending}
                    onClick={() => statusMut.mutate({ id: u.id, accountStatus: "approved" })}
                  >
                    <Check size={14} /> Duyệt
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600"
                    disabled={statusMut.isPending}
                    onClick={() => statusMut.mutate({ id: u.id, accountStatus: "rejected" })}
                  >
                    <X size={14} /> Từ chối
                  </button>
                </>
              ) : null}
              <select
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold"
                value={u.role}
                disabled={updateMut.isPending}
                onChange={(e) => updateMut.mutate({ id: u.id, role: e.target.value as UserRole })}
              >
                {(["customer", "dispatcher", "driver", "admin"] as UserRole[]).map((r) => (
                  <option key={r} value={r}>
                    {roleLabelsVi[r] ?? r}
                  </option>
                ))}
              </select>
            </div>

          </div>

        ))}

      </div>

    </section>

  );

}


