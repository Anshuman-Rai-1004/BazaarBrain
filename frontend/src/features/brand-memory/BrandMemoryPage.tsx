import { useState } from 'react';
import { Save, Check, CheckCircle } from 'lucide-react';
import '../../components/ui/components.css';
import '../shared/placeholder.css';

const LANGUAGES = [
  { value: 'en',       label: 'English'  },
  { value: 'hi',       label: 'Hindi'    },
  { value: 'hinglish', label: 'Hinglish' },
];

const TONES = [
  'Professional', 'Warm & Friendly', 'Casual', 'Enthusiastic', 'Minimal & Direct',
];

interface BrandForm {
  businessName:      string;
  tagline:           string;
  brandTone:         string;
  preferredLanguage: string;
  contactEmail:      string;
  contactPhone:      string;
  address:           string;
  restrictedClaims:  string;
  policies:          string;
}

function loadSavedForm(): BrandForm {
  try {
    const saved = localStorage.getItem('bb_brand_memory');
    if (saved) return JSON.parse(saved) as BrandForm;
  } catch { /* ignore */ }
  return {
    businessName:      'FarmFresh Store',
    tagline:           'Fresh from farm to table',
    brandTone:         'Professional',
    preferredLanguage: 'en',
    contactEmail:      'hello@farmfresh.example',
    contactPhone:      '+91 98765 43210',
    address:           'Sector 22, Gurugram, Haryana',
    restrictedClaims:  'No medical claims, no unverified certifications, no false discounts',
    policies:          'Free shipping on orders above ₹500. Easy 7-day returns.',
  };
}

export default function BrandMemoryPage() {
  const [form, setForm] = useState<BrandForm>(loadSavedForm);
  const [saved,  setSaved]  = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (field: keyof BrandForm, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  function handleSave() {
    setSaving(true);
    try {
      localStorage.setItem('bb_brand_memory', JSON.stringify(form));
      setSaved(true);
      setTimeout(() => { setSaved(false); setSaving(false); }, 2000);
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="placeholder-page">
      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-text">
            <h1>Brand Memory</h1>
            <p>Configure your business identity, tone, and content rules. Used by AI Studio for consistent generation.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saved
                ? <><CheckCircle size={15} /> Saved!</>
                : <><Save size={15} /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>

      {saved && (
        <div className="alert alert-success" style={{ marginBottom: 'var(--space-4)' }}>
          <Check size={14} /> Brand Memory saved to local storage successfully.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>

        {/* Business Identity */}
        <div className="card">
          <div className="card-header"><h3>Business Identity</h3></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Business Name</label>
              <input className="form-input" value={form.businessName} onChange={e => set('businessName', e.target.value)} placeholder="Your store name" />
            </div>
            <div className="form-group">
              <label className="form-label">Tagline</label>
              <input className="form-input" value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="e.g. Fresh from farm to table" />
            </div>
            <div className="form-group">
              <label className="form-label">Preferred Language</label>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {LANGUAGES.map(l => (
                  <button
                    key={l.value}
                    className={`btn btn-sm ${form.preferredLanguage === l.value ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => set('preferredLanguage', l.value)}
                    style={{ flex: 1 }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Brand Tone</label>
              <select className="form-select" value={form.brandTone} onChange={e => set('brandTone', e.target.value)}>
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <div className="form-hint">Controls language style in AI-generated content.</div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card">
          <div className="card-header"><h3>Contact Information</h3></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="hello@yourbrand.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" type="tel" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} placeholder="+91 XXXXX XXXXX" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Business Address</label>
              <textarea className="form-textarea" value={form.address} onChange={e => set('address', e.target.value)} placeholder="City, State, Country" rows={3} />
            </div>
          </div>
        </div>

        {/* Content Rules — full width */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <h3>Content Rules</h3>
            <span className="badge badge-info">Used by AI Studio</span>
          </div>
          <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Restricted / Unsupported Claims</label>
              <textarea
                className="form-textarea"
                value={form.restrictedClaims}
                onChange={e => set('restrictedClaims', e.target.value)}
                placeholder="Claims the AI should never make…"
                rows={4}
              />
              <div className="form-hint">e.g. No medical claims, no false certifications</div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Business Policies</label>
              <textarea
                className="form-textarea"
                value={form.policies}
                onChange={e => set('policies', e.target.value)}
                placeholder="Shipping, returns, guarantees…"
                rows={4}
              />
              <div className="form-hint">e.g. Free shipping above ₹500, 7-day returns</div>
            </div>
          </div>
        </div>
      </div>

      {/* Save footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saved ? <><CheckCircle size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}
