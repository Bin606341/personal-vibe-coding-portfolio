import { Trophy, Dumbbell, ClipboardList, Flame, Users, Home, Goal } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: '作品集', icon: Home },
  { to: '/basketball', label: '篮球网站', icon: Goal },
  { to: '/players', label: '现役球员', icon: Users },
  { to: '/hall', label: '名人堂', icon: Trophy },
  { to: '/training', label: '教学区', icon: Dumbbell },
  { to: '/tactics', label: '战术区', icon: ClipboardList },
  { to: '/clutch', label: '经典绝杀', icon: Flame },
];

export const Layout = () => (
  <div className="app-shell">
    <header className="topbar">
      <NavLink className="brand" to="/" aria-label="返回首页">
        <span className="brand-mark">HV</span>
        <span>
          <strong>Portfolio</strong>
          <small>前端作品集</small>
        </span>
      </NavLink>
      <nav className="main-nav" aria-label="主导航">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <Icon size={17} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </header>
    <main>
      <Outlet />
    </main>
  </div>
);
