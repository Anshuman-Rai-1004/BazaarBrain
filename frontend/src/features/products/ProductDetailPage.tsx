import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Archive,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Edit2,
    ExternalLink,
    History,
    Package,
    Plus,
    Minus,
    RefreshCw,
    ShoppingBag,
    TrendingUp,
    AlertTriangle,
    XCircle,
} from 'lucide-react';
import type { Product, StockMovement } from '../../types';
import {
    adjustStock,
    formatCurrency,
    formatDate,
    formatRelativeTime,
    getOrders,
    getProduct,
    getStockMovements,
} from '../../services/dataService';
import ProductForm from './ProductForm';
import '../../components/ui/components.css';
import '../shared/placeholder.css';

type ProductStatus = Product['status'];

const STATUS_LABELS: Record<ProductStatus, string> = {
    active: 'Active',
    draft: 'Draft',
    archived: 'Archived',
};

function getStockState(product: Product) {
    if (product.stock <= 0) {
        return {
            label: 'Out of stock',
            className: 'badge-danger',
            color: 'var(--color-error)',
            background: 'var(--color-error-bg)',
        };
    }

    if (product.stock <= product.minStock) {
        return {
            label: 'Low stock',
            className: 'badge-warning',
            color: 'var(--color-warning)',
            background: 'var(--color-warning-bg)',
        };
    }

    return {
        label: 'In stock',
        className: 'badge-success',
        color: 'var(--color-success)',
        background: 'var(--color-success-bg)',
    };
}

function MetricCard({
    label,
    value,
    helper,
    icon,
}: {
    label: string;
    value: string;
    helper: string;
    icon: React.ReactNode;
}) {
    return (
        <section className="card" style={{ padding: 'var(--space-5)', minWidth: 0 }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    marginBottom: 'var(--space-4)',
                }}
            >
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                    {label}
                </span>
                <span
                    aria-hidden="true"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 34,
                        height: 34,
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-bg-muted)',
                        color: 'var(--bb-forest)',
                        flexShrink: 0,
                    }}
                >
                    {icon}
                </span>
            </div>
            <div
                style={{
                    fontSize: 'clamp(1.2rem, 2vw, 1.65rem)',
                    lineHeight: 1.2,
                    fontWeight: 'var(--weight-bold)',
                    color: 'var(--color-text-primary)',
                    overflowWrap: 'anywhere',
                }}
            >
                {value}
            </div>
            <div
                style={{
                    marginTop: 'var(--space-2)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                }}
            >
                {helper}
            </div>
        </section>
    );
}

export default function ProductDetailPage() {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();


    const [product, setProduct] = useState<Product | undefined>(() =>
        productId ? getProduct(productId) : undefined,
    );

    const [movements, setMovements] = useState<StockMovement[]>(() =>
        productId
            ? getStockMovements()
                .filter((movement) => movement.productId === productId)
                .sort(
                    (a, b) =>
                        new Date(b.date).getTime() -
                        new Date(a.date).getTime(),
                )
                .slice(0, 6)
            : [],
    );

    const [showEditForm, setShowEditForm] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [stockAction, setStockAction] = useState<'in' | 'out'>('in');
    const [stockQuantity, setStockQuantity] = useState('1');
    const [stockReason, setStockReason] = useState('Purchase / Restock');
    const [stockError, setStockError] = useState('');

    const refreshProduct = useCallback(() => {
        const latest = productId ? getProduct(productId) : undefined;

        setProduct(latest);

        setMovements(
            productId
                ? getStockMovements()
                    .filter((movement) => movement.productId === productId)
                    .sort(
                        (a, b) =>
                            new Date(b.date).getTime() -
                            new Date(a.date).getTime(),
                    )
                    .slice(0, 6)
                : [],
        );
    }, [productId]);

    if (!product) {
        return (
            <div className="placeholder-page">
                <div style={{ maxWidth: 620, margin: 'var(--space-12) auto', textAlign: 'center' }}>
                    <div
                        style={{
                            width: 64,
                            height: 64,
                            margin: '0 auto var(--space-5)',
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: 'var(--radius-xl)',
                            background: 'var(--color-bg-muted)',
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        <Package size={28} />
                    </div>
                    <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
                        Product not found
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
                        This product may have been removed, or the link may be invalid.
                    </p>
                    <Link to="/products" className="btn btn-primary">
                        <ArrowLeft size={15} /> Back to Products
                    </Link>
                </div>
            </div>
        );
    }

    const handleStockSubmit = () => {
        const quantity = Number(stockQuantity);

        if (!Number.isInteger(quantity) || quantity <= 0) {
            setStockError('Enter a valid positive whole number.');
            return;
        }

        if (!stockReason.trim()) {
            setStockError('Please select a reason.');
            return;
        }

        try {
            adjustStock(
                product.id,
                stockAction === 'in' ? quantity : -quantity,
                stockReason.trim(),
                stockAction,
            );

            refreshProduct();
            setShowStockModal(false);
            setStockQuantity('1');
            setStockReason(stockAction === 'in' ? 'Purchase / Restock' : 'Sale');
            setStockError('');
        } catch (error) {
            setStockError(
                error instanceof Error
                    ? error.message
                    : 'Unable to update stock.',
            );
        }
    };

    const stockState = getStockState(product);
    const margin = product.sellingPrice - product.costPrice;
    const marginPercent =
        product.sellingPrice > 0
            ? (margin / product.sellingPrice) * 100
            : null;

    const relatedOrders = getOrders().filter(
        (order) =>
            order.status !== 'cancelled' &&
            order.items.some((item) => item.productId === product.id),
    );

    const unitsSold = relatedOrders.reduce(
        (total, order) =>
            total +
            order.items
                .filter((item) => item.productId === product.id)
                .reduce((sum, item) => sum + item.quantity, 0),
        0,
    );

    const productRevenue = relatedOrders.reduce(
        (total, order) =>
            total +
            order.items
                .filter((item) => item.productId === product.id)
                .reduce((sum, item) => sum + item.total, 0),
        0,
    );

    const stockValue = product.stock * product.costPrice;
    const lastMovement = movements[0];

    return (
        <>
            {showEditForm && (
                <ProductForm
                    productId={product.id}
                    onClose={() => setShowEditForm(false)}
                    onSaved={refreshProduct}
                />
            )}

            {showStockModal && (
                <div
                    role="presentation"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            setShowStockModal(false);
                        }
                    }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 1000,
                        display: 'grid',
                        placeItems: 'center',
                        padding: 'var(--space-4)',
                        background: 'rgba(0, 0, 0, 0.55)',
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="stock-modal-title"
                        className="card"
                        style={{
                            width: '100%',
                            maxWidth: 440,
                            padding: 'var(--space-5)',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 'var(--space-3)',
                                marginBottom: 'var(--space-5)',
                            }}
                        >
                            <div>
                                <h2
                                    id="stock-modal-title"
                                    style={{ margin: 0, fontSize: 'var(--text-lg)' }}
                                >
                                    {stockAction === 'in' ? 'Add Stock' : 'Remove Stock'}
                                </h2>
                                <p
                                    style={{
                                        margin: 'var(--space-1) 0 0',
                                        color: 'var(--color-text-secondary)',
                                        fontSize: 'var(--text-sm)',
                                    }}
                                >
                                    {product.name} · Current stock: {product.stock} {product.unit}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                aria-label="Close stock adjustment"
                                onClick={() => setShowStockModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                            <div>
                                <label
                                    htmlFor="stock-quantity"
                                    style={{
                                        display: 'block',
                                        marginBottom: 'var(--space-2)',
                                        fontSize: 'var(--text-sm)',
                                        fontWeight: 'var(--weight-semibold)',
                                    }}
                                >
                                    Quantity ({product.unit})
                                </label>
                                <input
                                    id="stock-quantity"
                                    className="input"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={stockQuantity}
                                    onChange={(event) => setStockQuantity(event.target.value)}
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="stock-reason"
                                    style={{
                                        display: 'block',
                                        marginBottom: 'var(--space-2)',
                                        fontSize: 'var(--text-sm)',
                                        fontWeight: 'var(--weight-semibold)',
                                    }}
                                >
                                    Reason
                                </label>
                                <select
                                    id="stock-reason"
                                    className="input"
                                    value={stockReason}
                                    onChange={(event) => setStockReason(event.target.value)}
                                    style={{ width: '100%' }}
                                >
                                    {(stockAction === 'in'
                                        ? [
                                            'Purchase / Restock',
                                            'Return from Customer',
                                            'Transfer In',
                                            'Correction',
                                            'Found (Audit)',
                                            'Other',
                                        ]
                                        : [
                                            'Sale',
                                            'Damage / Waste',
                                            'Transfer Out',
                                            'Correction',
                                            'Sample / Gifted',
                                            'Other',
                                        ]
                                    ).map((reason) => (
                                        <option key={reason} value={reason}>
                                            {reason}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div
                                style={{
                                    padding: 'var(--space-3)',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--color-bg-muted)',
                                    fontSize: 'var(--text-sm)',
                                }}
                            >
                                New stock:{' '}
                                <strong>
                                    {product.stock +
                                        (stockAction === 'in'
                                            ? Math.max(0, Number(stockQuantity) || 0)
                                            : -Math.max(0, Number(stockQuantity) || 0))}{' '}
                                    {product.unit}
                                </strong>
                            </div>

                            {stockError && (
                                <p
                                    role="alert"
                                    style={{
                                        margin: 0,
                                        color: 'var(--color-error)',
                                        fontSize: 'var(--text-sm)',
                                    }}
                                >
                                    {stockError}
                                </p>
                            )}

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    flexWrap: 'wrap',
                                    gap: 'var(--space-2)',
                                }}
                            >
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowStockModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleStockSubmit}
                                >
                                    {stockAction === 'in' ? 'Confirm Add' : 'Confirm Remove'}
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            <div className="placeholder-page">
                <div style={{ marginBottom: 'var(--space-5)' }}>
                    <Link
                        to="/products"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            color: 'var(--color-text-secondary)',
                            textDecoration: 'none',
                            fontSize: 'var(--text-sm)',
                        }}
                    >
                        <ArrowLeft size={15} />
                        Back to Products
                    </Link>
                </div>

                <div className="page-header">
                    <div className="page-header-top" style={{ alignItems: 'flex-start' }}>
                        <div className="page-header-text" style={{ minWidth: 0 }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 'var(--space-2)',
                                    marginBottom: 'var(--space-2)',
                                }}
                            >
                                <span className={`badge ${STATUS_LABELS[product.status] === 'Active' ? 'badge-success' : product.status === 'draft' ? 'badge-warning' : 'badge-neutral'}`}>
                                    {STATUS_LABELS[product.status]}
                                </span>
                                <span
                                    style={{
                                        fontSize: 'var(--text-xs)',
                                        color: stockState.color,
                                        background: stockState.background,
                                        borderRadius: 'var(--radius-pill)',
                                        padding: '4px 9px',
                                        fontWeight: 'var(--weight-semibold)',
                                    }}
                                >
                                    {stockState.label}
                                </span>
                            </div>

                            <h1 style={{ overflowWrap: 'anywhere' }}>{product.name}</h1>

                            <p style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                                <span>
                                    SKU: <code style={{ fontFamily: 'var(--font-mono)' }}>{product.sku}</code>
                                </span>
                                {product.brand && <span>Brand: {product.brand}</span>}
                                {product.category && <span>{product.category}</span>}
                            </p>
                        </div>

                        <div
                            className="page-header-actions"
                            style={{ flexShrink: 0, flexWrap: 'wrap' }}
                        >
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowEditForm(true)}
                            >
                                <Edit2 size={15} /> Edit Product
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 205px), 1fr))',
                        gap: 'var(--space-4)',
                        marginBottom: 'var(--space-6)',
                    }}
                >
                    <MetricCard
                        label="Selling price"
                        value={formatCurrency(product.sellingPrice)}
                        helper="Current listed price"
                        icon={<ShoppingBag size={17} />}
                    />
                    <MetricCard
                        label="Available stock"
                        value={`${product.stock} ${product.unit}`}
                        helper={`Minimum stock alert: ${product.minStock} ${product.unit}`}
                        icon={<Package size={17} />}
                    />
                    <MetricCard
                        label="Inventory cost value"
                        value={formatCurrency(stockValue)}
                        helper="Current stock × cost price"
                        icon={<Archive size={17} />}
                    />
                    <MetricCard
                        label="Units sold"
                        value={unitsSold.toLocaleString('en-IN')}
                        helper="From recorded non-cancelled orders"
                        icon={<TrendingUp size={17} />}
                    />
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 330px), 1fr))',
                        gap: 'var(--space-5)',
                        alignItems: 'start',
                    }}
                >
                    <div style={{ display: 'grid', gap: 'var(--space-5)', minWidth: 0 }}>
                        <section className="card">
                            <div className="card-header">
                                <h2 style={{ margin: 0, fontSize: 'var(--text-md)' }}>Product overview</h2>
                            </div>
                            <div className="card-body">
                                {product.images.length > 0 && product.images[0] ? (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            maxHeight: 300,
                                            objectFit: 'contain',
                                            background: 'var(--color-bg-subtle)',
                                            borderRadius: 'var(--radius-lg)',
                                            marginBottom: 'var(--space-5)',
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            minHeight: 150,
                                            display: 'grid',
                                            placeItems: 'center',
                                            background: 'var(--color-bg-subtle)',
                                            border: '1px dashed var(--color-border)',
                                            borderRadius: 'var(--radius-lg)',
                                            marginBottom: 'var(--space-5)',
                                            color: 'var(--color-text-muted)',
                                        }}
                                    >
                                        <div style={{ textAlign: 'center' }}>
                                            <Package size={32} strokeWidth={1.5} />
                                            <p style={{ margin: 'var(--space-2) 0 0', fontSize: 'var(--text-sm)' }}>
                                                No product image added
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <h3 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>
                                    Description
                                </h3>
                                <p
                                    style={{
                                        margin: 0,
                                        color: product.description
                                            ? 'var(--color-text-secondary)'
                                            : 'var(--color-text-muted)',
                                        lineHeight: 'var(--leading-relaxed)',
                                        whiteSpace: 'pre-wrap',
                                        overflowWrap: 'anywhere',
                                    }}
                                >
                                    {product.description || 'No description has been added for this product.'}
                                </p>

                                {product.tags.length > 0 && (
                                    <div style={{ marginTop: 'var(--space-5)' }}>
                                        <h3 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>
                                            Tags
                                        </h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                                            {product.tags.map((tag) => (
                                                <span className="badge badge-neutral" key={tag}>{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="card">
                            <div className="card-header">
                                <h2 style={{ margin: 0, fontSize: 'var(--text-md)' }}>Pricing and margin</h2>
                            </div>
                            <div className="card-body">
                                <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                                        <span style={{ color: 'var(--color-text-secondary)' }}>Selling price</span>
                                        <strong>{formatCurrency(product.sellingPrice)}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                                        <span style={{ color: 'var(--color-text-secondary)' }}>Cost price</span>
                                        <strong>{formatCurrency(product.costPrice)}</strong>
                                    </div>
                                    <div style={{ height: 1, background: 'var(--color-border-light)' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                                        <span style={{ color: 'var(--color-text-secondary)' }}>Gross profit per unit</span>
                                        <strong style={{ color: margin >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                                            {formatCurrency(margin)}
                                        </strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                                        <span style={{ color: 'var(--color-text-secondary)' }}>Gross margin</span>
                                        <strong>{marginPercent === null ? '—' : `${marginPercent.toFixed(1)}%`}</strong>
                                    </div>
                                </div>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: 'var(--space-4) 0 0' }}>
                                    These are estimates based on the saved selling and cost prices, before other expenses or taxes.
                                </p>
                            </div>
                        </section>

                        <section className="card">
                            <div className="card-header">
                                <h2 style={{ margin: 0, fontSize: 'var(--text-md)' }}>Product attributes</h2>
                            </div>
                            <div className="card-body">
                                {Object.keys(product.attributes).length > 0 ? (
                                    <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                                        {Object.entries(product.attributes).map(([key, value]) => (
                                            <div
                                                key={key}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    gap: 'var(--space-4)',
                                                    borderBottom: '1px solid var(--color-border-light)',
                                                    paddingBottom: 'var(--space-2)',
                                                }}
                                            >
                                                <span style={{ color: 'var(--color-text-secondary)' }}>{key}</span>
                                                <strong style={{ textAlign: 'right', overflowWrap: 'anywhere' }}>{value}</strong>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                                        No additional attributes have been added.
                                    </p>
                                )}
                            </div>
                        </section>
                    </div>

                    <div style={{ display: 'grid', gap: 'var(--space-5)', minWidth: 0 }}>
                        <section className="card">
                            <div className="card-header">
                                <h2 style={{ margin: 0, fontSize: 'var(--text-md)' }}>Inventory health</h2>
                            </div>
                            <div className="card-body">
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-3)',
                                        padding: 'var(--space-4)',
                                        background: stockState.background,
                                        color: stockState.color,
                                        borderRadius: 'var(--radius-lg)',
                                        marginBottom: 'var(--space-5)',
                                    }}
                                >
                                    {product.stock <= 0 ? (
                                        <XCircle size={21} />
                                    ) : product.stock <= product.minStock ? (
                                        <AlertTriangle size={21} />
                                    ) : (
                                        <CheckCircle2 size={21} />
                                    )}
                                    <div>
                                        <strong>{stockState.label}</strong>
                                        <div style={{ fontSize: 'var(--text-xs)', marginTop: 2 }}>
                                            {product.stock <= 0
                                                ? 'Replenishment is needed.'
                                                : product.stock <= product.minStock
                                                    ? 'Stock is at or below the configured threshold.'
                                                    : 'Stock is above the configured minimum.'}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                                            <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Current stock</span>
                                            <strong>{product.stock} {product.unit}</strong>
                                        </div>
                                        <div style={{ height: 7, background: 'var(--color-bg-muted)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    width: `${product.stock <= 0 ? 0 : Math.min(100, (product.stock / Math.max(product.minStock * 2, product.stock, 1)) * 100)}%`,
                                                    height: '100%',
                                                    background: product.stock <= product.minStock ? 'var(--bb-sage)' : 'var(--bb-forest)',
                                                    borderRadius: 'var(--radius-pill)',
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                                        <span style={{ color: 'var(--color-text-secondary)' }}>Minimum threshold</span>
                                        <strong>{product.minStock} {product.unit}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                                        <span style={{ color: 'var(--color-text-secondary)' }}>Stock value at cost</span>
                                        <strong>{formatCurrency(stockValue)}</strong>
                                    </div>
                                    {lastMovement && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                                            <span style={{ color: 'var(--color-text-secondary)' }}>Last stock movement</span>
                                            <strong>{formatRelativeTime(lastMovement.date)}</strong>
                                        </div>
                                    )}
                                </div>

                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                                        gap: 'var(--space-2)',
                                        marginTop: 'var(--space-5)',
                                    }}
                                >
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        style={{ justifyContent: 'center' }}
                                        onClick={() => {
                                            setStockAction('in');
                                            setStockQuantity('1');
                                            setStockReason('Purchase / Restock');
                                            setStockError('');
                                            setShowStockModal(true);
                                        }}
                                    >
                                        <Plus size={15} /> Add Stock
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        style={{ justifyContent: 'center' }}
                                        onClick={() => {
                                            setStockAction('out');
                                            setStockQuantity('1');
                                            setStockReason('Sale');
                                            setStockError('');
                                            setShowStockModal(true);
                                        }}
                                    >
                                        <Minus size={15} /> Remove Stock
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        style={{ gridColumn: '1 / -1', justifyContent: 'center' }}
                                        onClick={() => navigate('/inventory')}
                                    >
                                        <ExternalLink size={14} /> Open Inventory
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section className="card">
                            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <History size={16} />
                                <h2 style={{ margin: 0, fontSize: 'var(--text-md)' }}>Recent stock movements</h2>
                            </div>
                            <div className="card-body">
                                {movements.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
                                        <RefreshCw size={22} color="var(--color-text-muted)" />
                                        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', margin: 'var(--space-2) 0 0' }}>
                                            No stock movement history recorded for this product.
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                                        {movements.map((movement) => (
                                            <div
                                                key={movement.id}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    gap: 'var(--space-3)',
                                                }}
                                            >
                                                <div style={{ display: 'flex', gap: 'var(--space-3)', minWidth: 0 }}>
                                                    <span
                                                        style={{
                                                            width: 32,
                                                            height: 32,
                                                            display: 'grid',
                                                            placeItems: 'center',
                                                            flexShrink: 0,
                                                            borderRadius: 'var(--radius-md)',
                                                            background: 'var(--color-bg-muted)',
                                                        }}
                                                    >
                                                        <RefreshCw size={14} />
                                                    </span>
                                                    <div style={{ minWidth: 0 }}>
                                                        <strong style={{ display: 'block', fontSize: 'var(--text-sm)' }}>
                                                            {movement.reason || (movement.type === 'in' ? 'Stock added' : movement.type === 'out' ? 'Stock removed' : 'Stock adjusted')}
                                                        </strong>
                                                        <span style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', marginTop: 3 }}>
                                                            {formatRelativeTime(movement.date)}
                                                        </span>
                                                        {movement.notes && (
                                                            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', margin: 'var(--space-1) 0 0', overflowWrap: 'anywhere' }}>
                                                                {movement.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <strong style={{ whiteSpace: 'nowrap', color: movement.type === 'in' ? 'var(--color-success)' : movement.type === 'out' ? 'var(--color-error)' : 'var(--color-text-primary)' }}>
                                                    {movement.type === 'in' ? '+' : movement.type === 'out' ? '−' : '±'}{movement.quantity}
                                                </strong>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="card">
                            <div className="card-header">
                                <h2 style={{ margin: 0, fontSize: 'var(--text-md)' }}>Sales summary</h2>
                            </div>
                            <div className="card-body">
                                <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                                        <span style={{ color: 'var(--color-text-secondary)' }}>Recorded orders</span>
                                        <strong>{relatedOrders.length}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                                        <span style={{ color: 'var(--color-text-secondary)' }}>Units sold</span>
                                        <strong>{unitsSold.toLocaleString('en-IN')}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                                        <span style={{ color: 'var(--color-text-secondary)' }}>Product revenue</span>
                                        <strong>{formatCurrency(productRevenue)}</strong>
                                    </div>
                                </div>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', margin: 'var(--space-4) 0 0' }}>
                                    Calculated from recorded orders that are not cancelled. This is not a date-filtered report.
                                </p>
                            </div>
                        </section>

                        <section className="card">
                            <div className="card-header">
                                <h2 style={{ margin: 0, fontSize: 'var(--text-md)' }}>Product information</h2>
                            </div>
                            <div className="card-body" style={{ display: 'grid', gap: 'var(--space-4)' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                                    <CalendarDays size={16} color="var(--color-text-muted)" />
                                    <div>
                                        <span style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>Created</span>
                                        <strong style={{ fontSize: 'var(--text-sm)' }}>{formatDate(product.createdAt)}</strong>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                                    <Clock3 size={16} color="var(--color-text-muted)" />
                                    <div>
                                        <span style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>Last updated</span>
                                        <strong style={{ fontSize: 'var(--text-sm)' }}>{formatDate(product.updatedAt)}</strong>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                                    <Package size={16} color="var(--color-text-muted)" />
                                    <div>
                                        <span style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>Product ID</span>
                                        <code style={{ fontSize: 'var(--text-xs)', overflowWrap: 'anywhere' }}>{product.id}</code>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}
