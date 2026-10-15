import { useMemo } from 'react';
import { Users, Info } from 'lucide-react';
import { getCustomers } from '../../services/dataService';
import '../../components/ui/components.css';
import '../shared/placeholder.css';

export default function CustomersPage() {
  const customers = useMemo(() => getCustomers(), []);

  return (
    <div className="placeholder-page">
      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-text">
            <h1>Customers</h1>
            <p>Manage customer contacts, inquiries, and follow-ups.</p>
          </div>
        </div>
      </div>

      <div className="demo-notice">
        <Info size={14} />
        <span>Showing sample customer data. Real customer records will appear when you create them.</span>
      </div>

      {customers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Users size={24} /></div>
          <h3>No customers yet</h3>
          <p>Add customers to track inquiries, follow-ups, and order history.</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-body-flush">
            <table className="low-stock-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Follow-up</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td>
                      <div style={{ fontSize: 'var(--text-sm)' }}>{c.email}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{c.phone}</div>
                    </td>
                    <td>{c.totalOrders}</td>
                    <td>₹{c.totalSpent.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge ${c.followUpStatus === 'converted' ? 'badge-success' : c.followUpStatus === 'pending' ? 'badge-warning' : c.followUpStatus === 'contacted' ? 'badge-info' : 'badge-neutral'}`}>
                        {c.followUpStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
