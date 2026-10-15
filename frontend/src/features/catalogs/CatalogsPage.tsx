import { BookOpen, Plus } from 'lucide-react';
import '../../components/ui/components.css';
import '../shared/placeholder.css';

export default function CatalogsPage() {
  return (
    <div className="placeholder-page">
      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-text">
            <h1>Catalogs</h1>
            <p>Create branded product catalogs for sharing and export.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary">
              <Plus size={16} className="btn-icon" />
              New Catalog
            </button>
          </div>
        </div>
      </div>

      <div className="empty-state">
        <div className="empty-state-icon"><BookOpen size={24} /></div>
        <h3>No catalogs yet</h3>
        <p>Create a product catalog to share with customers. Select products, customize branding, and preview before export.</p>
        <button className="btn btn-primary"><Plus size={16} className="btn-icon" />Create Catalog</button>
      </div>
    </div>
  );
}
