import { useState } from 'react';
import { Search, Users, Phone, Mail, MapPin, UserPlus } from 'lucide-react';
import { getCustomers, formatCurrency } from '../../services/dataService';
import '../../components/ui/components.css';
import '../shared/placeholder.css';

const FOLLOWUP_BADGE: Record<string, string> = {
  pending:   'badge-warning',
  contacted: 'badge-info',
  converted: 'badge-success',
  lost:      'badge-neutral',
};

export default function CustomersPage() {
  const customers = getCustomers();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
    const matchFilter = filter === 'all' || c.followUpStatus === filter;
    return matchSearch && matchFilter;
  });

  const totalSpent = customers.reduce((s, c) => s + c.totalSpent, 0);

  return (
    <div className="placeholder-page">
      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-text">
            <h1>Customers</h1>
            <p>Manage customer contacts, follow-ups, and order history.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary">
              <UserPlus size={15} className="btn-icon" /> Add Customer
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Customers</span>
            <div className="stat-card-icon sage"><Users size={17} /></div>
          </div>
          <div className="stat-card-value">{customers.length}</div>
          <div className="stat-card-footer">{customers.filter(c => c.followUpStatus === 'converted').length} converted</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Spent</span>
            <div className="stat-card-icon green"><Mail size={17} /></div>
          </div>
          <div className="stat-card-value">{formatCurrency(totalSpent)}</div>
          <div className="stat-card-footer">across all customers</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Pending Follow-ups</span>
            <div className="stat-card-icon amber"><Phone size={17} /></div>
          </div>
          <div className="stat-card-value">{customers.filter(c => c.followUpStatus === 'pending').length}</div>
          <div className="stat-card-footer">need attention</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-search">
          <Search size={14} className="toolbar-search-icon" />
          <input
            type="search"
            className="toolbar-input"
            placeholder="Search by name, email, phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search customers"
          />
        </div>
        <div className="filter-pills">
          {(['all', 'pending', 'contacted', 'converted', 'lost']).map(f => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Users size={22} /></div>
          <h3>{search || filter !== 'all' ? 'No customers match' : 'No customers yet'}</h3>
          <p>
            {search || filter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Add your first customer to start tracking orders and follow-ups.'}
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="table-scroll card-body-flush">
            <table className="bb-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 160 }}>Name</th>
                  <th style={{ minWidth: 180 }}>Contact</th>
                  <th style={{ minWidth: 100 }}>Location</th>
                  <th className="right" style={{ minWidth: 70 }}>Orders</th>
                  <th className="right" style={{ minWidth: 110 }}>Total Spent</th>
                  <th className="center" style={{ minWidth: 110 }}>Follow-up</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 'var(--weight-semibold)' }}>{c.name}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)' }}>
                        <Mail size={12} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                        <span style={{ color: 'var(--color-text-secondary)' }}>{c.email}</span>
                      </div>
                      {c.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          <Phone size={11} style={{ flexShrink: 0 }} />
                          {c.phone}
                        </div>
                      )}
                    </td>
                    <td>
                      {c.address ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          <MapPin size={11} style={{ flexShrink: 0 }} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{c.address}</span>
                        </div>
                      ) : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 'var(--weight-medium)' }}>
                      {c.totalOrders}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 'var(--weight-semibold)' }}>
                      {formatCurrency(c.totalSpent)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${FOLLOWUP_BADGE[c.followUpStatus] ?? 'badge-neutral'}`}>
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
