"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AppNav from "@/components/AppNav";
import Footer from "@/components/Footer";

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hideNav = pathname === "/overlay" && searchParams.get("obs") === "1";

  return (
    <div className="flex min-h-screen flex-col">
      {!hideNav ? <AppNav /> : null}
      <div className="flex flex-1 flex-col">{children}</div>
      {!hideNav ? <Footer /> : null}
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <AppShellInner>{children}</AppShellInner>
    </Suspense>
  );
}
