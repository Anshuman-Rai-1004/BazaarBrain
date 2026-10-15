
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './features/dashboard/Dashboard';
import ProductsPage from './features/products/ProductsPage';
import InventoryPage from './features/inventory/InventoryPage';
import AIStudioPage from './features/ai-studio/AIStudioPage';
import MarketingPage from './features/marketing/MarketingPage';
import CatalogsPage from './features/catalogs/CatalogsPage';
import CustomersPage from './features/customers/CustomersPage';
import OrdersPage from './features/orders/OrdersPage';
import AnalyticsPage from './features/analytics/AnalyticsPage';
import AutomationsPage from './features/automations/AutomationsPage';
import BrandMemoryPage from './features/brand-memory/BrandMemoryPage';
import SettingsPage from './features/settings/SettingsPage';

function NotFound() {
  return (
    <section style={{ padding: 32 }}>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
    </section>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:productId" element={<ProductsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="ai-studio" element={<AIStudioPage />} />
          <Route path="marketing" element={<MarketingPage />} />
          <Route path="catalogs" element={<CatalogsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="automations" element={<AutomationsPage />} />
          <Route path="brand-memory" element={<BrandMemoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
