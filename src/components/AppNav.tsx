"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "ホーム" },
  { href: "/library", label: "曲庫" },
  { href: "/builder", label: "作成" },
  { href: "/suggest", label: "自動提案" },
  { href: "/setlists", label: "保存一覧" },
];

export default function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-20 border-b border-violet-200/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-black tracking-tight text-violet-950">
          Setory
        </Link>
        <div className="flex flex-wrap gap-2">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  active
                    ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                    : "bg-violet-50 text-violet-800 hover:bg-violet-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
