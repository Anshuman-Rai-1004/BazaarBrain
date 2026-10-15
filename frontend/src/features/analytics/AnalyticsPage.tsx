import { Info } from 'lucide-react';
import { getProducts, getOrders, getCustomers, formatCurrency } from '../../services/dataService';
import '../../components/ui/components.css';
import '../shared/placeholder.css';
import { useMemo } from 'react';

export default function AnalyticsPage() {
  const products = useMemo(() => getProducts(), []);
  const orders = useMemo(() => getOrders(), []);
  const customers = useMemo(() => getCustomers(), []);
  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.filter(o => o.paymentStatus === 'paid').length : 0;

  const topProducts = useMemo(() => {
    const counts: Record<string, { name: string; qty: number; revenue: number }> = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        if (!counts[item.productId]) counts[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
        counts[item.productId].qty += item.quantity;
        counts[item.productId].revenue += item.total;
      });
    });
    return Object.values(counts).sort((a, b) => b.revenue - a.revenue);
  }, [orders]);

  return (
    <div className="placeholder-page">
      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-text">
            <h1>Analytics</h1>
            <p>Business insights from your product, order, and customer data.</p>
          </div>
        </div>
      </div>

      <div className="demo-notice">
        <Info size={14} />
        <span>Analytics are based on sample data. Real metrics will populate as you add products and process orders.</span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header"><span className="stat-card-label">Total Revenue (Sample)</span></div>
          <div className="stat-card-value">{formatCurrency(totalRevenue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header"><span className="stat-card-label">Avg. Order Value</span></div>
          <div className="stat-card-value">{formatCurrency(avgOrderValue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header"><span className="stat-card-label">Total Products</span></div>
          <div className="stat-card-value">{products.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header"><span className="stat-card-label">Total Customers</span></div>
          <div className="stat-card-value">{customers.length}</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header"><h3>Top Products by Revenue</h3></div>
          <div className="card-body-flush">
            {topProducts.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <p>No order data available yet.</p>
              </div>
            ) : (
              <table className="low-stock-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty Sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td>{p.qty}</td>
                      <td style={{ fontWeight: 500 }}>{formatCurrency(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Category Breakdown</h3></div>
          <div className="card-body">
            {Object.entries(
              products.reduce<Record<string, number>>((acc, p) => {
                acc[p.category] = (acc[p.category] || 0) + 1;
                return acc;
              }, {})
            ).map(([cat, count]) => (
              <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border-light)', fontSize: 'var(--text-sm)' }}>
                <span>{cat}</span>
                <span style={{ fontWeight: 500 }}>{count} products</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
