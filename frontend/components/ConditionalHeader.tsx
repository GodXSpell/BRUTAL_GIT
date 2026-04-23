"use client";

import { usePathname } from "next/navigation";
import { TopNavBar } from "@/components/TopNavBar";

export function ConditionalHeader() {
  const pathname = usePathname();
  // Hide header on dashboard and settings page
  if (pathname === "/dashboard" || pathname === "/settings") {
    return null;
  }
  return <TopNavBar />;
}
