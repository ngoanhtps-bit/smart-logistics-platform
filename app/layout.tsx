import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import { ZaloCta } from "@/components/zalo-cta";
import "@fontsource/noto-sans/400.css";
import "@fontsource/noto-sans/500.css";
import "@fontsource/noto-sans/600.css";
import "@fontsource/noto-sans/700.css";
import "@fontsource/noto-sans/800.css";
import "@fontsource/noto-serif/600.css";
import "@fontsource/noto-serif/700.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://logistics-app-blue.vercel.app"),
  title: {
    default: "Vận chuyển Container - Xe tải - Mooc rào Bắc Trung Nam",
    template: "%s | Logistics Thông minh"
  },
  description:
    "Nền tảng điều phối vận tải container, xe tải và mooc rào toàn quốc với báo giá nhanh, theo dõi thời gian thực và bảng điều khiển logistics chuyên nghiệp.",
  openGraph: {
    title: "Logistics Thông minh",
    description:
      "Vận chuyển Container - Xe tải - Mooc rào Bắc Trung Nam, báo giá nhanh và theo dõi thời gian thực.",
    type: "website",
    locale: "vi_VN"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <Providers>
          {children}
          <ZaloCta />
        </Providers>
      </body>
    </html>
  );
}
