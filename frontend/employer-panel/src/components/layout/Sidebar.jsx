import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutGrid, Briefcase, Users, BarChart2, LogOut, ClipboardList, ShieldCheck } from "lucide-react";
import logo from "../../assets/kaushalsetu-logo.png";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/postings", label: "My Postings", icon: Briefcase },
  { to: "/applications", label: "Applications", icon: Users },
  { to: "/assessments", label: "Test & PS", icon: ClipboardList },
  { to: "/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/verification", label: "Verification", icon: ShieldCheck },
];

// The navy rail from the Government Portal — same 250px width, spacing and
// active-state treatment, so the platform reads as one product.
export default function Sidebar() {
  const { user, employer, logout } = useAuth();
  const name = employer?.company_name || user?.name || user?.email || "Employer";

  return (
    <aside className="flex h-full w-[250px] shrink-0 flex-col bg-navy-900 text-white">
      <div className="border-b border-rail-line px-5 pb-[18px] pt-[22px]">
        <div className="flex items-center gap-2">
          <img src={logo} alt="" className="h-6 w-6 object-contain" />
          <span className="text-[16px] font-bold tracking-[0.3px]">KaushalSetu</span>
        </div>
        <div className="mt-[3px] text-[11.5px] text-rail-muted">Training Centre</div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-2.5 py-3.5" aria-label="Primary">
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
            <p className="text-[11px] text-rail-muted">Employer account</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            aria-label="Sign out"
            className="shrink-0 rounded-md p-1.5 text-rail-muted transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut size={15} strokeWidth={2} />
          </button>
        </div>
      </div>
    </aside>
  );
}
