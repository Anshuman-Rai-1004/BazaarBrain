/**
 * DataService — abstraction layer for data access.
 * Currently uses localStorage + demo data.
 * Can be swapped to FastAPI backend without rewriting pages.
 */
import type { Product, Customer, Order, DashboardStats, StockMovement, BrandMemory, AIGeneration } from '../types';
import {
  DEMO_PRODUCTS,
  DEMO_CUSTOMERS,
  DEMO_ORDERS,
  DEMO_ACTIVITY,
} from './demoData';

const STORAGE_KEYS = {
  products: 'bb_products',
  customers: 'bb_customers',
  orders: 'bb_orders',
  movements: 'bb_movements',
} as const;

function safeGet<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    console.warn(`Failed to save data to localStorage key: ${key}`);
  }
}

/* ===== Products ===== */

export function getProducts(): Product[] {
  return safeGet<Product>(STORAGE_KEYS.products, DEMO_PRODUCTS);
}

export function getProduct(id: string): Product | undefined {
  return getProducts().find((p) => p.id === id);
}

export function saveProduct(product: Product): void {
  const products = getProducts();
  const idx = products.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    products[idx] = { ...product, updatedAt: new Date().toISOString() };
  } else {
    products.push({ ...product, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  safeSet(STORAGE_KEYS.products, products);
}

// deleteProduct placeholder removed; proper implementation defined later

/* ===== Customers ===== */

export function getCustomers(): Customer[] {
  return safeGet<Customer>(STORAGE_KEYS.customers, DEMO_CUSTOMERS);
}

export function getCustomer(id: string): Customer | undefined {
  return getCustomers().find((c) => c.id === id);
}

/* ===== Orders ===== */

export function getOrders(): Order[] {
  return safeGet<Order>(STORAGE_KEYS.orders, DEMO_ORDERS);
}

export function getOrder(id: string): Order | undefined {
  return getOrders().find((o) => o.id === id);
}

/* ===== Dashboard ===== */

export function getDashboardStats(): DashboardStats {
  const products = getProducts();
  const orders = getOrders();
  const customers = getCustomers();

  const activeProducts = products.filter((p) => p.status === 'active');
  const lowStockCount = products.filter((p) => p.stock <= p.minStock && p.status === 'active').length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  return {
    totalProducts: products.length,
    activeProducts: activeProducts.length,
    lowStockCount,
    totalOrders: orders.length,
    pendingOrders,
    totalCustomers: customers.length,
    totalRevenue,
    recentActivity: DEMO_ACTIVITY.slice(0, 5),
  };
}

// ----- Product CRUD -----
export function addProduct(product: Product): void {
  const products = getProducts();
  if (products.some(p => p.sku === product.sku)) {
    throw new Error('SKU must be unique');
  }
  products.push({ ...product, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  safeSet(STORAGE_KEYS.products, products);
}

export function updateProduct(updated: Product): void {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === updated.id);
  if (idx === -1) throw new Error('Product not found');
  if (updated.sku !== products[idx].sku && products.some(p => p.sku === updated.sku)) {
    throw new Error('SKU must be unique');
  }
  products[idx] = { ...updated, updatedAt: new Date().toISOString() };
  safeSet(STORAGE_KEYS.products, products);
}

export function deleteProduct(id: string): void {
  const products = getProducts().filter(p => p.id !== id);
  safeSet(STORAGE_KEYS.products, products);
}

// ----- Stock Movements -----
export function getStockMovements(): StockMovement[] {
  return safeGet<StockMovement>(STORAGE_KEYS.movements, []);
}

export function adjustStock(productId: string, delta: number, reason: string, type?: 'in' | 'out'): void {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === productId);
  if (idx === -1) throw new Error('Product not found');
  const product = products[idx];
  const newStock = product.stock + delta;
  if (newStock < 0) throw new Error('Insufficient stock');
  product.stock = newStock;
  product.updatedAt = new Date().toISOString();
  safeSet(STORAGE_KEYS.products, products);

  const movements = getStockMovements();
  movements.push({
    id: `mov_${Date.now()}`,
    productId: product.id,
    productName: product.name,
    type: type ?? (delta > 0 ? 'in' : 'out'),
    quantity: Math.abs(delta),
    reason,
    date: new Date().toISOString(),
    notes: '',
  });
  safeSet(STORAGE_KEYS.movements, movements);
}

// ----- Order Updates -----
export function updateOrder(updated: Order): void {
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === updated.id);
  if (idx === -1) throw new Error('Order not found');
  orders[idx] = { ...updated, updatedAt: new Date().toISOString() };
  safeSet(STORAGE_KEYS.orders, orders);
}

export function changeOrderStatus(orderId: string, newStatus: Order['status']): void {
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx === -1) throw new Error('Order not found');
  const order = orders[idx];
  const oldStatus = order.status;

  // Define valid transitions
  const validTransitions: Record<Order['status'], Order['status'][]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  if (!validTransitions[oldStatus].includes(newStatus)) {
    throw new Error(`Cannot transition order from '${oldStatus}' to '${newStatus}'`);
  }

  // Deduct stock when order is confirmed (pending → confirmed)
  // This is the single point of stock deduction to prevent overselling.
  if (oldStatus === 'pending' && newStatus === 'confirmed') {
    const products = getProducts();
    // Validate all items have enough stock before deducting any
    for (const item of order.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new Error(`Product "${item.productName}" not found in inventory`);
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for "${item.productName}" (available: ${product.stock}, required: ${item.quantity})`);
      }
    }
    // Now apply deductions atomically
    for (const item of order.items) {
      const pIdx = products.findIndex(p => p.id === item.productId);
      products[pIdx].stock -= item.quantity;
      products[pIdx].updatedAt = new Date().toISOString();
      const movements = getStockMovements();
      movements.push({
        id: `mov_${Date.now()}_${pIdx}`,
        productId: item.productId,
        productName: item.productName,
        type: 'out',
        quantity: item.quantity,
        reason: `Order confirmed: ${orderId}`,
        date: new Date().toISOString(),
        notes: '',
      });
      safeSet(STORAGE_KEYS.movements, movements);
    }
    safeSet(STORAGE_KEYS.products, products);
  }

  // Restore stock when cancelled from confirmed or processing
  // Do NOT restore if cancelled from shipped (goods already left warehouse).
  if (newStatus === 'cancelled' && (oldStatus === 'confirmed' || oldStatus === 'processing')) {
    const products = getProducts();
    for (const item of order.items) {
      const pIdx = products.findIndex(p => p.id === item.productId);
      if (pIdx !== -1) {
        products[pIdx].stock += item.quantity;
        products[pIdx].updatedAt = new Date().toISOString();
        const movements = getStockMovements();
        movements.push({
          id: `mov_${Date.now()}_${pIdx}`,
          productId: item.productId,
          productName: item.productName,
          type: 'in',
          quantity: item.quantity,
          reason: `Order cancelled: ${orderId}`,
          date: new Date().toISOString(),
          notes: '',
        });
        safeSet(STORAGE_KEYS.movements, movements);
      }
    }
    safeSet(STORAGE_KEYS.products, products);
  }

  orders[idx].status = newStatus;
  orders[idx].updatedAt = new Date().toISOString();
  safeSet(STORAGE_KEYS.orders, orders);
}

// ----- Brand Memory -----
export function getBrandMemory(): BrandMemory | undefined {
  const raw = localStorage.getItem('bb_brand_memory');
  if (!raw) return undefined;
  try { return JSON.parse(raw) as BrandMemory; } catch { return undefined; }
}

export function saveBrandMemory(memory: BrandMemory): void {
  localStorage.setItem('bb_brand_memory', JSON.stringify(memory));
}

// ----- AI Generation History -----
export function getAIGenerations(): AIGeneration[] {
  return safeGet<AIGeneration>('bb_ai_generations', []);
}

export function saveAIGeneration(gen: AIGeneration): void {
  const gens = getAIGenerations();
  gens.push(gen);
  safeSet<AIGeneration>('bb_ai_generations', gens);
}

export function deleteAIGeneration(id: string): void {
  const gens = getAIGenerations().filter(g => g.id !== id);
  safeSet<AIGeneration>('bb_ai_generations', gens);
}
// Duplicate order functions removed – earlier implementation retained

/* ===== Utility ===== */

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr: string): string {
  try {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = now - then;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
}
