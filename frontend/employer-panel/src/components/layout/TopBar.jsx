import React from "react";

// The Government Portal's header: 60px, hairline bottom border, page title
// with a quieter line underneath, actions on the right.
export default function TopBar({ title, subtitle, children }) {
  return (
    <header className="sticky top-0 z-10 flex min-h-[60px] shrink-0 items-center justify-between gap-4 border-b border-line bg-surface px-6">
      <div className="min-w-0">
        <div className="truncate text-[15px] font-bold text-navy-900">{title}</div>
        {subtitle && <div className="truncate text-[11.5px] text-ink-faint">{subtitle}</div>}
      </div>
      {children && <div className="flex shrink-0 items-center gap-3">{children}</div>}
    </header>
  );
}
