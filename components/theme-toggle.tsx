"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";
import { useThemeStore } from "@/store/theme";

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <button
      type="button"
      className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      aria-label="Đổi giao diện"
      onClick={toggle}
    >
      {theme === "dark" ? <Sun size={18} className="text-orange-400" /> : <Moon size={18} />}
    </button>
  );
}
