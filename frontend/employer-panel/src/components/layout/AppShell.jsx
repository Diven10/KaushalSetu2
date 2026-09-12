import React from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-paper">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">{children}</div>
    </div>
  );
}
