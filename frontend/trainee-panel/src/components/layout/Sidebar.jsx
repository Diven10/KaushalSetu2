import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutGrid, MessageCircle, UserRound, Route, Sparkles as SkillIcon, Briefcase, ClipboardList, LogOut,
} from "lucide-react";
import logo from "../../assets/kaushalsetu-logo.png";
import { useProfile } from "../../context/ProfileContext";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

// The navy rail from the Government Portal. Same proportions (250px, 22px
// header padding, 9px nav rows) so the two products read as one platform.
export default function Sidebar() {
  const { profile, overallCompleteness } = useProfile();
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const name = profile.identity.fullName || user?.name || "Trainee";

  const NAV_ITEMS = [
    { to: "/", label: t("nav_dashboard"), icon: LayoutGrid, end: true },
    { to: "/assistant", label: t("nav_assistant"), icon: MessageCircle },
    { to: "/profile", label: t("nav_profile"), icon: UserRound },
    { to: "/journey", label: t("nav_journey"), icon: Route },
    { to: "/skills", label: t("nav_skills"), icon: SkillIcon },
    { to: "/applications", label: t("nav_applications"), icon: Briefcase },
    { to: "/assessments", label: t("nav_assessments"), icon: ClipboardList },
  ];

  return (
    <aside className="flex h-full w-[250px] shrink-0 flex-col bg-navy-900 text-white">
      <div className="border-b border-rail-line px-5 pb-[18px] pt-[22px]">
        <div className="flex items-center gap-2">
          <img src={logo} alt="" className="h-6 w-6 object-contain" />
          <span className="text-[16px] font-bold tracking-[0.3px]">{t("appName")}</span>
        </div>
        <div className="mt-[3px] text-[11.5px] text-rail-muted">{t("appTagline")}</div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 py-3.5 scrollbar-thin" aria-label="Primary">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-md px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                isActive ? "bg-rail-active text-white" : "text-rail-text hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon size={16} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-rail-line px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[12.5px] font-bold text-accent-dark">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-medium text-white">{name}</p>
            <p className="text-[11px] text-rail-muted">
              <span className="figure">{overallCompleteness}%</span> profile complete
            </p>
          </div>
          {isAuthenticated && (
            <button
              type="button"
              onClick={logout}
              title="Sign out"
              aria-label="Sign out"
              className="shrink-0 rounded-md p-1.5 text-rail-muted transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut size={15} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
