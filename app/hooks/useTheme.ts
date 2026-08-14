"use client";
import { useState, useEffect } from "react";

export type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // Load saved theme or detect system preference
    const saved = localStorage.getItem("my-assistant-theme") as Theme | null;
    if (saved) {
      applyTheme(saved);
      setTheme(saved);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial: Theme = prefersDark ? "dark" : "light";
      applyTheme(initial);
      setTheme(initial);
    }
  }, []);

  function applyTheme(t: Theme) {
    document.documentElement.setAttribute("data-theme", t);
  }

  function toggleTheme() {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem("my-assistant-theme", next);
      return next;
    });
  }

  return { theme, toggleTheme };
}
