import React from "react";
import NotificationBell from "../notifications/NotificationBell";
import LanguageToggle from "../common/LanguageToggle";

// The Government Portal's header: 60px, hairline bottom border, page title
// with a quieter breadcrumb underneath, utilities on the right.
//
// The notification bell and language toggle moved here from the sidebar —
// they were built for a light background, and the rail is now navy.
export default function TopBar({ title, subtitle, children }) {
  return (
    <header className="sticky top-0 z-10 flex h-[60px] shrink-0 items-center justify-between gap-4 border-b border-line bg-surface px-6">
      <div className="min-w-0">
        <div className="truncate text-[15px] font-bold text-navy-900">{title}</div>
        {subtitle && <div className="truncate text-[11.5px] text-ink-faint">{subtitle}</div>}
      </div>
      <div className="flex shrink-0 items-center gap-4">
        {children}
        <LanguageToggle />
        <NotificationBell />
      </div>
    </header>
  );
}
