import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Sparkles,
  Megaphone,
  BookOpen,
  Users,
  ShoppingCart,
  BarChart3,
  Zap,
  Brain,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
} from 'lucide-react';
import logo from '../../assets/logo.png';
import './Sidebar.css';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { path: '/', label: 'Overview', icon: LayoutDashboard },
      { path: '/products', label: 'Products', icon: Package },
      { path: '/inventory', label: 'Inventory', icon: Warehouse, badge: 2 },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { path: '/ai-studio', label: 'AI Studio', icon: Sparkles },
      { path: '/marketing', label: 'Marketing', icon: Megaphone },
      { path: '/catalogs', label: 'Catalogs', icon: BookOpen },
    ],
  },
  {
    label: 'Business',
    items: [
      { path: '/customers', label: 'Customers', icon: Users },
      { path: '/orders', label: 'Orders', icon: ShoppingCart, badge: 1 },
      { path: '/analytics', label: 'Analytics', icon: BarChart3 },
      { path: '/automations', label: 'Automations', icon: Zap },
    ],
  },
  {
    label: 'Settings',
    items: [
      { path: '/brand-memory', label: 'Brand Memory', icon: Brain },
      { path: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Sidebar({ collapsed, mobileOpen, onToggleCollapse, onCloseMobile }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      <div
        className={`sidebar-overlay ${mobileOpen ? 'visible' : ''}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <img src={logo} alt="BazaarBrain" className="sidebar-brand-logo" />
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">BazaarBrain</span>
            <span className="sidebar-brand-sub">Commerce Intelligence</span>
          </div>
        </div>

        {/* Workspace Switcher */}
        <div className="sidebar-workspace" role="button" tabIndex={0}>
          <div className="workspace-avatar">FF</div>
          <div className="workspace-info">
            <div className="workspace-name">FarmFresh Store</div>
            <div className="workspace-type">Local Business</div>
          </div>
          <ChevronDown size={14} className="workspace-chevron" style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_GROUPS.map((group) => (
            <div className="nav-group" key={group.label}>
              <div className="nav-group-label">{group.label}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-item ${isActive && (item.path === '/' ? location.pathname === '/' : true) ? 'active' : ''}`
                  }
                  end={item.path === '/'}
                  onClick={onCloseMobile}
                >
                  <item.icon size={18} className="nav-item-icon" />
                  <span className="nav-item-label">{item.label}</span>
                  {item.badge ? <span className="nav-item-badge">{item.badge}</span> : null}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer / Collapse Toggle */}
        <div className="sidebar-footer">
          <button className="sidebar-toggle" onClick={onToggleCollapse} aria-label="Toggle sidebar">
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
            <span>{collapsed ? '' : 'Collapse'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
