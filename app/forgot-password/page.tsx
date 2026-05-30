import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Quên mật khẩu",
  description: "Gửi email đặt lại mật khẩu tài khoản Logistics Thông minh."
};

export default function ForgotPasswordPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[80vh] bg-[#eef5fb] py-16">
        <div className="container">
          <Link href="/login" className="text-sm font-bold text-[#2563eb]">
            ← Đăng nhập
          </Link>
          <div className="mt-8">
            <ForgotPasswordForm />
          </div>
        </div>
      </main>
    </>
  );
}
