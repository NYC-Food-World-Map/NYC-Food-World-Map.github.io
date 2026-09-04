"use client";

import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMap = pathname === "/" || pathname === "/world-map";

  return (
    <main
      id="main"
      className={
        isMap
          ? "flex h-full min-h-0 flex-1 flex-col overflow-hidden"
          : "mx-auto w-full max-w-6xl flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8"
      }
    >
      {children}
    </main>
  );
}
