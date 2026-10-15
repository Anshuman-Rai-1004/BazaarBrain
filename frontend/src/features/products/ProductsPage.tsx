import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, LayoutGrid, List, Package,
  Edit2, Trash2, Upload, Download,
} from 'lucide-react';
import { getProducts, formatCurrency, deleteProduct } from '../../services/dataService';
import ProductForm from './ProductForm';
import '../../components/ui/components.css';
import '../shared/placeholder.css';

const STATUS_BADGE: Record<string, string> = {
  active:   'badge-success',
  draft:    'badge-warning',
  archived: 'badge-neutral',
};

export default function ProductsPage() {
  const [refreshKey, setRefreshKey]   = useState(0);
  const products                       = useMemo(() => getProducts(), [refreshKey]);
  const [showForm, setShowForm]       = useState(false);
  const [editId, setEditId]           = useState<string | undefined>(undefined);
  const [search, setSearch]           = useState('');
  const [viewMode, setViewMode]       = useState<'list' | 'grid'>('list');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = useMemo(() =>
    products.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);
      return matchSearch && (statusFilter === 'all' || p.status === statusFilter);
    }),
    [products, search, statusFilter]
  );

  const openEdit = (id: string) => { setEditId(id); setShowForm(true); };
  const openAdd  = () => { setEditId(undefined); setShowForm(true); };
  const refresh  = () => setRefreshKey(k => k + 1);

  const handleDelete = (id: string) => {
    if (deleteTarget === id) {
      deleteProduct(id);
      setDeleteTarget(null);
      refresh();
    } else {
      setDeleteTarget(id);
      // Reset confirm after 3s
      setTimeout(() => setDeleteTarget(null), 3000);
    }
  };

  return (
    <>
      {showForm && (
        <ProductForm
          productId={editId}
          onClose={() => { setShowForm(false); setEditId(undefined); }}
          onSaved={refresh}
        />
      )}

      <div className="placeholder-page">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-header-top">
            <div className="page-header-text">
              <h1>Products</h1>
              <p>
                {products.length} total &nbsp;·&nbsp;
                {products.filter(p => p.status === 'active').length} active
              </p>
            </div>
            <div className="page-header-actions">
              <button className="btn btn-secondary btn-sm" title="Import / Export">
                <Upload size={14} /> Import
              </button>
              <button className="btn btn-ghost btn-sm" title="Export">
                <Download size={14} />
              </button>
              <button className="btn btn-primary" onClick={openAdd}>
                <Plus size={15} className="btn-icon" /> Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-search">
            <Search size={14} className="toolbar-search-icon" />
            <input
              type="search"
              className="toolbar-input"
              placeholder="Search by name, SKU, category…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search products"
            />
          </div>

          <div className="filter-pills">
            {(['all', 'active', 'draft', 'archived'] as const).map(s => (
              <button
                key={s}
                className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="toolbar-spacer" />

          <div style={{ display: 'flex', gap: 4 }}>
            <button
              className={`btn btn-ghost btn-sm btn-icon-only ${viewMode === 'list' ? 'btn-secondary' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
              title="List view"
            >
              <List size={15} />
            </button>
            <button
              className={`btn btn-ghost btn-sm btn-icon-only ${viewMode === 'grid' ? 'btn-secondary' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
              title="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Package size={22} /></div>
            <h3>No products found</h3>
            <p>
              {search || statusFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Start by adding your first product to the catalog.'}
            </p>
            {!search && statusFilter === 'all' && (
              <button className="btn btn-primary" onClick={openAdd}>
                <Plus size={15} /> Add Product
              </button>
            )}
          </div>
        ) : viewMode === 'list' ? (

          /* ── List View ── */
          <div className="card">
            <div className="card-header" style={{ padding: 'var(--space-3) var(--space-5)' }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
              </span>
            </div>
            <div className="table-scroll card-body-flush">
              <table className="bb-table">
                <thead>
                  <tr>
                    <th style={{ minWidth: 200 }}>Product</th>
                    <th style={{ minWidth: 110 }}>SKU</th>
                    <th style={{ minWidth: 120 }}>Category</th>
                    <th className="right" style={{ minWidth: 90 }}>Price</th>
                    <th className="right" style={{ minWidth: 80 }}>Stock</th>
                    <th className="center" style={{ minWidth: 90 }}>Status</th>
                    <th className="center" style={{ minWidth: 80 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(product => (
                    <tr key={product.id}>
                      <td>
                        <div style={{ fontWeight: 'var(--weight-medium)', color: 'var(--color-text-primary)' }}>
                          <Link
                            to={`/products/${product.id}`}
                            style={{ color: 'inherit', textDecoration: 'none' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--bb-sage-dark)')}
                            onMouseLeave={e => (e.currentTarget.style.color = '')}
                          >
                            {product.name}
                          </Link>
                        </div>
                        {product.brand && (
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 1 }}>
                            {product.brand}
                          </div>
                        )}
                      </td>
                      <td>
                        <code style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--text-xs)',
                          background: 'var(--color-bg-muted)',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--color-text-secondary)',
                          whiteSpace: 'nowrap',
                          display: 'inline-block',
                          maxWidth: 110,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                          title={product.sku}
                        >
                          {product.sku}
                        </code>
                      </td>
                      <td>
                        {product.category
                          ? <span className="badge badge-neutral">{product.category}</span>
                          : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 'var(--weight-medium)' }}>
                        {formatCurrency(product.sellingPrice)}
                        {product.costPrice > 0 && (
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 400, marginTop: 1 }}>
                            cost {formatCurrency(product.costPrice)}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{
                          fontWeight: 'var(--weight-semibold)',
                          color: product.stock === 0
                            ? 'var(--color-error)'
                            : product.stock <= product.minStock
                              ? 'var(--color-warning)'
                              : 'var(--color-text-primary)',
                        }}>
                          {product.stock}
                        </span>
                        <span style={{ color: 'var(--color-text-muted)', marginLeft: 3, fontSize: 'var(--text-xs)' }}>
                          {product.unit}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${STATUS_BADGE[product.status] ?? 'badge-neutral'}`}>
                          {product.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                          <button
                            className="btn btn-ghost btn-sm btn-icon-only"
                            onClick={() => openEdit(product.id)}
                            title="Edit product"
                            aria-label={`Edit ${product.name}`}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className={`btn btn-sm btn-icon-only ${deleteTarget === product.id ? 'btn-danger' : 'btn-ghost'}`}
                            onClick={() => handleDelete(product.id)}
                            title={deleteTarget === product.id ? 'Click again to confirm delete' : 'Delete product'}
                            aria-label={`Delete ${product.name}`}
                            style={{ color: deleteTarget === product.id ? 'var(--color-error)' : 'var(--color-text-muted)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        ) : (

          /* ── Grid View ── */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 'var(--space-4)',
          }}>
            {filtered.map(product => (
              <div
                key={product.id}
                className="card"
                style={{ display: 'flex', flexDirection: 'column', transition: 'box-shadow var(--transition-fast)' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}
              >
                <div className="card-body" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link
                        to={`/products/${product.id}`}
                        style={{
                          fontWeight: 'var(--weight-semibold)',
                          fontSize: 'var(--text-md)',
                          color: 'var(--color-text-primary)',
                          textDecoration: 'none',
                          display: 'block',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {product.name}
                      </Link>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {product.brand && `${product.brand} · `}
                        <code style={{ fontSize: 'var(--text-xs)' }}>{product.sku}</code>
                      </div>
                    </div>
                    <span className={`badge ${STATUS_BADGE[product.status] ?? 'badge-neutral'}`} style={{ flexShrink: 0, marginLeft: 8 }}>
                      {product.status}
                    </span>
                  </div>

                  {product.description && (
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: '0 0 var(--space-3)' }}>
                      {product.description.length > 90
                        ? product.description.slice(0, 90) + '…'
                        : product.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-md)' }}>
                      {formatCurrency(product.sellingPrice)}
                    </span>
                    <span style={{
                      fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)',
                      color: product.stock === 0 ? 'var(--color-error)'
                        : product.stock <= product.minStock ? 'var(--color-warning)'
                          : 'var(--color-text-muted)',
                    }}>
                      {product.stock} {product.unit}
                    </span>
                  </div>
                </div>

                {/* Card actions */}
                <div style={{
                  display: 'flex',
                  borderTop: '1px solid var(--color-border-light)',
                  padding: 'var(--space-2) var(--space-4)',
                  gap: 'var(--space-2)',
                  justifyContent: 'flex-end',
                }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => openEdit(product.id)}
                    title="Edit"
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    className={`btn btn-sm ${deleteTarget === product.id ? 'btn-danger' : 'btn-ghost'}`}
                    onClick={() => handleDelete(product.id)}
                    title={deleteTarget === product.id ? 'Click again to confirm' : 'Delete'}
                    style={{ color: deleteTarget === product.id ? undefined : 'var(--color-text-muted)' }}
                  >
                    <Trash2 size={13} />
                    {deleteTarget === product.id ? 'Confirm?' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
