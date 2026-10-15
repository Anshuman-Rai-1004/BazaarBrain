import { useMemo } from 'react';
import { Link }    from 'react-router-dom';
import {
  Package, Warehouse, ShoppingCart, Users,
  AlertTriangle, Plus, Sparkles, BookOpen,
  TrendingUp, Info,
} from 'lucide-react';
import {
  getDashboardStats, getProducts,
  formatCurrency, formatRelativeTime,
} from '../../services/dataService';
import '../../components/ui/components.css';

export default function Dashboard() {
  const stats           = useMemo(() => getDashboardStats(), []);
  const lowStockProducts = useMemo(() =>
    getProducts().filter(p => p.stock <= p.minStock && p.status === 'active'),
    []
  );

  return (
    <div>
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2>Welcome back to FarmFresh Store</h2>
          <p>Here's what's happening with your business today.</p>
        </div>
        <div className="welcome-actions">
          <Link to="/products" className="btn btn-highlight" onClick={() => {}}>
            <Plus size={15} className="btn-icon" /> Add Product
          </Link>
          <Link
            to="/ai-studio"
            className="btn btn-ghost"
            style={{ color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.20)', background: 'rgba(255,255,255,0.08)' }}
          >
            <Sparkles size={15} className="btn-icon" /> AI Studio
          </Link>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="demo-notice">
        <Info size={13} />
        <span>Showing sample data for demonstration. Your real data will appear once you start adding products.</span>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Products</span>
            <div className="stat-card-icon sage"><Package size={17} /></div>
          </div>
          <div className="stat-card-value">{stats.totalProducts}</div>
          <div className="stat-card-footer">{stats.activeProducts} active</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Inventory Alerts</span>
            <div className="stat-card-icon red"><AlertTriangle size={17} /></div>
          </div>
          <div className="stat-card-value">{stats.lowStockCount}</div>
          <div className="stat-card-footer">low / out of stock</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Orders</span>
            <div className="stat-card-icon blue"><ShoppingCart size={17} /></div>
          </div>
          <div className="stat-card-value">{stats.totalOrders}</div>
          <div className="stat-card-footer">{stats.pendingOrders} pending</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Revenue (Sample)</span>
            <div className="stat-card-icon green"><TrendingUp size={17} /></div>
          </div>
          <div className="stat-card-value">{formatCurrency(stats.totalRevenue)}</div>
          <div className="stat-card-footer">from paid orders</div>
        </div>
      </div>

      {/* Main grid */}
      <div className="dashboard-grid">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <span className="badge badge-neutral">{stats.recentActivity.length} events</span>
          </div>
          <div className="card-body-flush">
            <ul className="activity-list">
              {stats.recentActivity.map(item => (
                <li key={item.id} className="activity-item">
                  <span className={`activity-dot ${item.type}`} />
                  <div className="activity-content">
                    <div className="activity-title">{item.title}</div>
                    <div className="activity-desc">{item.description}</div>
                  </div>
                  <span className="activity-time">{formatRelativeTime(item.timestamp)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="quick-actions">
              <Link to="/products" className="quick-action-btn">
                <div className="quick-action-icon"><Plus size={19} /></div>
                <span className="quick-action-label">Add Product</span>
              </Link>
              <Link to="/ai-studio" className="quick-action-btn">
                <div className="quick-action-icon"><Sparkles size={19} /></div>
                <span className="quick-action-label">Generate Content</span>
              </Link>
              <Link to="/catalogs" className="quick-action-btn">
                <div className="quick-action-icon"><BookOpen size={19} /></div>
                <span className="quick-action-label">Create Catalog</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card">
          <div className="card-header">
            <h3>Low Stock Alerts</h3>
            <Link to="/inventory" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div className="card-body-flush">
            {lowStockProducts.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <p>All products are well-stocked. 🎉</p>
              </div>
            ) : (
              <table className="low-stock-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock</th>
                    <th>Min</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map(p => (
                    <tr key={p.id}>
                      <td>
                        <Link to={`/products/${p.id}`} style={{ color: 'var(--color-text-primary)', textDecoration: 'none', fontWeight: 500 }}>
                          {p.name}
                        </Link>
                      </td>
                      <td style={{ fontWeight: 600, color: p.stock === 0 ? 'var(--color-error)' : 'var(--color-warning)' }}>
                        {p.stock} {p.unit}
                      </td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{p.minStock}</td>
                      <td>
                        <span className={`badge ${p.stock === 0 ? 'badge-error' : 'badge-warning'}`}>
                          {p.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Customers Overview */}
        <div className="card">
          <div className="card-header">
            <h3>Customers</h3>
            <Link to="/customers" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div className="stat-card-icon sage"><Users size={20} /></div>
              <div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{stats.totalCustomers}</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Total customers</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="card" style={{ marginTop: 'var(--space-6)' }}>
        <div className="card-header">
          <h3>Getting Started with BazaarBrain</h3>
          <span className="badge badge-lime">Guide</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
            {[
              { step: '1', title: 'Add Your Products',         desc: 'Create your catalog with descriptions, prices, and stock quantities.', link: '/products',      icon: Package  },
              { step: '2', title: 'Set Up Brand Memory',       desc: 'Configure business identity and tone for consistent AI content.',      link: '/brand-memory', icon: Sparkles },
              { step: '3', title: 'Generate AI Content',       desc: 'Create product descriptions, WhatsApp copies, and captions.',          link: '/ai-studio',    icon: Sparkles },
              { step: '4', title: 'Track Inventory',           desc: 'Monitor stock levels and get alerts for low-stock products.',           link: '/inventory',    icon: Warehouse },
            ].map(item => (
              <Link
                key={item.step}
                to={item.link}
                style={{
                  display: 'flex', gap: 'var(--space-3)',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-light)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--bb-sage)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-xs)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-subtle)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '';
                  (e.currentTarget as HTMLElement).style.boxShadow = '';
                  (e.currentTarget as HTMLElement).style.background = '';
                }}
              >
                <div className="step-badge">{item.step}</div>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
