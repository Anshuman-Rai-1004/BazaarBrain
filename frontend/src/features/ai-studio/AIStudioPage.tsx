import { useState, useMemo } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Info,
  FileText,
  MessageCircle,
  HelpCircle,
  Search as SearchIcon,
  Globe,
} from 'lucide-react';
import { getProducts } from '../../services/dataService';
import '../../components/ui/components.css';
import '../shared/placeholder.css';

type GenerationType = 'description' | 'seo' | 'whatsapp' | 'instagram' | 'faq';
type Language = 'en' | 'hi' | 'hinglish';

const GENERATION_TYPES: { id: GenerationType; label: string; icon: typeof FileText; desc: string }[] = [
  { id: 'description', label: 'Product Description', icon: FileText, desc: 'Generate compelling product descriptions' },
  { id: 'seo', label: 'SEO Title & Meta', icon: SearchIcon, desc: 'Create optimized titles and meta descriptions' },
  { id: 'whatsapp', label: 'WhatsApp Copy', icon: MessageCircle, desc: 'Promotional messages for WhatsApp' },
  { id: 'instagram', label: 'Instagram Caption', icon: MessageCircle, desc: 'Captions and hashtags for Instagram' },
  { id: 'faq', label: 'Product FAQ', icon: HelpCircle, desc: 'Answer common customer questions' },
];

const TONES = ['Professional', 'Friendly', 'Casual', 'Enthusiastic', 'Minimal'];

export default function AIStudioPage() {
  const products = useMemo(() => getProducts(), []);
  const [selectedType, setSelectedType] = useState<GenerationType>('description');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [tone, setTone] = useState('Professional');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  async function handleGenerate() {
    if (!selectedProduct || generating) return;

    setGenerating(true);
    setOutput('');
    setCopied(false);

    try {
      const response = await fetch(
        `http://localhost:5000/api/ai/${selectedType}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: selectedProduct.name,
            category: selectedProduct.category,
            details: [
              selectedProduct.description,
              ...Object.entries(selectedProduct.attributes).map(
                ([key, value]) => `${key}: ${value}`
              )
            ].filter(Boolean).join('\n'),
            price: selectedProduct.sellingPrice,
            stock: selectedProduct.stock,
            language:
              language === 'en'
                ? 'English'
                : language === 'hi'
                  ? 'Hindi'
                  : 'Hinglish',
            tone
          })
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || result.error || 'AI generation failed.'
        );
      }

      const generatedText =
        result.data?.content ?? result.data?.description;

      if (typeof generatedText !== 'string' || !generatedText.trim()) {
        throw new Error('The AI returned an empty response.');
      }

      setOutput(generatedText.trim());
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'An unexpected error occurred.';

      setOutput(`AI generation failed: ${message}`);
    } finally {
      setGenerating(false);
    }
  }
function handleCopy() {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg-surface)',
    fontSize: 'var(--text-sm)',
    fontFamily: 'var(--font-sans)',
    color: 'var(--color-text-primary)',
  };

  return (
    <div className="placeholder-page">
      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-text">
            <h1>AI Studio</h1>
            <p>Generate product content using AI. Select a product and content type to begin.</p>
          </div>
        </div>
      </div>

      <div className="demo-notice">
        <Info size={14} />
        <span>All content types use your locally running Qwen AI model. Generation may take a little time on CPU.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 'var(--space-4)', alignItems: 'start' }}>
        {/* Left — Options Panel */}
        <div className="card">
          <div className="card-header">
            <h3>Configuration</h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Content Type */}
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 'var(--space-2)' }}>
                Content Type
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                {GENERATION_TYPES.map(t => (
                  <button
                    key={t.id}
                    className={`nav-item ${selectedType === t.id ? 'active' : ''}`}
                    onClick={() => setSelectedType(t.id)}
                    style={{
                      cursor: 'pointer', padding: '6px 10px', borderRadius: 'var(--radius-md)',
                      border: selectedType === t.id ? '1px solid var(--bb-sage)' : '1px solid transparent',
                      background: selectedType === t.id ? 'rgba(156,167,99,0.08)' : 'transparent',
                      fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 8,
                      color: selectedType === t.id ? 'var(--bb-sage-dark)' : 'var(--color-text-secondary)',
                      fontWeight: selectedType === t.id ? 500 : 400,
                      textDecoration: 'none', fontFamily: 'var(--font-sans)',
                    }}
                  >
                    <t.icon size={15} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Selector */}
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 'var(--space-2)' }}>
                Select Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                style={inputStyles}
              >
                <option value="">Choose a product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 'var(--space-2)' }}>
                Language
              </label>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['en', 'hi', 'hinglish'] as Language[]).map(l => (
                  <button
                    key={l}
                    className={`btn btn-sm ${language === l ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setLanguage(l)}
                    style={{ flex: 1 }}
                  >
                    {l === 'en' ? 'English' : l === 'hi' ? 'Hindi' : 'Hinglish'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 'var(--space-2)' }}>
                Tone
              </label>
              <select value={tone} onChange={(e) => setTone(e.target.value)} style={inputStyles}>
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Generate Button */}
            <button
              className="btn btn-highlight"
              onClick={handleGenerate}
              disabled={!selectedProduct || generating}
              style={{ width: '100%', justifyContent: 'center', opacity: (!selectedProduct || generating) ? 0.6 : 1 }}
            >
              {generating ? <RefreshCw size={16} className="btn-icon" style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={16} className="btn-icon" />}
              {generating ? 'Generating...' : 'Generate Content'}
            </button>
          </div>
        </div>

        {/* Right — Output Panel */}
        <div className="card">
          <div className="card-header">
            <h3>
              {GENERATION_TYPES.find(t => t.id === selectedType)?.label || 'Output'}
              {selectedProduct ? ` — ${selectedProduct.name}` : ''}
            </h3>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {output && (
                <>
                  <button className="btn btn-ghost btn-sm" onClick={handleCopy}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={handleGenerate} disabled={generating}>
                    <RefreshCw size={14} />
                    Regenerate
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="card-body">
            {!selectedProduct ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Sparkles size={24} />
                </div>
                <h3>Select a product to start</h3>
                <p>Choose a product and content type from the left panel, then click Generate Content.</p>
              </div>
            ) : !output ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Globe size={24} />
                </div>
                <h3>Ready to generate</h3>
                <p>Click "Generate Content" to create {GENERATION_TYPES.find(t => t.id === selectedType)?.label.toLowerCase()} for {selectedProduct.name}.</p>
              </div>
            ) : (
              <div
                style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-sm)',
                  lineHeight: 1.7,
                  color: 'var(--color-text-primary)',
                  padding: 'var(--space-4)',
                  background: 'var(--color-bg-muted)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-light)',
                }}
              >
                {output}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
