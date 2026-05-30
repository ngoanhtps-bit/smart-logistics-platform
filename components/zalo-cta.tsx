import { MessageCircle } from "lucide-react";
import { site } from "@/lib/data";

export function ZaloCta() {
  const zaloLink = `https://zalo.me/${site.zalo.replace(/\s/g, "")}`;

  return (
    <a
      href={zaloLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-full bg-[#0068ff] px-4 py-3 text-sm font-black text-white shadow-xl transition hover:scale-105"
      aria-label="Chat Zalo"
    >
      <MessageCircle size={20} />
      <span className="hidden sm:inline">Zalo báo giá</span>
    </a>
  );
}
