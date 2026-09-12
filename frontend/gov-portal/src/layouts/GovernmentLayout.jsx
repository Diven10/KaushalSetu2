import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutGrid, Map, Sparkles, Route, AlertTriangle, SlidersHorizontal, FileBarChart, Bell, ShieldCheck,
} from 'lucide-react';
import { nowStamp } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/kaushalsetu-logo.png';

const NAV_ITEMS = [
  { to: '/overview', label: 'Overview', icon: LayoutGrid },
  { to: '/districts', label: 'District Intelligence', icon: Map },
  { to: '/skills', label: 'Skill Intelligence', icon: Sparkles },
  { to: '/career-outcomes', label: 'Career Outcomes', icon: Route },
  { to: '/early-warning', label: 'Early Warning', icon: AlertTriangle },
  { to: '/policy-simulator', label: 'Policy Simulator', icon: SlidersHorizontal },
  { to: '/impact', label: 'Impact & Reports', icon: FileBarChart },
];

const TITLES = {
  '/overview': 'Government Overview',
  '/districts': 'District Intelligence',
  '/skills': 'Skill Intelligence',
  '/career-outcomes': 'Career Outcomes',
  '/early-warning': 'Early Warning',
  '/policy-simulator': 'Policy What-If Simulator',
  '/impact': 'Impact & Reports',
};

function currentTitle(pathname) {
  if (TITLES[pathname]) return TITLES[pathname];
  const match = Object.keys(TITLES).find((k) => pathname.startsWith(k));
  if (pathname.startsWith('/districts/')) return 'District Intelligence';
  if (pathname.startsWith('/early-warning/')) return 'Early Warning Detail';
  return match ? TITLES[match] : 'KaushalSetu';
}

export default function GovernmentLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const initials = (user?.name || user?.email || 'GM').slice(0, 2).toUpperCase();

  const location = useLocation();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: 250, flexShrink: 0, background: 'var(--navy-900)', color: 'var(--white)',
        display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh',
      }}
      >
        <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={logo} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 0.3 }}>KaushalSetu</span>
          </div>
          <div style={{ fontSize: 11.5, color: '#8fa3bd', marginTop: 3 }}>Government Intelligence</div>
        </div>

        <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 6,
                fontSize: 13.5, fontWeight: 500, color: isActive ? 'var(--white)' : '#b7c4d6',
                background: isActive ? 'rgba(30,86,160,0.55)' : 'transparent',
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 12 }}>
          <div style={{ color: '#8fa3bd', marginBottom: 6 }}>Government of Maharashtra</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#7fd39b' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7fd39b' }} />
            System Online
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{
          height: 60, borderBottom: '1px solid var(--grey-200)', background: 'var(--white)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
          position: 'sticky', top: 0, zIndex: 10,
        }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy-900)' }}>{currentTitle(location.pathname)}</div>
            <div style={{ fontSize: 11.5, color: 'var(--grey-500)' }}>KaushalSetu / {currentTitle(location.pathname)}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ fontSize: 12, color: 'var(--grey-500)' }}>Last updated: {nowStamp()}</span>
            <Bell size={17} color="var(--charcoal-600)" />
            <div
              title={user?.email || 'Government account'}
              style={{
                width: 30, height: 30, borderRadius: '50%', background: 'var(--gov-blue-light)',
                color: 'var(--gov-blue-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12.5, fontWeight: 700,
              }}
            >
              {initials}
            </div>
            {isAuthenticated && (
              <button
                type="button"
                onClick={logout}
                style={{
                  fontSize: 12, color: 'var(--grey-500)', background: 'none',
                  border: 'none', cursor: 'pointer', padding: 0,
                }}
              >
                Sign out
              </button>
            )}
          </div>
        </header>

        <main style={{ flex: 1, padding: '22px 24px', background: 'var(--grey-50)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
