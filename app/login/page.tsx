import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { LoginAlerts } from "@/components/login-alerts";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập khách hàng, điều phối, quản trị hoặc tài xế."
};

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[80vh] bg-[#eef5fb] py-16">
        <div className="container">
          <Link href="/" className="text-sm font-bold text-[#2563eb]">
            ← Về trang chủ
          </Link>
          <div className="mt-8">
            <LoginAlerts />
            <AuthForm mode="login" />
          </div>
        </div>
      </main>
    </>
  );
}
