import { Info } from 'lucide-react';
import '../../components/ui/components.css';
import '../shared/placeholder.css';

export default function SettingsPage() {
  return (
    <div className="placeholder-page">
      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-text">
            <h1>Settings</h1>
            <p>Application configuration, AI provider settings, and data management.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        {/* AI Provider */}
        <div className="card">
          <div className="card-header"><h3>AI Provider</h3></div>
          <div className="card-body">
            <div className="demo-notice" style={{ marginBottom: 'var(--space-3)' }}>
              <Info size={14} />
              <span>No AI model is currently configured. AI Studio uses demo content generation.</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Provider</label>
                <select disabled style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-muted)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-sans)' }}>
                  <option>Local Model (Not Configured)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Model Endpoint</label>
                <input disabled placeholder="http://localhost:11434" style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-muted)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-sans)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Data */}
        <div className="card">
          <div className="card-header"><h3>Data Management</h3></div>
          <div className="card-body" style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button className="btn btn-secondary">Export Data</button>
            <button className="btn btn-secondary">Reset Demo Data</button>
          </div>
        </div>

        {/* About */}
        <div className="card">
          <div className="card-header"><h3>About BazaarBrain</h3></div>
          <div className="card-body">
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
              <p><strong>BazaarBrain</strong> — AI-Powered Commerce Intelligence Platform</p>
              <p style={{ marginTop: 'var(--space-2)' }}>Designed for local retailers, small businesses, Instagram sellers, and small e-commerce brands.</p>
              <p style={{ marginTop: 'var(--space-2)' }}>Version 0.1.0 · Built with React + TypeScript + Vite</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
