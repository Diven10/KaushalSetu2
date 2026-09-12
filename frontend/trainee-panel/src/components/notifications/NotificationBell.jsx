import React, { useState } from "react";
import { Bell, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppData } from "../../context/AppDataContext";
import { useLanguage } from "../../context/LanguageContext";

const SEVERITY_DOT = {
  High: "bg-warn",
  Medium: "bg-accent",
  Improving: "bg-success",
};

export default function NotificationBell() {
  const { notifications, dismissNotification } = useAppData();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-md border border-line bg-paper text-ink-soft hover:text-ink"
        aria-label={t("notifications")}
      >
        <Bell size={16} strokeWidth={2} />
        {notifications.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-warn px-1 text-[10px] font-semibold text-white">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-line bg-surface shadow-panel">
            <div className="border-b border-line px-4 py-3">
              <p className="text-sm font-semibold text-ink">{t("notifications")}</p>
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-ink-faint">{t("noNotifications")}</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="flex gap-2.5 border-b border-line-soft px-4 py-3 last:border-0">
                    <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${SEVERITY_DOT[n.severity] || "bg-ink-faint"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-ink">{n.signal}</p>
                      <p className="mt-0.5 text-[11px] text-ink-soft">{n.action}</p>
                      <div className="mt-1.5 flex items-center gap-3">
                        <Link
                          to={n.link}
                          onClick={() => setOpen(false)}
                          className="text-[11px] font-medium text-accent-dark hover:underline"
                        >
                          Open
                        </Link>
                        <button
                          type="button"
                          onClick={() => dismissNotification(n.id)}
                          className="text-[11px] text-ink-faint hover:text-ink-soft"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => dismissNotification(n.id)}
                      className="h-fit shrink-0 text-ink-faint hover:text-ink-soft"
                      aria-label="Dismiss"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
