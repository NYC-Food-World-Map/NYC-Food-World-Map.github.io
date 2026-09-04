"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "世界地图" },
  { href: "/list", label: "列表" },
  { href: "/regions", label: "餐饮走廊" },
] as const;

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="z-30 shrink-0 border-b border-[color:var(--line)] bg-[color:var(--background)]/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full items-center justify-between gap-3 px-3 py-2 sm:px-4">
        <Link
          href="/"
          className="font-serif text-lg font-semibold text-[color:var(--foreground)] no-underline sm:text-xl"
        >
          纽约世界美食地图
        </Link>
        <nav aria-label="主要视角" className="flex flex-wrap justify-end gap-1.5">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/" || pathname === "/world-map"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-2.5 py-1.5 text-sm font-medium no-underline transition-colors ${
                  active
                    ? "bg-[color:var(--primary)] text-[color:var(--on-primary)]"
                    : "bg-[color:var(--card)] text-[color:var(--foreground)] ring-1 ring-[color:var(--line)] hover:bg-[color:var(--primary-soft)] hover:text-[color:var(--on-primary)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
