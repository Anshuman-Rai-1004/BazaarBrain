/* ===== Product Types ===== */

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  costPrice: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  brand: string;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  tags: string[];
  attributes: Record<string, string>;
  variants: ProductVariant[];
  images: string[];
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

/* ===== Inventory Types ===== */

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  date: string;
  notes: string;
}

/* ===== Order Types ===== */

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt: string;
  notes: string;
}

/* ===== Customer Types ===== */

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  tags: string[];
  totalOrders: number;
  totalSpent: number;
  followUpStatus: 'none' | 'pending' | 'contacted' | 'converted';
  createdAt: string;
}

/* ===== Campaign Types ===== */

export interface Campaign {
  id: string;
  name: string;
  description: string;
  channel: 'whatsapp' | 'instagram' | 'email' | 'sms' | 'other';
  status: 'draft' | 'review' | 'approved' | 'archived';
  content: string;
  productIds: string[];
  scheduledAt: string;
  createdAt: string;
}

/* ===== Catalog Types ===== */

export interface Catalog {
  id: string;
  name: string;
  description: string;
  productIds: string[];
  brandColor: string;
  logoUrl: string;
  status: 'draft' | 'published';
  createdAt: string;
}

/* ===== AI Types ===== */

export interface AIGeneration {
  id: string;
  type: 'description' | 'seo' | 'whatsapp' | 'instagram' | 'faq';
  productId: string;
  productName: string;
  input: Record<string, string>;
  output: string;
  language: 'en' | 'hi' | 'hinglish';
  tone: string;
  createdAt: string;
}

/* ===== Brand Memory ===== */

export interface BrandMemory {
  businessName: string;
  logoUrl: string;
  brandColors: string[];
  preferredLanguage: 'en' | 'hi' | 'hinglish';
  brandTone: string;
  terminology: Record<string, string>;
  restrictedClaims: string[];
  contactEmail: string;
  contactPhone: string;
  address: string;
  policies: string;
}

/* ===== Navigation ===== */

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  badge?: number;
  group: 'main' | 'intelligence' | 'business' | 'settings';
}

/* ===== Dashboard ===== */

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  lowStockCount: number;
  totalOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'product_added' | 'product_updated' | 'order_created' | 'ai_generated' | 'stock_updated';
  title: string;
  description: string;
  timestamp: string;
}

/* ===== Automation ===== */

export interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  enabled: boolean;
  lastRun: string | null;
  runCount: number;
}
