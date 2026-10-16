import { Info, TrendingUp, ShoppingCart, Package, Users } from 'lucide-react';
import { getProducts, getOrders, getCustomers, formatCurrency } from '../../services/dataService';
import '../../components/ui/components.css';
import '../shared/placeholder.css';

export default function AnalyticsPage() {
  const products  = getProducts();
  const orders    = getOrders();
  const customers = getCustomers();

  const paidOrders    = orders.filter(o => o.paymentStatus === 'paid');
  const totalRevenue  = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

  // Top products by revenue
  const topProductMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  orders.forEach(o => {
    o.items.forEach(item => {
      if (!topProductMap[item.productId]) {
        topProductMap[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
      }
      topProductMap[item.productId].qty     += item.quantity;
      topProductMap[item.productId].revenue += item.total;
    });
  });
  const topProducts = Object.values(topProductMap).sort((a, b) => b.revenue - a.revenue);

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  products.forEach(p => {
    const cat = p.category || 'Uncategorised';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  // Order status breakdown
  const statusMap: Record<string, number> = {};
  orders.forEach(o => { statusMap[o.status] = (statusMap[o.status] || 0) + 1; });

  return (
    <div className="placeholder-page">
      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-text">
            <h1>Analytics</h1>
            <p>Business insights derived from your product, order, and customer data.</p>
          </div>
        </div>
      </div>

      <div className="demo-notice">
        <Info size={13} />
        <span>Analytics reflect real data from your localStorage. Add products and orders to see live metrics.</span>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Revenue</span>
            <div className="stat-card-icon green"><TrendingUp size={17} /></div>
          </div>
          <div className="stat-card-value">{formatCurrency(totalRevenue)}</div>
          <div className="stat-card-footer">{paidOrders.length} paid orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Avg. Order Value</span>
            <div className="stat-card-icon blue"><ShoppingCart size={17} /></div>
          </div>
          <div className="stat-card-value">{formatCurrency(avgOrderValue)}</div>
          <div className="stat-card-footer">across paid orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Products</span>
            <div className="stat-card-icon sage"><Package size={17} /></div>
          </div>
          <div className="stat-card-value">{products.length}</div>
          <div className="stat-card-footer">{products.filter(p => p.status === 'active').length} active</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Customers</span>
            <div className="stat-card-icon amber"><Users size={17} /></div>
          </div>
          <div className="stat-card-value">{customers.length}</div>
          <div className="stat-card-footer">registered contacts</div>
        </div>
      </div>

      {/* Grid */}
      <div className="dashboard-grid">
        {/* Top Products */}
        <div className="card">
          <div className="card-header"><h3>Top Products by Revenue</h3></div>
          <div className="table-scroll card-body-flush">
            {topProducts.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <p>No order data yet. Process orders to see top products.</p>
              </div>
            ) : (
              <table className="bb-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th className="right">Qty Sold</th>
                    <th className="right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.slice(0, 8).map((p, i) => (
                    <tr key={p.name}>
                      <td style={{ color: 'var(--color-text-muted)', width: 32 }}>{i + 1}</td>
                      <td style={{ fontWeight: 'var(--weight-medium)' }}>{p.name}</td>
                      <td style={{ textAlign: 'right', color: 'var(--color-text-secondary)' }}>{p.qty}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'var(--weight-semibold)' }}>{formatCurrency(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <div className="card-header"><h3>Category Breakdown</h3></div>
          <div className="card-body">
            {categories.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                Add products to see category data.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {categories.map(([cat, count]) => {
                  const pct = Math.round((count / products.length) * 100);
                  return (
                    <div key={cat}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 'var(--text-sm)' }}>
                        <span style={{ fontWeight: 'var(--weight-medium)' }}>{cat}</span>
                        <span style={{ color: 'var(--color-text-muted)' }}>{count} · {pct}%</span>
                      </div>
                      <div style={{
                        height: 6, borderRadius: 'var(--radius-pill)',
                        background: 'var(--color-bg-muted)', overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%', width: `${pct}%`,
                          background: 'var(--bb-sage)',
                          borderRadius: 'var(--radius-pill)',
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="card">
          <div className="card-header"><h3>Order Status Distribution</h3></div>
          <div className="card-body">
            {orders.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>No orders yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {Object.entries(statusMap).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
                  <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-border-light)', fontSize: 'var(--text-sm)' }}>
                    <span className={`badge ${
                      status === 'delivered' ? 'badge-success'
                      : status === 'pending' ? 'badge-warning'
                      : status === 'cancelled' ? 'badge-error'
                      : 'badge-info'
                    }`}>{status}</span>
                    <span style={{ fontWeight: 'var(--weight-semibold)' }}>{count} orders</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Inventory Health */}
        <div className="card">
          <div className="card-header"><h3>Inventory Health</h3></div>
          <div className="card-body">
            {(() => {
              const active    = products.filter(p => p.status === 'active');
              const outOfStock = active.filter(p => p.stock === 0);
              const lowStock   = active.filter(p => p.stock > 0 && p.stock <= p.minStock);
              const healthy    = active.filter(p => p.stock > p.minStock);
              const totalInvVal = products.reduce((s, p) => s + p.stock * p.costPrice, 0);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {[
                    { label: 'Healthy Stock',  count: healthy.length,    badge: 'badge-success' },
                    { label: 'Low Stock',       count: lowStock.length,   badge: 'badge-warning' },
                    { label: 'Out of Stock',    count: outOfStock.length, badge: 'badge-error'   },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-border-light)', fontSize: 'var(--text-sm)' }}>
                      <span className={`badge ${row.badge}`}>{row.label}</span>
                      <span style={{ fontWeight: 'var(--weight-semibold)' }}>{row.count} SKUs</span>
                    </div>
                  ))}
                  <div style={{ paddingTop: 'var(--space-2)', fontSize: 'var(--text-sm)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Total Inventory Value</span>
                    <span style={{ fontWeight: 'var(--weight-bold)' }}>{formatCurrency(totalInvVal)}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
