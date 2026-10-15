import { useState } from 'react';
import { Save, Check } from 'lucide-react';
import '../../components/ui/components.css';
import '../shared/placeholder.css';

export default function BrandMemoryPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    businessName: 'FarmFresh Store',
    brandTone: 'Professional, warm, and approachable',
    preferredLanguage: 'en',
    contactEmail: 'hello@farmfresh.example',
    contactPhone: '+91 98765 43210',
    address: 'Sector 22, Gurugram, Haryana',
    restrictedClaims: 'No medical claims, no unverified certifications, no false discounts',
    policies: 'Free shipping on orders above ₹500. Easy 7-day returns.',
  });

  function handleSave() {
    try {
      localStorage.setItem('bb_brand_memory', JSON.stringify(form));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Handle storage error gracefully
    }
  }

  const inputStyles: React.CSSProperties = {
    width: '100%', padding: '8px 12px',
    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg-surface)', fontSize: 'var(--text-sm)',
    fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)',
  };

  const labelStyles: React.CSSProperties = {
    fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)',
    display: 'block', marginBottom: 'var(--space-1)',
    textTransform: 'uppercase', letterSpacing: '0.04em',
  };

  return (
    <div className="placeholder-page">
      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-text">
            <h1>Brand Memory</h1>
            <p>Configure your business identity, tone, and rules for AI-generated content.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={handleSave}>
              {saved ? <Check size={16} className="btn-icon" /> : <Save size={16} className="btn-icon" />}
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div className="card">
          <div className="card-header"><h3>Business Identity</h3></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label style={labelStyles}>Business Name</label>
              <input style={inputStyles} value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyles}>Brand Tone</label>
              <input style={inputStyles} value={form.brandTone} onChange={e => setForm(f => ({ ...f, brandTone: e.target.value }))} placeholder="e.g., Professional, friendly, enthusiastic" />
            </div>
            <div>
              <label style={labelStyles}>Preferred Language</label>
              <select style={inputStyles} value={form.preferredLanguage} onChange={e => setForm(f => ({ ...f, preferredLanguage: e.target.value }))}>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="hinglish">Hinglish</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Contact Information</h3></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label style={labelStyles}>Email</label>
              <input style={inputStyles} type="email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyles}>Phone</label>
              <input style={inputStyles} value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyles}>Address</label>
              <input style={inputStyles} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header"><h3>Content Rules</h3></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label style={labelStyles}>Restricted / Unsupported Claims</label>
              <textarea style={{ ...inputStyles, minHeight: 80, resize: 'vertical' }} value={form.restrictedClaims} onChange={e => setForm(f => ({ ...f, restrictedClaims: e.target.value }))} placeholder="List claims that AI should never make in generated content" />
            </div>
            <div>
              <label style={labelStyles}>Business Policies</label>
              <textarea style={{ ...inputStyles, minHeight: 80, resize: 'vertical' }} value={form.policies} onChange={e => setForm(f => ({ ...f, policies: e.target.value }))} placeholder="Shipping, returns, guarantees, etc." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
