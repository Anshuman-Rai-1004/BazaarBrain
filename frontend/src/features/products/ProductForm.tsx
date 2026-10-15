import { useState } from 'react';
import type { Product } from '../../types';
import {
  addProduct,
  updateProduct,
  getProduct,
  deleteProduct,
  generateId,
} from '../../services/dataService';
import { X, Save, Trash2, AlertTriangle } from 'lucide-react';
import '../../components/ui/components.css';

interface ProductFormProps {
  productId?: string;
  onClose: () => void;
  onSaved: () => void;
}

const CATEGORIES = [
  'Food & Grocery', 'Beverages', 'Personal Care', 'Home & Kitchen',
  'Electronics', 'Clothing', 'Health & Wellness', 'Baby & Kids', 'Other',
];

const UNITS = ['pcs', 'kg', 'g', 'litre', 'ml', 'box', 'pack', 'dozen', 'pair'];

export default function ProductForm({ productId, onClose, onSaved }: ProductFormProps) {
  const [form, setForm] = useState<Partial<Product>>(() => {
    if (productId) {
      const p = getProduct(productId);
      if (p) return p;
    }
    return {
      name: '', sku: '', brand: '', category: '', description: '',
      sellingPrice: 0, costPrice: 0, stock: 0, minStock: 5,
      unit: 'pcs', status: 'active',
    };
  });
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = (field: keyof Product, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const validate = (): boolean => {
    if (!form.name?.trim())                         { setError('Product name is required.'); return false; }
    if (!form.sku?.trim())                          { setError('SKU is required.'); return false; }
    if (!form.sellingPrice || form.sellingPrice <= 0){ setError('Selling price must be greater than 0.'); return false; }
    if (form.stock === undefined || form.stock < 0) { setError('Stock cannot be negative.'); return false; }
    setError('');
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    try {
      if (productId) {
        updateProduct(form as Product);
      } else {
        const newProduct: Product = {
          ...(form as Product),
          id: generateId('prod'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [], variants: [], images: [], attributes: {},
        };
        addProduct(newProduct);
      }
      onSaved();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
    }
  };

  const handleDelete = () => {
    if (!productId) return;
    if (!confirmDelete) { setConfirmDelete(true); return; }
    deleteProduct(productId);
    onSaved();
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-panel" style={{ maxWidth: 600, marginTop: 0, alignSelf: 'flex-start' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)' }}>
              {productId ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
              {productId ? 'Update product details below.' : 'Fill in the details for your new product.'}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        {/* Form fields */}
        <div className="form-row" style={{ marginBottom: 'var(--space-4)' }}>
          {/* Full-width: name */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Product Name <span className="required">*</span></label>
            <input
              className="form-input"
              value={form.name ?? ''}
              onChange={e => { set('name', e.target.value); setError(''); }}
              placeholder="e.g. Organic Honey 500g"
              autoFocus
            />
          </div>

          <div>
            <label className="form-label">SKU <span className="required">*</span></label>
            <input
              className="form-input"
              style={{ fontFamily: 'var(--font-mono)' }}
              value={form.sku ?? ''}
              onChange={e => { set('sku', e.target.value.toUpperCase()); setError(''); }}
              placeholder="e.g. HON-500G"
            />
          </div>

          <div>
            <label className="form-label">Brand</label>
            <input
              className="form-input"
              value={form.brand ?? ''}
              onChange={e => set('brand', e.target.value)}
              placeholder="e.g. Nature's Best"
            />
          </div>

          <div>
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={form.category ?? ''}
              onChange={e => set('category', e.target.value)}
            >
              <option value="">— Select —</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={form.status ?? 'active'}
              onChange={e => set('status', e.target.value as Product['status'])}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="form-label">Selling Price (₹) <span className="required">*</span></label>
            <input
              className="form-input"
              type="number" min={0} step={0.01}
              value={form.sellingPrice ?? ''}
              onChange={e => { set('sellingPrice', Number(e.target.value)); setError(''); }}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="form-label">Cost Price (₹)</label>
            <input
              className="form-input"
              type="number" min={0} step={0.01}
              value={form.costPrice ?? ''}
              onChange={e => set('costPrice', Number(e.target.value))}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="form-label">Current Stock <span className="required">*</span></label>
            <input
              className="form-input"
              type="number" min={0}
              value={form.stock ?? ''}
              onChange={e => { set('stock', Number(e.target.value)); setError(''); }}
              placeholder="0"
            />
          </div>

          <div>
            <label className="form-label">Min Stock Alert</label>
            <input
              className="form-input"
              type="number" min={0}
              value={form.minStock ?? ''}
              onChange={e => set('minStock', Number(e.target.value))}
              placeholder="5"
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Unit</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {UNITS.map(u => (
                <button
                  key={u}
                  type="button"
                  className={`btn btn-sm ${form.unit === u ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => set('unit', u)}
                >
                  {u}
                </button>
              ))}
              {!UNITS.includes(form.unit ?? '') && form.unit && (
                <span className="badge badge-lime" style={{ alignSelf: 'center' }}>{form.unit}</span>
              )}
              <input
                className="form-input"
                style={{ flex: 1, minWidth: 80, maxWidth: 120 }}
                value={UNITS.includes(form.unit ?? '') ? '' : (form.unit ?? '')}
                onChange={e => set('unit', e.target.value)}
                placeholder="custom…"
              />
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={form.description ?? ''}
              onChange={e => set('description', e.target.value)}
              placeholder="Product description, features, and notes…"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          {productId && (
            <button
              className={`btn ${confirmDelete ? 'btn-danger' : 'btn-ghost'}`}
              onClick={handleDelete}
              style={{ marginRight: 'auto' }}
            >
              <Trash2 size={14} />
              {confirmDelete ? 'Confirm Delete?' : 'Delete'}
            </button>
          )}
          <button className="btn btn-ghost" onClick={onClose}>
            <X size={14} /> Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            <Save size={14} /> {productId ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
