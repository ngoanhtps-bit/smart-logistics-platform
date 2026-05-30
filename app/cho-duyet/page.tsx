import type { Metadata } from "next";
import { ChoDuyetClient } from "@/components/cho-duyet-client";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Chờ duyệt tài khoản",
  description: "Tài khoản điều phối hoặc tài xế đang chờ quản trị phê duyệt."
};

export default function ChoDuyetPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-[#eef5fb] py-16">
        <div className="container max-w-lg">
          <ChoDuyetClient />
        </div>
      </main>
    </>
  );
}
