"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  // Hide footer on dashboard, settings
  if (pathname === "/dashboard" || pathname === "/settings" || pathname === "/repositories") {
    return null;
  }
  return <Footer />;
}
