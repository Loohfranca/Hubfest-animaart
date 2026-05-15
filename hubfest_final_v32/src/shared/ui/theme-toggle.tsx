"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try { localStorage.setItem("hubfest_theme", next); } catch {}
  }

  const Icon = theme === "dark" ? Sun : Moon;

  if (compact) {
    return (
      <button
        onClick={toggle}
        className="p-2 rounded-lg hover:bg-[var(--color-muted)] text-[var(--color-muted-foreground)] transition"
        aria-label="Alternar tema"
      >
        <Icon className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)] transition"
    >
      <Icon className="w-4 h-4" />
      {theme === "dark" ? "Tema claro" : "Tema escuro"}
    </button>
  );
}
