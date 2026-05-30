import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Navbar } from "@/components/navbar";
import type { UserRole } from "@/types/logistics";

export const metadata: Metadata = {
  title: "Đăng ký",
  description: "Đăng ký khách hàng, điều phối hoặc tài xế."
};

type Props = { searchParams: Promise<{ role?: string }> };

export default async function RegisterPage({ searchParams }: Props) {
  const { role } = await searchParams;
  const defaultRole =
    role === "dispatcher" || role === "driver" || role === "customer" ? (role as UserRole) : undefined;

  return (
    <>
      <Navbar />
      <main className="min-h-[80vh] bg-[#eef5fb] py-16">
        <div className="container">
          <Link href="/" className="text-sm font-bold text-[#2563eb]">
            ← Về trang chủ
          </Link>
          <div className="mt-8">
            <AuthForm mode="register" defaultRole={defaultRole} />
          </div>
        </div>
      </main>
    </>
  );
}
