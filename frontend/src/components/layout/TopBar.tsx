import { useLocation } from 'react-router-dom';
import { Search, Bell, HelpCircle, Menu } from 'lucide-react';
import './TopBar.css';

interface TopBarProps {
  sidebarCollapsed: boolean;
  onOpenMobileSidebar: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  '/':             'Overview',
  '/products':     'Products',
  '/inventory':    'Inventory',
  '/ai-studio':    'AI Studio',
  '/marketing':    'Marketing',
  '/catalogs':     'Catalogs',
  '/customers':    'Customers',
  '/orders':       'Orders',
  '/analytics':    'Analytics',
  '/automations':  'Automations',
  '/brand-memory': 'Brand Memory',
  '/settings':     'Settings',
};

export default function TopBar({ sidebarCollapsed, onOpenMobileSidebar }: TopBarProps) {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'BazaarBrain';

  return (
    <header className={`topbar ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      <button
        className="topbar-mobile-menu"
        onClick={onOpenMobileSidebar}
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

      <div className="topbar-title-area">
        <span className="topbar-page-title">{pageTitle}</span>
      </div>

      <div className="topbar-search">
        <Search size={15} className="topbar-search-icon" />
        <input
          className="topbar-search-input"
          type="search"
          placeholder="Search products, orders, customers…"
          aria-label="Global search"
        />
        <span className="topbar-search-shortcut" aria-hidden="true">⌘K</span>
      </div>

      <div className="topbar-actions">
        <button className="topbar-action-btn" aria-label="Notifications">
          <Bell size={17} />
          <span className="topbar-notification-dot" aria-hidden="true" />
        </button>
        <button className="topbar-action-btn" aria-label="Help">
          <HelpCircle size={17} />
        </button>
        <div className="topbar-divider" aria-hidden="true" />
        <button className="topbar-user" aria-label="User menu">
          <div className="topbar-user-avatar" aria-hidden="true">BB</div>
          <span className="topbar-user-name">Admin</span>
        </button>
      </div>
    </header>
  );
}
