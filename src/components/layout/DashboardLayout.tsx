"use client";

import { Sidebar } from "./Sidebar";
import { FloatingMic } from "../voice/FloatingMic";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
      <FloatingMic />
    </div>
  );
}
