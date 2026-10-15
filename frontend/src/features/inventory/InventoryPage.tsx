import { useMemo, useState } from 'react';
import {
  Warehouse, AlertTriangle, ArrowDownCircle, ArrowUpCircle,
  Plus, Minus, Search, X, CheckCircle,
} from 'lucide-react';
import {
  getProducts, getStockMovements, adjustStock,
  formatCurrency, formatDate,
} from '../../services/dataService';
import type { Product } from '../../types';
import '../../components/ui/components.css';
import '../shared/placeholder.css';

/* ── Adjustment Modal ── */
interface AdjustModalProps {
  product: Product;
  mode: 'in' | 'out';
  onClose: () => void;
  onDone:  () => void;
}

const REASONS_IN  = ['Purchase / Restock', 'Return from Customer', 'Transfer In',  'Correction', 'Found (Audit)',  'Other'];
const REASONS_OUT = ['Sale',               'Damage / Waste',       'Transfer Out', 'Correction', 'Sample / Gifted','Other'];

function AdjustModal({ product, mode, onClose, onDone }: AdjustModalProps) {
  const [qty,          setQty]          = useState('');
  const [reason,       setReason]       = useState('');
  const [customReason, setCustomReason] = useState('');
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState(false);

  const reasons         = mode === 'in' ? REASONS_IN : REASONS_OUT;
  const effectiveReason = reason === 'Other' ? customReason : reason;
  const qtyNum          = Number(qty);
  const newStock        = mode === 'in' ? product.stock + qtyNum : product.stock - qtyNum;
  const accent          = mode === 'in' ? 'var(--color-success)' : 'var(--color-error)';

  const handleSubmit = () => {
    if (!qty || isNaN(qtyNum) || qtyNum <= 0 || !Number.isInteger(qtyNum)) {
      setError('Quantity must be a positive whole number.'); return;
    }
    if (!effectiveReason.trim()) {
      setError('Reason is required.'); return;
    }
    try {
      adjustStock(product.id, mode === 'in' ? qtyNum : -qtyNum, effectiveReason.trim(), mode);
      setSuccess(true);
      setTimeout(() => { onDone(); onClose(); }, 700);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Adjustment failed.');
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-panel" style={{ maxWidth: 440, marginTop: 0, alignSelf: 'flex-start' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {mode === 'in'
              ? <ArrowDownCircle size={18} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
              : <ArrowUpCircle  size={18} style={{ color: 'var(--color-error)',   flexShrink: 0 }} />}
            <div>
              <h3 style={{ margin: 0, fontSize: 'var(--text-md)', fontWeight: 700 }}>
                Stock {mode === 'in' ? 'In' : 'Out'}
              </h3>
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                {product.name}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Current stock chip */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--color-bg-muted)', borderRadius: 'var(--radius-md)',
          padding: '9px 14px', marginBottom: 'var(--space-4)',
          fontSize: 'var(--text-sm)',
        }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Current stock</span>
          <span style={{
            fontWeight: 700,
            color: product.stock === 0 ? 'var(--color-error)'
              : product.stock <= product.minStock ? 'var(--color-warning)'
                : 'var(--color-text-primary)',
          }}>
            {product.stock} {product.unit}
          </span>
        </div>

        {/* Error / Success */}
        {error   && <div className="alert alert-error"   style={{ marginBottom: 'var(--space-3)' }}><AlertTriangle size={14}/> {error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: 'var(--space-3)' }}><CheckCircle size={14}/> Adjustment saved!</div>}

        {/* Quantity */}
        <div className="form-group">
          <label className="form-label">Quantity ({product.unit}) <span className="required">*</span></label>
          <input
            className="form-input"
            style={{ borderColor: accent }}
            type="number" min={1} step={1}
            value={qty}
            onChange={e => { setQty(e.target.value); setError(''); }}
            placeholder="e.g. 10"
            autoFocus
          />
          {qty && qtyNum > 0 && (
            <div className="form-hint" style={{
              color: mode === 'out' && newStock < 0 ? 'var(--color-error)' : undefined,
            }}>
              Stock after: {newStock} {product.unit}
              {mode === 'out' && newStock < 0 && ' ⚠ Would go negative'}
            </div>
          )}
        </div>

        {/* Reason */}
        <div className="form-group">
          <label className="form-label">Reason <span className="required">*</span></label>
          <select className="form-select" value={reason} onChange={e => { setReason(e.target.value); setError(''); }}>
            <option value="">— Select reason —</option>
            {reasons.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {reason === 'Other' && (
          <div className="form-group">
            <label className="form-label">Custom Reason <span className="required">*</span></label>
            <input
              className="form-input"
              value={customReason}
              onChange={e => { setCustomReason(e.target.value); setError(''); }}
              placeholder="Describe the reason…"
            />
          </div>
        )}

        <div className="form-actions" style={{ marginTop: 'var(--space-2)' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={success}
            style={{ background: accent, borderColor: accent }}
          >
            {mode === 'in' ? <Plus size={14} /> : <Minus size={14} />}
            {mode === 'in' ? 'Add Stock' : 'Remove Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function InventoryPage() {
  const [products,  setProducts]  = useState(() => getProducts());
  const [movements, setMovements] = useState(() => getStockMovements());

  const refresh = () => {
    setProducts(getProducts());
    setMovements(getStockMovements());
  };

  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ok' | 'low' | 'out'>('all');
  const [adjustTarget, setAdjustTarget] = useState<{ product: Product; mode: 'in' | 'out' } | null>(null);

  const activeProducts = products.filter(p => p.status === 'active');
  const lowStock    = activeProducts.filter(p => p.stock > 0 && p.stock <= p.minStock);
  const outOfStock  = activeProducts.filter(p => p.stock === 0);
  const totalValue  = products.reduce((sum, p) => sum + p.stock * p.costPrice, 0);
  const totalUnits  = products.reduce((sum, p) => sum + p.stock, 0);

  const filtered = useMemo(() => activeProducts.filter(p => {
    const q = search.toLowerCase();
    if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) return false;
    if (statusFilter === 'out') return p.stock === 0;
    if (statusFilter === 'low') return p.stock > 0 && p.stock <= p.minStock;
    if (statusFilter === 'ok')  return p.stock > p.minStock;
    return true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [products, search, statusFilter]);

  const sortedMovements = useMemo(() =>
    [...movements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [movements]
  );

  return (
    <div className="placeholder-page">
      {adjustTarget && (
        <AdjustModal
          product={adjustTarget.product}
          mode={adjustTarget.mode}
          onClose={() => setAdjustTarget(null)}
          onDone={refresh}
        />
      )}

      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-text">
            <h1>Inventory</h1>
            <p>Track stock levels, record adjustments, and review movement history.</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Total SKUs</span>
            <div className="stat-card-icon sage"><Warehouse size={17} /></div>
          </div>
          <div className="stat-card-value">{activeProducts.length}</div>
          <div className="stat-card-footer">{totalUnits} total units</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Low Stock</span>
            <div className="stat-card-icon amber"><AlertTriangle size={17} /></div>
          </div>
          <div className="stat-card-value">{lowStock.length}</div>
          <div className="stat-card-footer">need reordering</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Out of Stock</span>
            <div className="stat-card-icon red"><AlertTriangle size={17} /></div>
          </div>
          <div className="stat-card-value">{outOfStock.length}</div>
          <div className="stat-card-footer">products unavailable</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Inventory Value</span>
            <div className="stat-card-icon forest"><Warehouse size={17} /></div>
          </div>
          <div className="stat-card-value">{formatCurrency(totalValue)}</div>
          <div className="stat-card-footer">at cost price</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-search">
          <Search size={14} className="toolbar-search-icon" />
          <input
            type="search"
            className="toolbar-input"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search inventory"
          />
        </div>
        <div className="filter-pills">
          {(['all', 'ok', 'low', 'out'] as const).map(f => (
            <button
              key={f}
              className={`btn btn-sm ${statusFilter === f ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setStatusFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'ok' ? '✓ In Stock' : f === 'low' ? '⚠ Low' : '✗ Out'}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Levels Table */}
      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card-header">
          <h3>Stock Levels</h3>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{filtered.length} products</span>
        </div>
        <div className="table-scroll card-body-flush">
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-10)' }}>
              <p>No products match your filters.</p>
            </div>
          ) : (
            <table className="bb-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 180 }}>Product</th>
                  <th style={{ minWidth: 100 }}>SKU</th>
                  <th style={{ minWidth: 110 }}>Category</th>
                  <th className="right" style={{ minWidth: 80 }}>Current</th>
                  <th className="right" style={{ minWidth: 70 }}>Min</th>
                  <th className="center" style={{ minWidth: 100 }}>Status</th>
                  <th className="center" style={{ minWidth: 80 }}>Adjust</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 'var(--weight-medium)' }}>{p.name}</div>
                      {p.brand && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 1 }}>{p.brand}</div>}
                    </td>
                    <td>
                      <code style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{p.sku}</code>
                    </td>
                    <td>
                      {p.category && <span className="badge badge-neutral">{p.category}</span>}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 'var(--weight-semibold)' }}>
                      <span style={{
                        color: p.stock === 0 ? 'var(--color-error)'
                          : p.stock <= p.minStock ? 'var(--color-warning)'
                            : 'var(--color-text-primary)',
                      }}>
                        {p.stock}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginLeft: 3 }}>{p.unit}</span>
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                      {p.minStock} {p.unit}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${p.stock === 0 ? 'badge-error' : p.stock <= p.minStock ? 'badge-warning' : 'badge-success'}`}>
                        {p.stock === 0 ? 'Out of Stock' : p.stock <= p.minStock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button
                          onClick={() => setAdjustTarget({ product: p, mode: 'in' })}
                          title="Stock In"
                          className="btn btn-ghost btn-sm btn-icon-only"
                          aria-label={`Stock in for ${p.name}`}
                          style={{ color: 'var(--color-success)' }}
                        >
                          <ArrowDownCircle size={15} />
                        </button>
                        <button
                          onClick={() => setAdjustTarget({ product: p, mode: 'out' })}
                          title="Stock Out"
                          disabled={p.stock === 0}
                          className="btn btn-ghost btn-sm btn-icon-only"
                          aria-label={`Stock out for ${p.name}`}
                          style={{ color: 'var(--color-error)' }}
                        >
                          <ArrowUpCircle size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Movement History */}
      <div className="card">
        <div className="card-header">
          <h3>Movement History</h3>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{sortedMovements.length} records</span>
        </div>
        <div className="table-scroll card-body-flush">
          {sortedMovements.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-10)' }}>
              <p>No stock movements yet. Use the adjust buttons above to record your first adjustment.</p>
            </div>
          ) : (
            <table className="bb-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 100 }}>Type</th>
                  <th style={{ minWidth: 160 }}>Product</th>
                  <th className="right" style={{ minWidth: 70 }}>Qty</th>
                  <th style={{ minWidth: 160 }}>Reason</th>
                  <th style={{ minWidth: 120 }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {sortedMovements.map(mov => (
                  <tr key={mov.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {mov.type === 'in'
                          ? <ArrowDownCircle size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                          : <ArrowUpCircle  size={14} style={{ color: 'var(--color-error)',   flexShrink: 0 }} />}
                        <span className={`badge ${mov.type === 'in' ? 'badge-success' : 'badge-error'}`}>
                          {mov.type === 'in' ? 'In' : 'Out'}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 'var(--weight-medium)' }}>{mov.productName}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'var(--weight-semibold)' }}>
                      <span style={{ color: mov.type === 'in' ? 'var(--color-success)' : 'var(--color-error)' }}>
                        {mov.type === 'in' ? '+' : '−'}{mov.quantity}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>{mov.reason}</td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>
                      {formatDate(mov.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
