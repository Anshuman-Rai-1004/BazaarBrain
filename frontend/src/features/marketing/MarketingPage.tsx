import { Megaphone, Plus, Info } from 'lucide-react';
import { DEMO_CAMPAIGNS } from '../../services/demoData';
import '../../components/ui/components.css';
import '../shared/placeholder.css';

export default function MarketingPage() {
  return (
    <div className="placeholder-page">
      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-text">
            <h1>Marketing</h1>
            <p>Create and manage marketing campaigns across channels.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary">
              <Plus size={16} className="btn-icon" />
              New Campaign
            </button>
          </div>
        </div>
      </div>

      <div className="demo-notice">
        <Info size={14} />
        <span>Campaign publishing is not yet connected. Create drafts and content previews.</span>
      </div>

      {DEMO_CAMPAIGNS.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Megaphone size={24} /></div>
          <h3>No campaigns yet</h3>
          <p>Create your first marketing campaign to promote products on WhatsApp, Instagram, or email.</p>
          <button className="btn btn-primary"><Plus size={16} className="btn-icon" />Create Campaign</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {DEMO_CAMPAIGNS.map(c => (
            <div key={c.id} className="card">
              <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-md)', marginBottom: 4 }}>{c.name}</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{c.description}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span className="badge badge-neutral">{c.channel}</span>
                  <span className={`badge ${c.status === 'draft' ? 'badge-warning' : c.status === 'approved' ? 'badge-success' : 'badge-neutral'}`}>{c.status}</span>
                  <button className="btn btn-secondary btn-sm">Edit</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
