import { parseAccountStatus } from "@/lib/auth/account-status";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { getSupabaseConfig } from "@/lib/supabase/config";

import { nameFromUserMetadata } from "@/lib/auth/metadata";

import type { AccountStatus, AuthUser, UserRole } from "@/types/logistics";



const DEMO_ROLE_BY_EMAIL: Record<string, UserRole> = {

  "customer@demo.vn": "customer",

  "dispatcher@demo.vn": "dispatcher",

  "admin@demo.vn": "admin",

  "driver@demo.vn": "driver"

};



type UserRow = {

  id: string;

  email: string;

  name: string;

  role: UserRole;

  phone: string | null;

  account_status?: string | null;

};



function mapUserRow(data: UserRow): AuthUser {

  return {

    id: data.id,

    email: data.email,

    name: data.name,

    role: data.role,

    phone: data.phone ?? undefined,

    accountStatus: parseAccountStatus(data.account_status)

  };

}



export function isSupabaseAuthEnabled() {

  return getSupabaseConfig().enabled;

}



export async function upsertUserProfile(input: {

  id: string;

  email: string;

  name: string;

  role: UserRole;

  phone?: string | null;

  accountStatus?: AccountStatus;

}) {

  const admin = createSupabaseAdminClient();

  const client = admin ?? (await createSupabaseServerClient());

  if (!client) return { error: "Không kết nối được database" };



  const { error } = await client.from("users").upsert(

    {

      id: input.id,

      email: input.email.toLowerCase(),

      name: input.name,

      role: input.role,

      phone: input.phone ?? null,

      password: "supabase-auth",

      account_status: input.accountStatus ?? "approved"

    },

    { onConflict: "email" }

  );



  return { error: error?.message ?? null };

}



export async function fetchProfileById(id: string): Promise<AuthUser | null> {

  const admin = createSupabaseAdminClient();

  const client = admin ?? (await createSupabaseServerClient());

  if (!client) return null;



  const { data } = await client

    .from("users")

    .select("id, email, name, role, phone, account_status")

    .eq("id", id)

    .maybeSingle();

  if (!data) return null;



  return mapUserRow(data as UserRow);

}



export async function fetchProfileByEmail(email: string): Promise<AuthUser | null> {

  const admin = createSupabaseAdminClient();

  const client = admin ?? (await createSupabaseServerClient());

  if (!client) return null;



  const { data } = await client

    .from("users")

    .select("id, email, name, role, phone, account_status")

    .eq("email", email.trim().toLowerCase())

    .maybeSingle();

  if (!data) return null;



  return mapUserRow(data as UserRow);

}



export async function syncAuthUserRole(

  authUserId: string,

  role: UserRole,

  meta: Record<string, unknown> = {}

) {

  const admin = createSupabaseAdminClient();

  if (!admin) return;

  await admin.auth.admin.updateUserById(authUserId, {

    user_metadata: { ...meta, role }

  });

}



export function profileFromAuthMetadata(

  authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }

): AuthUser {

  const email = authUser.email ?? "";

  const meta = authUser.user_metadata ?? {};

  const role =

    (meta.role as UserRole) ??

    DEMO_ROLE_BY_EMAIL[email.toLowerCase()] ??

    "customer";



  return {

    id: authUser.id,

    email,

    name: nameFromUserMetadata(meta, email),

    role,

    phone: (meta.phone as string) ?? undefined,

    accountStatus: parseAccountStatus(meta.account_status)

  };

}



export async function resolveAuthUser(

  authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }

): Promise<AuthUser> {

  const fromDb = await fetchProfileById(authUser.id);

  if (fromDb) {

    void syncAuthUserRole(authUser.id, fromDb.role, {

      ...(authUser.user_metadata ?? {}),

      account_status: fromDb.accountStatus

    });

    return fromDb;

  }



  const email = authUser.email?.trim().toLowerCase();

  if (email) {

    const byEmail = await fetchProfileByEmail(email);

    if (byEmail) {

      const resolved: AuthUser = {

        ...byEmail,

        id: authUser.id,

        email: authUser.email ?? byEmail.email

      };

      if (byEmail.id !== authUser.id) {

        void upsertUserProfile({

          id: authUser.id,

          email: resolved.email,

          name: byEmail.name,

          role: byEmail.role,

          phone: byEmail.phone ?? null,

          accountStatus: byEmail.accountStatus

        });

      }

      void syncAuthUserRole(authUser.id, byEmail.role, {

        ...(authUser.user_metadata ?? {}),

        account_status: byEmail.accountStatus

      });

      return resolved;

    }

  }



  return profileFromAuthMetadata(authUser);

}


