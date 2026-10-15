import { useMemo, useState } from 'react';
import {
  ShoppingCart, Search, X, ChevronRight,
  AlertTriangle, CheckCircle, Package,
} from 'lucide-react';
import {
  getOrders, changeOrderStatus, formatCurrency, formatDate,
} from '../../services/dataService';
import type { Order } from '../../types';
import '../../components/ui/components.css';
import '../shared/placeholder.css';

/* ── Status helpers ── */
const STATUS_BADGE: Record<Order['status'], string> = {
  pending:    'badge-warning',
  confirmed:  'badge-info',
  processing: 'badge-neutral',
  shipped:    'badge-info',
  delivered:  'badge-success',
  cancelled:  'badge-error',
};

const NEXT_ACTIONS: Record<Order['status'], { label: string; next: Order['status'] }[]> = {
  pending:    [{ label: 'Confirm Order',    next: 'confirmed'  }, { label: 'Cancel', next: 'cancelled' }],
  confirmed:  [{ label: 'Mark Processing',  next: 'processing' }, { label: 'Cancel', next: 'cancelled' }],
  processing: [{ label: 'Mark Shipped',     next: 'shipped'    }],
  shipped:    [{ label: 'Mark Delivered',   next: 'delivered'  }],
  delivered:  [],
  cancelled:  [],
};

/* ── Order Detail Modal ── */
function OrderDetailModal({
  order, onClose, onStatusChange,
}: {
  order: Order;
  onClose: () => void;
  onStatusChange: () => void;
}) {
  const [err,           setErr]           = useState('');
  const [pendingAction, setPendingAction] = useState<{ label: string; next: Order['status'] } | null>(null);
  const [success,       setSuccess]       = useState('');

  const actions = NEXT_ACTIONS[order.status];

  const handleTransition = (action: { label: string; next: Order['status'] }) => {
    if (action.next === 'cancelled' && pendingAction?.next !== 'cancelled') {
      setPendingAction(action); return;
    }
    setErr('');
    try {
      changeOrderStatus(order.id, action.next);
      setSuccess(`Order ${action.next}.`);
      setTimeout(() => { onStatusChange(); }, 900);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Status change failed.');
      setPendingAction(null);
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{ alignItems: 'flex-start' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-panel" style={{ maxWidth: 640, marginTop: 0 }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 700 }}>Order Details</h3>
            <code style={{
              display: 'inline-block', marginTop: 4,
              fontSize: 'var(--text-xs)', background: 'var(--color-bg-muted)',
              padding: '2px 8px', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)',
            }}>
              {order.id}
            </code>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Error / Success */}
        {err     && <div className="alert alert-error"   style={{ marginBottom: 'var(--space-4)' }}><AlertTriangle size={14} /> {err}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: 'var(--space-4)' }}><CheckCircle size={14} /> {success}</div>}

        {/* Meta grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
          {[
            { label: 'Customer',   value: order.customerName },
            { label: 'Order Date', value: formatDate(order.createdAt) },
            {
              label: 'Status',
              value: <span className={`badge ${STATUS_BADGE[order.status]}`}>{order.status}</span>,
            },
            {
              label: 'Payment',
              value: (
                <span className={`badge ${
                  order.paymentStatus === 'paid'     ? 'badge-success'
                  : order.paymentStatus === 'refunded' ? 'badge-error'
                  : 'badge-warning'
                }`}>{order.paymentStatus}</span>
              ),
            },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'var(--color-bg-muted)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
            }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Line items */}
        <h4 style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Items
        </h4>
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 'var(--space-5)' }}>
          <table className="bb-table">
            <thead>
              <tr>
                <th>Product</th>
                <th className="right">Qty</th>
                <th className="right">Unit Price</th>
                <th className="right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ fontWeight: 'var(--weight-medium)' }}>{item.productName}</div>
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>{formatCurrency(item.unitPrice)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'var(--weight-semibold)' }}>{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', marginBottom: 'var(--space-5)' }}>
          {[
            { label: 'Subtotal', value: order.subtotal, bold: false },
            { label: 'Tax',      value: order.tax,      bold: false },
          ].map(({ label, value, bold }) => (
            <div key={label} style={{ display: 'flex', gap: 'var(--space-10)' }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{label}</span>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: bold ? 700 : 400 }}>{formatCurrency(value)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 'var(--space-10)', borderTop: '1px solid var(--color-border)', paddingTop: 8, marginTop: 4 }}>
            <span style={{ fontSize: 'var(--text-md)', fontWeight: 700 }}>Total</span>
            <span style={{ fontSize: 'var(--text-md)', fontWeight: 700 }}>{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div style={{ background: 'var(--color-bg-muted)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            <strong>Notes:</strong> {order.notes}
          </div>
        )}

        {/* Stock policy note */}
        {order.status === 'pending' && (
          <div className="alert alert-warning" style={{ marginBottom: 'var(--space-4)' }}>
            <AlertTriangle size={13} />
            Stock will be deducted from inventory when this order is <strong>confirmed</strong>.
          </div>
        )}

        {/* Action buttons */}
        {actions.length > 0 && (
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {actions.map(action => {
              const isCancel  = action.next === 'cancelled';
              const awaitConf = isCancel && pendingAction?.next === 'cancelled';
              return (
                <button
                  key={action.next}
                  className={`btn ${isCancel ? (awaitConf ? 'btn-danger' : 'btn-ghost') : 'btn-primary'}`}
                  onClick={() => handleTransition(action)}
                  disabled={!!success}
                >
                  {awaitConf ? '⚠ Confirm Cancellation' : action.label}
                  {!isCancel && <ChevronRight size={14} />}
                </button>
              );
            })}
          </div>
        )}

        {(order.status === 'delivered' || order.status === 'cancelled') && (
          <p style={{ textAlign: 'right', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
            This order is {order.status} — no further actions available.
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Summary stats ── */
function OrderStats({ orders }: { orders: Order[] }) {
  const pending   = orders.filter(o => o.status === 'pending').length;
  const confirmed = orders.filter(o => o.status === 'confirmed' || o.status === 'processing').length;
  const delivered = orders.filter(o => o.status === 'delivered').length;
  const revenue   = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);

  return (
    <div className="stats-grid" style={{ marginBottom: 'var(--space-5)' }}>
      <div className="stat-card">
        <div className="stat-card-header"><span className="stat-card-label">Total Orders</span><div className="stat-card-icon sage"><ShoppingCart size={17} /></div></div>
        <div className="stat-card-value">{orders.length}</div>
        <div className="stat-card-footer">{pending} pending</div>
      </div>
      <div className="stat-card">
        <div className="stat-card-header"><span className="stat-card-label">Pending</span><div className="stat-card-icon amber"><Package size={17} /></div></div>
        <div className="stat-card-value">{pending}</div>
        <div className="stat-card-footer">awaiting confirmation</div>
      </div>
      <div className="stat-card">
        <div className="stat-card-header"><span className="stat-card-label">In Progress</span><div className="stat-card-icon blue"><Package size={17} /></div></div>
        <div className="stat-card-value">{confirmed}</div>
        <div className="stat-card-footer">confirmed / processing</div>
      </div>
      <div className="stat-card">
        <div className="stat-card-header"><span className="stat-card-label">Revenue (Paid)</span><div className="stat-card-icon green"><ShoppingCart size={17} /></div></div>
        <div className="stat-card-value">{formatCurrency(revenue)}</div>
        <div className="stat-card-footer">{delivered} delivered</div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function OrdersPage() {
  const [orders, setOrders] = useState(() => getOrders());
  const refresh = () => setOrders(getOrders());
  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState<Order['status'] | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = useMemo(() => orders.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = !q || o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q);
    return matchSearch && (statusFilter === 'all' || o.status === statusFilter);
  }), [orders, search, statusFilter]);

  const statuses: Array<Order['status'] | 'all'> =
    ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="placeholder-page">
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={() => { refresh(); setSelectedOrder(null); }}
        />
      )}

      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-text">
            <h1>Orders</h1>
            <p>Track and manage customer orders. {orders.length} total orders.</p>
          </div>
        </div>
      </div>

      <OrderStats orders={orders} />

      {/* Stock policy notice */}
      <div className="demo-notice" style={{ marginBottom: 'var(--space-5)' }}>
        <AlertTriangle size={13} />
        <span>
          <strong>Stock rule:</strong> Stock is deducted when an order is <em>confirmed</em>.
          Cancelling from Confirmed/Processing restores stock. Cancelling after Shipped does not.
        </span>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-search">
          <Search size={14} className="toolbar-search-icon" />
          <input
            type="search"
            className="toolbar-input"
            placeholder="Search order ID or customer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search orders"
          />
        </div>
        <div className="filter-pills">
          {statuses.map(s => (
            <button
              key={s}
              className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><ShoppingCart size={22} /></div>
          <h3>No orders found</h3>
          <p>{search || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Orders will appear here when customers place them.'}</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-scroll card-body-flush">
            <table className="bb-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 120 }}>Order ID</th>
                  <th style={{ minWidth: 140 }}>Customer</th>
                  <th style={{ minWidth: 100 }}>Date</th>
                  <th className="center" style={{ minWidth: 60 }}>Items</th>
                  <th className="right" style={{ minWidth: 100 }}>Total</th>
                  <th className="center" style={{ minWidth: 110 }}>Status</th>
                  <th className="center" style={{ minWidth: 90 }}>Payment</th>
                  <th className="center" style={{ minWidth: 80 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} style={{ cursor: 'pointer' }}>
                    <td>
                      <code style={{
                        fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)',
                        background: 'var(--color-bg-muted)', padding: '2px 6px', borderRadius: 'var(--radius-sm)',
                      }}>
                        {o.id.slice(0, 14)}…
                      </code>
                    </td>
                    <td style={{ fontWeight: 'var(--weight-medium)' }}>{o.customerName}</td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>{formatDate(o.createdAt)}</td>
                    <td style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>{o.items.length}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'var(--weight-semibold)' }}>{formatCurrency(o.total)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${STATUS_BADGE[o.status]}`}>{o.status}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${
                        o.paymentStatus === 'paid' ? 'badge-success'
                        : o.paymentStatus === 'refunded' ? 'badge-error'
                        : 'badge-warning'
                      }`}>{o.paymentStatus}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          const fresh = getOrders().find(ord => ord.id === o.id);
                          setSelectedOrder(fresh ?? o);
                        }}
                        aria-label={`View order ${o.id}`}
                      >
                        View <ChevronRight size={13} />
                      </button>
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
