"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AppNav from "@/components/AppNav";

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hideNav = pathname === "/overlay" && searchParams.get("obs") === "1";

  return (
    <>
      {!hideNav ? <AppNav /> : null}
      {children}
    </>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <AppShellInner>{children}</AppShellInner>
    </Suspense>
  );
}
