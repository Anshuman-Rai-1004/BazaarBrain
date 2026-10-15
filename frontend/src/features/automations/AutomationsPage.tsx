import { Zap, Info } from 'lucide-react';
import { DEMO_AUTOMATIONS } from '../../services/demoData';
import { formatDate } from '../../services/dataService';
import '../../components/ui/components.css';
import '../shared/placeholder.css';

export default function AutomationsPage() {
  return (
    <div className="placeholder-page">
      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-text">
            <h1>Automations</h1>
            <p>Create workflows to automate repetitive tasks across your business.</p>
          </div>
        </div>
      </div>

      <div className="demo-notice">
        <Info size={14} />
        <span>Automation execution is not yet connected. Configure workflow rules and triggers here.</span>
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        {DEMO_AUTOMATIONS.map(a => (
          <div key={a.id} className="card">
            <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div className={`stat-card-icon ${a.enabled ? 'green' : 'sage'}`} style={{ width: 40, height: 40 }}>
                  <Zap size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-md)' }}>{a.name}</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{a.description}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
                    Trigger: {a.trigger} → Action: {a.action}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span className={`badge ${a.enabled ? 'badge-success' : 'badge-neutral'}`}>
                  {a.enabled ? 'Enabled' : 'Disabled'}
                </span>
                {a.lastRun && (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    Last run: {formatDate(a.lastRun)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
