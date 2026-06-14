import React, { useState, useEffect } from 'react';
import Head from 'next/head';

// Educational Presets
const PRESETS = [
  {
    name: '🐍 Python Variables (Beginner)',
    course: 'Introduction to Python Programming',
    module: 'Variables and Data Types',
    lesson: 'What is a Variable?',
    level: 'Beginner',
    objective: 'Students will understand variables as named memory containers and write their first variable assignment.',
    content: 'A variable is a named container in computer memory that stores a value. Think of it like a labeled box: you give it a name and put something inside. In Python, you create a variable by writing a name, then an equals sign, then the value. For example:\nname = "Alice"\nstores the text "Alice" in memory. Variables can hold numbers, text, lists, and more. You can change what\'s inside a variable at any time.',
    purpose: 'Lesson visual / explanation image',
    style: 'Isometric 3D',
    placement: 'Inline within lesson content'
  },
  {
    name: '⚛️ Atomic Bonding (Intermediate)',
    course: 'High School General Chemistry',
    module: 'Chemical Bonding & Structures',
    lesson: 'Covalent vs. Ionic Bonds',
    level: 'Intermediate',
    objective: 'Students will contrast the electron-sharing of covalent bonds with the electron-transfer of ionic bonds.',
    content: 'Chemical bonds hold atoms together. In a Covalent Bond, atoms share electrons to achieve stability, like oxygen and hydrogen sharing electrons in a water molecule (H2O). In an Ionic Bond, one atom transfers electrons entirely to another, creating charged ions that attract each other, like sodium donating an electron to chlorine to form salt (NaCl). This difference dictates molecular properties.',
    purpose: 'Learning diagram',
    style: 'Diagram / infographic',
    placement: 'Inline within lesson content'
  },
  {
    name: '🎨 Web Color Theory (All levels)',
    course: 'UI/UX Design Foundations',
    module: 'Visual Design & Color Theory',
    lesson: 'Harmonies and Mood',
    level: 'All levels',
    objective: 'Students will apply monochromatic, analogous, and complementary color schemes to a web interface to evoke emotional responses.',
    content: 'Color harmonies define how colors relate on the color wheel. Monochromatic uses shades of a single color. Analogous uses adjacent colors for calm, cohesive feelings. Complementary uses opposite colors (like orange and blue) for high contrast and vibrant emphasis. Designers use these systems to guide user eyes, establish brand identity, and evoke specific moods.',
    purpose: 'Section header',
    style: 'Flat illustration',
    placement: 'Lesson thumbnail card'
  }
];

export default function Home() {
  // Form State
  const [form, setForm] = useState({
    course: 'Introduction to Python Programming',
    module: 'Understanding Variables and Data Types',
    lesson: 'What is a Variable?',
    content: 'A variable is a named container in computer memory that stores a value. Think of it like a labeled box: you give it a name and put something inside.',
    objective: 'Students will understand what a variable is and how to create one in Python',
    level: 'Beginner',
    purpose: 'Lesson visual / explanation image',
    style: 'Flat illustration',
    placement: 'Inline within lesson content',
    openai_model: '',
    openai_image_model: '',
    gemini_model: '',
    gemini_image_model: '',
  });

  // Providers & Keys Configuration
  const [provider, setProvider] = useState('mock');
  const [keys, setKeys] = useState({
    gemini: '',
    openai: '',
    groq: '',
    anthropic: '',
    hf: '',
    openrouter: '',
    nvidia: ''
  });

  // UI States
  const [loading, setLoading] = useState(false);
  const [pipelineStage, setPipelineStage] = useState(0); // 0: Idle, 1: Analyze, 2: Plan, 3: Generate, 4: Complete
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSeed, setActiveSeed] = useState<number>(42);
  const [imageLoading, setImageLoading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Load keys from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedGemini = localStorage.getItem('peer_academy_gemini_key') || '';
      const savedOpenai = localStorage.getItem('peer_academy_openai_key') || '';
      const savedGroq = localStorage.getItem('peer_academy_groq_key') || '';
      const savedAnthropic = localStorage.getItem('peer_academy_anthropic_key') || '';
      const savedHf = localStorage.getItem('peer_academy_hf_token') || '';
      const savedOpenRouter = localStorage.getItem('peer_academy_openrouter_key') || '';
      const savedNvidia = localStorage.getItem('peer_academy_nvidia_key') || '';
      const savedProvider = localStorage.getItem('peer_academy_provider') || 'mock';

      setKeys({
        gemini: savedGemini,
        openai: savedOpenai,
        groq: savedGroq,
        anthropic: savedAnthropic,
        hf: savedHf,
        openrouter: savedOpenRouter,
        nvidia: savedNvidia
      });
      setProvider(savedProvider);
      // Randomize initial seed
      setActiveSeed(Math.floor(Math.random() * 899999) + 100000);
    }
  }, []);

  const handleKeyChange = (providerName: string, val: string) => {
    setKeys(prev => {
      const updated = { ...prev, [providerName]: val };
      localStorage.setItem(`peer_academy_${providerName}_key`, val);
      if (providerName === 'hf') {
        localStorage.setItem('peer_academy_hf_token', val);
      }
      return updated;
    });
  };

  const handleProviderSelect = (prov: string) => {
    setProvider(prov);
    localStorage.setItem('peer_academy_provider', prov);
  };

  // Preset Applicator
  const applyPreset = (preset: typeof PRESETS[0]) => {
    setForm(prev => ({
      ...prev,
      course: preset.course,
      module: preset.module,
      lesson: preset.lesson,
      content: preset.content,
      objective: preset.objective,
      level: preset.level,
      purpose: preset.purpose,
      style: preset.style,
      placement: preset.placement
    }));
  };

  // Run Pipeline API call
  async function generateVisualPlan(forcedSeed?: number) {
    setLoading(true);
    setError(null);
    setResult(null);
    setImageLoading(true);

    const seedToUse = forcedSeed !== undefined ? forcedSeed : Math.floor(Math.random() * 899999) + 100000;
    setActiveSeed(seedToUse);

    // 3-Stage Progress Simulator while backend processes
    setPipelineStage(1);
    const stageTimer1 = setTimeout(() => setPipelineStage(2), 1600);
    const stageTimer2 = setTimeout(() => setPipelineStage(3), 3200);

    try {
      const apiEndpoint = (process.env.NEXT_PUBLIC_AGENT_API || 'http://localhost:8000') + '/generate';
      
      const payload = {
        ...form,
        provider,
        gemini_key: keys.gemini,
        openai_key: keys.openai,
        groq_key: keys.groq,
        anthropic_key: keys.anthropic,
        hf_token: keys.hf,
        openrouter_key: keys.openrouter,
        nvidia_key: keys.nvidia,
        seed: seedToUse
      };

      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server returned error status ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
      setPipelineStage(4);
    } catch (e: any) {
      setError(e.message || String(e));
      setPipelineStage(0);
      setImageLoading(false);
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setLoading(false);
    }
  }

  // Trigger regeneration with a new seed
  const regenerateImage = () => {
    const newSeed = Math.floor(Math.random() * 899999) + 100000;
    if (result) {
      generateVisualPlan(newSeed);
    }
  };

  // Image Downloader
  const handleDownload = async () => {
    if (!result?.image_url) return;
    try {
      const response = await fetch(result.image_url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // Sanitized filename
      const filename = `${form.lesson.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-visual.png`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Direct opening in a new tab if fetch fails due to CORS
      window.open(result.image_url, '_blank');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(() => {});
  };

  const isSafe = result ? (result.safety_check || '').toUpperCase().startsWith('SAFE') : true;

  return (
    <div className="app-container">
      <Head>
        <title>Peer Academy — Image Generation Agent</title>
        <meta name="description" content="AI educational visual designer that plans and constructs image prompts from course text." />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <header className="app-header">
        <div className="header-meta">
          <span className="platform-badge"><i className="ti ti-school"></i> Peer Academy Agent</span>
          <span className="version-tag">v2.0</span>
        </div>
        <h1 id="main-title">AI Image Generation Agent</h1>
        <p className="subtitle">Translate lesson goals and complex text into meaningful educational visual prompts and generated artwork.</p>
      </header>

      {/* Presets Bar */}
      <section className="preset-section">
        <span className="preset-label">Load Presets:</span>
        <div className="presets-list">
          {PRESETS.map((p, idx) => (
            <button key={idx} className="preset-btn" onClick={() => applyPreset(p)} id={`preset-btn-${idx}`}>
              {p.name}
            </button>
          ))}
        </div>
      </section>

      <div className="dashboard-grid">
        {/* LEFT COLUMN: Inputs & Config */}
        <div className="control-column">
          {/* CONFIGURATION PANEL */}
          <div className="glass-card" id="config-card">
            <h2 className="card-title"><i className="ti ti-settings"></i> Pipeline Configurations</h2>
            
            <div className="provider-select-group">
              <label className="input-label">Select Text LLM Provider (Free options recommended)</label>
              <div className="provider-tabs">
                {[
                  { id: 'mock', name: 'Mock Mode', desc: 'No keys (offline)' },
                  { id: 'gemini', name: 'Gemini 3.5', desc: 'Free via Google' },
                  { id: 'openai', name: 'OpenAI GPT-4o/Mini', desc: 'OpenAI Models' },
                  { id: 'groq', name: 'Groq Cloud', desc: 'Free & Fast' },
                  { id: 'openrouter', name: 'OpenRouter', desc: 'Free LLM Models' },
                  { id: 'nvidia', name: 'Nvidia NIM', desc: 'Free Credits' },
                  { id: 'anthropic', name: 'Claude 3.5', desc: 'Anthropic Key' },
                  { id: 'hf', name: 'Hugging Face', desc: 'HF Token' }
                ].map(p => (
                  <button
                    key={p.id}
                    className={`provider-tab ${provider === p.id ? 'active' : ''}`}
                    onClick={() => handleProviderSelect(p.id)}
                    type="button"
                    title={p.desc}
                    id={`provider-tab-${p.id}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* COURSE CONTENT FORM */}
          <div className="glass-card">
            <h2 className="card-title"><i className="ti ti-vocabulary"></i> Lesson Specifics</h2>
            
            <div className="form-double-row">
              <div className="form-group">
                <label htmlFor="input-course">Course Title</label>
                <input
                  id="input-course"
                  type="text"
                  value={form.course}
                  onChange={e => setForm({ ...form, course: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="input-module">Module Title</label>
                <input
                  id="input-module"
                  type="text"
                  value={form.module}
                  onChange={e => setForm({ ...form, module: e.target.value })}
                />
              </div>
            </div>

            <div className="form-double-row">
              <div className="form-group">
                <label htmlFor="input-lesson">Lesson Title</label>
                <input
                  id="input-lesson"
                  type="text"
                  value={form.lesson}
                  onChange={e => setForm({ ...form, lesson: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="input-level">Target Learner Level</label>
                <select
                  id="input-level"
                  value={form.level}
                  onChange={e => setForm({ ...form, level: e.target.value })}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>All levels</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="input-objective">Learning Objective</label>
              <input
                id="input-objective"
                type="text"
                value={form.objective}
                onChange={e => setForm({ ...form, objective: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="input-content">Lesson Text Content (Core material analyzed by agent)</label>
              <textarea
                id="input-content"
                value={form.content}
                rows={5}
                onChange={e => setForm({ ...form, content: e.target.value })}
              />
            </div>

            <div className="form-double-row">
              <div className="form-group">
                <label htmlFor="input-purpose">Image Purpose</label>
                <select
                  id="input-purpose"
                  value={form.purpose}
                  onChange={e => setForm({ ...form, purpose: e.target.value })}
                >
                  <option>Lesson visual / explanation image</option>
                  <option>Course thumbnail</option>
                  <option>Module banner</option>
                  <option>Learning diagram</option>
                  <option>Section header</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="input-style">Visual Style</label>
                <select
                  id="input-style"
                  value={form.style}
                  onChange={e => setForm({ ...form, style: e.target.value })}
                >
                  <option>Flat illustration</option>
                  <option>Photorealistic</option>
                  <option>Diagram / infographic</option>
                  <option>Isometric 3D</option>
                  <option>Sketch / hand-drawn</option>
                  <option>Minimalist icon-style</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="input-placement">Platform Placement</label>
              <select
                id="input-placement"
                value={form.placement}
                onChange={e => setForm({ ...form, placement: e.target.value })}
              >
                <option>Inline within lesson content</option>
                <option>Course homepage banner</option>
                <option>Module header</option>
                <option>Lesson thumbnail card</option>
                <option>Social media share image</option>
              </select>
            </div>

            <button
              id="submit-btn"
              className="generate-btn"
              onClick={() => generateVisualPlan()}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-mini"></span>
                  Processing Pipeline...
                </>
              ) : (
                <>
                  <i className="ti ti-sparkles"></i> Run
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Output & Visualization */}
        <div className="output-column">
          {/* PIPELINE PROGRESS BAR */}
          {loading && (
            <div className="glass-card progress-card animate-pulse">
              <h3 className="progress-title">Pipeline Execution Status</h3>
              <div className="pipeline-steps">
                <div className={`step-item ${pipelineStage >= 1 ? 'active' : ''} ${pipelineStage > 1 ? 'done' : ''}`}>
                  <span className="step-num">{pipelineStage > 1 ? '✓' : '1'}</span>
                  <div className="step-content">
                    <h5>Stage 1: Content Analysis</h5>
                    <p>Extracting core concepts and objectives...</p>
                  </div>
                </div>
                <div className={`step-item ${pipelineStage >= 2 ? 'active' : ''} ${pipelineStage > 2 ? 'done' : ''}`}>
                  <span className="step-num">{pipelineStage > 2 ? '✓' : '2'}</span>
                  <div className="step-content">
                    <h5>Stage 2: Metaphor Planning</h5>
                    <p>Mapping visuals, styles, and aspect ratio...</p>
                  </div>
                </div>
                <div className={`step-item ${pipelineStage >= 3 ? 'active' : ''} ${pipelineStage > 3 ? 'done' : ''}`}>
                  <span className="step-num">{pipelineStage > 3 ? '✓' : '3'}</span>
                  <div className="step-content">
                    <h5>Stage 3: Prompt Generation</h5>
                    <p>Writing detailed prompts and alt text...</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="error-card glass-card">
              <i className="ti ti-alert-triangle-filled"></i>
              <div>
                <h4>Pipeline Error</h4>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* MAIN RESULTS DISPLAY */}
          {result && !loading && (
            <div className="fade-in">
              {/* IMAGE PREVIEW PANEL */}
              <div className="glass-card image-preview-card">
                <h3 className="card-sublabel">Generated Course Artwork</h3>
                <div className="image-frame">
                  {imageLoading && (
                    <div className="image-loading-overlay">
                      <div className="spinner-large"></div>
                      <p>Generating artwork via Pollinations AI...</p>
                    </div>
                  )}
                  {result.image_url && (
                    <img
                      src={result.image_url}
                      alt={result.alt_text || 'Educational visual placeholder'}
                      className={`generated-artwork ${imageLoading ? 'loading' : 'loaded'}`}
                      onLoad={() => setImageLoading(false)}
                      onError={() => setImageLoading(false)}
                      onClick={() => setLightboxOpen(true)}
                    />
                  )}
                </div>
                <div className="image-controls">
                  <div className="seed-display">
                    <i className="ti ti-binary"></i>
                    <span>Seed: <strong>{activeSeed}</strong></span>
                  </div>
                  <div className="image-buttons">
                    <button className="icon-btn" onClick={regenerateImage} title="Generate new variation (random seed)">
                      <i className="ti ti-refresh"></i> Regenerate
                    </button>
                    <button className="icon-btn" onClick={handleDownload} title="Download high quality image file">
                      <i className="ti ti-download"></i> Download
                    </button>
                    <button className="icon-btn" onClick={() => setLightboxOpen(true)} title="Expand image to fullscreen">
                      <i className="ti ti-maximize"></i> Expand
                    </button>
                  </div>
                </div>
              </div>

              {/* CORE DETAILS */}
              <div className="score-safety-row">
                <div className="glass-card flex-one">
                  <h4 className="card-sublabel">Educational Relevance</h4>
                  <div className="relevance-wrapper">
                    <div className="relevance-circle" style={{
                      background: `conic-gradient(var(--primary) ${result.course_relevance_score || 0}%, rgba(255,255,255,0.05) 0)`
                    }}>
                      <div className="relevance-inner">
                        <span>{result.course_relevance_score || 0}%</span>
                      </div>
                    </div>
                    <div className="relevance-desc">
                      <h5>Lesson Alignment</h5>
                      <p>Determines how directly the visual supports the learning objective.</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card flex-one">
                  <h4 className="card-sublabel">Safety Evaluation</h4>
                  <div className={`safety-badge-panel ${isSafe ? 'safe' : 'unsafe'}`}>
                    <div className="safety-status-header">
                      <i className={isSafe ? "ti ti-shield-check" : "ti ti-shield-alert"}></i>
                      <span>{isSafe ? "Passed Safety Audit" : "Requires Admin Review"}</span>
                    </div>
                    <p className="safety-details">{result.safety_check}</p>
                  </div>
                </div>
              </div>

              {/* CONCEPT & PROMPT CARDS */}
              <div className="glass-card">
                <h4 className="card-sublabel">Image Concept & Metaphor</h4>
                <p className="concept-text">{result.image_concept}</p>
              </div>

              <div className="glass-card">
                <div className="label-with-action">
                  <h4 className="card-sublabel">Final Text-to-Image Prompt</h4>
                  <button className="text-copy-btn" onClick={() => copyToClipboard(result.image_prompt)}>
                    <i className="ti ti-copy"></i> Copy
                  </button>
                </div>
                <div className="code-block-wrapper">
                  <code>{result.image_prompt}</code>
                </div>
              </div>

              <div className="glass-card">
                <div className="label-with-action">
                  <h4 className="card-sublabel">Negative Prompt</h4>
                  <button className="text-copy-btn" onClick={() => copyToClipboard(result.negative_prompt)}>
                    <i className="ti ti-copy"></i> Copy
                  </button>
                </div>
                <div className="code-block-wrapper">
                  <code>{result.negative_prompt}</code>
                </div>
              </div>

              {/* DETAILS METADATA */}
              <div className="metadata-grid">
                <div className="glass-card">
                  <h5 className="meta-lbl">Aspect Ratio</h5>
                  <p className="meta-val">{result.aspect_ratio}</p>
                </div>
                <div className="glass-card">
                  <h5 className="meta-lbl">Placement</h5>
                  <p className="meta-val">{result.suggested_placement}</p>
                </div>
                <div className="glass-card">
                  <h5 className="meta-lbl">Alt Text (Accessibility)</h5>
                  <p className="meta-val">{result.alt_text}</p>
                </div>
                <div className="glass-card">
                  <h5 className="meta-lbl">Visual Style</h5>
                  <p className="meta-val">{form.style}</p>
                </div>
              </div>
            </div>
          )}

          {/* EMPTY STATE */}
          {!result && !loading && (
            <div className="empty-state glass-card">
              <i className="ti ti-photo-sparkle"></i>
              <h3>Image Planning Hub</h3>
              <p>Configure your LLM provider, enter course text on the left, and trigger the agent pipeline to generate prompts and educational visuals.</p>
            </div>
          )}
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      {lightboxOpen && result && (
        <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>
              <i className="ti ti-x"></i>
            </button>
            <img src={result.image_url} alt={result.alt_text} className="lightbox-img" />
            <div className="lightbox-caption">
              <h4>{form.lesson}</h4>
              <p>{result.alt_text}</p>
            </div>
          </div>
        </div>
      )}

      {/* EMBEDDED GLOBAL STYLING */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* General resets and base styling */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          background-color: #09090b;
          color: #f4f4f5;
          font-family: 'Outfit', sans-serif;
          min-height: 100vh;
          line-height: 1.5;
          overflow-x: hidden;
        }

        a {
          color: #6366f1;
          text-decoration: none;
          transition: color 0.2s;
        }
        a:hover {
          color: #a855f7;
          text-decoration: underline;
        }

        /* App Layout Container */
        .app-container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 3rem 1.5rem;
        }

        /* Header design */
        .app-header {
          margin-bottom: 2rem;
        }
        .header-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .platform-badge {
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
          border: 1px solid rgba(99, 102, 241, 0.3);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.2rem 0.75rem;
          border-radius: 50px;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .version-tag {
          font-size: 0.7rem;
          color: #71717a;
          background: rgba(255,255,255,0.05);
          padding: 0.1rem 0.5rem;
          border-radius: 4px;
          font-family: 'Fira Code', monospace;
        }
        h1#main-title {
          font-size: 2.5rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #f4f4f5 20%, #a5b4fc 60%, #e879f9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }
        .subtitle {
          font-size: 1.05rem;
          color: #a1a1aa;
          max-width: 750px;
        }

        /* Presets Section */
        .preset-section {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .preset-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #71717a;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .presets-list {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .preset-btn {
          background: rgba(255, 255, 255, 0.04);
          color: #e4e4e7;
          border: 1px solid rgba(255, 255, 255, 0.08);
          font-family: inherit;
          font-size: 0.85rem;
          font-weight: 500;
          padding: 0.4rem 0.85rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .preset-btn:hover {
          background: rgba(99, 102, 241, 0.15);
          border-color: rgba(99, 102, 241, 0.4);
          color: #c7d2fe;
          transform: translateY(-1px);
        }

        /* Glass Cards */
        .glass-card {
          background: rgba(18, 18, 22, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.07);
          padding: 1.75rem;
          border-radius: 16px;
          margin-bottom: 1.25rem;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }

        .card-title {
          font-size: 1.15rem;
          font-weight: 600;
          color: #f4f4f5;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .card-title i {
          color: #818cf8;
          font-size: 1.25rem;
        }

        .card-sublabel {
          font-size: 0.75rem;
          font-weight: 700;
          color: #71717a;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.75rem;
        }

        /* Form elements */
        .form-double-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-bottom: 1.25rem;
        }
        .form-group label {
          font-size: 0.85rem;
          font-weight: 500;
          color: #d4d4d8;
        }
        .form-group input, .form-group select, .form-group textarea {
          background: rgba(10, 10, 12, 0.6);
          color: #f4f4f5;
          border: 1px solid rgba(255, 255, 255, 0.12);
          font-family: inherit;
          font-size: 0.9rem;
          padding: 0.65rem 0.9rem;
          border-radius: 10px;
          outline: none;
          transition: all 0.25s;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
        }
        .form-group textarea {
          resize: vertical;
          min-height: 100px;
        }
        .helper-text {
          font-size: 0.75rem;
          color: #71717a;
          line-height: 1.3;
          margin-top: 0.15rem;
        }

        /* Providers tab selection */
        .provider-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 0.35rem;
          border-radius: 10px;
          margin-top: 0.5rem;
        }
        .provider-tab {
          flex: 1 1 auto;
          background: transparent;
          color: #a1a1aa;
          border: none;
          padding: 0.5rem 0.75rem;
          font-size: 0.8rem;
          font-family: inherit;
          font-weight: 500;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }
        .provider-tab:hover {
          color: #f4f4f5;
        }
        .provider-tab.active {
          background: rgba(99, 102, 241, 0.2);
          color: #c7d2fe;
          border: 1px solid rgba(99, 102, 241, 0.35);
        }

        .mock-banner {
          display: flex;
          gap: 0.75rem;
          background: rgba(99, 102, 241, 0.06);
          border: 1px solid rgba(99, 102, 241, 0.15);
          padding: 1rem;
          border-radius: 10px;
          margin-top: 0.5rem;
          color: #c7d2fe;
        }
        .mock-banner i {
          font-size: 1.5rem;
          color: #818cf8;
        }
        .mock-banner h4 {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.15rem;
        }
        .mock-banner p {
          font-size: 0.75rem;
          color: #a1a1aa;
          line-height: 1.4;
        }

        /* Action Buttons */
        .generate-btn {
          width: 100%;
          background: var(--gradient);
          color: #ffffff;
          border: none;
          font-family: inherit;
          font-size: 0.95rem;
          font-weight: 600;
          padding: 0.8rem;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        .generate-btn:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(168, 85, 247, 0.45);
        }
        .generate-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Dashboard columns layout */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        /* Micro spinners */
        .spinner-mini {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Pipeline stage visualization */
        .progress-card {
          border-color: rgba(99, 102, 241, 0.3);
          background: rgba(99, 102, 241, 0.04);
        }
        .progress-title {
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #818cf8;
          margin-bottom: 1rem;
        }
        .pipeline-steps {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          position: relative;
        }
        .pipeline-steps::before {
          content: '';
          position: absolute;
          left: 17px;
          top: 10px;
          bottom: 10px;
          width: 2px;
          background: rgba(255,255,255,0.06);
          z-index: 1;
        }
        .step-item {
          display: flex;
          align-items: start;
          gap: 1rem;
          z-index: 2;
          opacity: 0.4;
          transition: opacity 0.4s;
        }
        .step-item.active {
          opacity: 1;
        }
        .step-item.done {
          opacity: 0.85;
        }
        .step-num {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #18181b;
          border: 2px solid rgba(255,255,255,0.1);
          color: #a1a1aa;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s;
          flex-shrink: 0;
        }
        .step-item.active .step-num {
          border-color: #6366f1;
          color: #c7d2fe;
          background: rgba(99, 102, 241, 0.3);
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }
        .step-item.done .step-num {
          border-color: #22c55e;
          color: white;
          background: #22c55e;
        }
        .step-content h5 {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.15rem;
        }
        .step-content p {
          font-size: 0.75rem;
          color: #a1a1aa;
        }

        /* Error box styling */
        .error-card {
          display: flex;
          gap: 0.75rem;
          background: var(--error-bg);
          border: 1px solid var(--error-border);
          color: #fca5a5;
        }
        .error-card i {
          font-size: 1.5rem;
          color: #ef4444;
        }
        .error-card h4 {
          font-size: 0.95rem;
          font-weight: 600;
        }
        .error-card p {
          font-size: 0.8rem;
          margin-top: 0.15rem;
          line-height: 1.4;
        }

        /* Image Display Canvas */
        .image-preview-card {
          padding: 1.25rem;
        }
        .image-frame {
          position: relative;
          background: #09090b;
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 16/9;
          border: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .image-loading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(9,9,11,0.85);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          z-index: 10;
        }
        .spinner-large {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(99,102,241,0.2);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .generated-artwork {
          width: 100%;
          height: 100%;
          object-fit: contain;
          cursor: zoom-in;
          transition: filter 0.3s;
        }
        .generated-artwork.loading {
          filter: blur(10px);
        }
        .generated-artwork.loaded {
          filter: blur(0);
        }

        .image-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.75rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .seed-display {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          color: #71717a;
        }
        .image-buttons {
          display: flex;
          gap: 0.35rem;
        }
        .icon-btn {
          background: rgba(255,255,255,0.04);
          color: #e4e4e7;
          border: 1px solid rgba(255,255,255,0.08);
          font-family: inherit;
          font-size: 0.75rem;
          font-weight: 500;
          padding: 0.35rem 0.7rem;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          transition: all 0.2s;
        }
        .icon-btn:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.15);
          color: white;
        }

        /* Score & Safety columns */
        .score-safety-row {
          display: flex;
          gap: 1.25rem;
          margin-bottom: 1.25rem;
        }
        .flex-one {
          flex: 1;
          margin-bottom: 0;
        }
        .relevance-wrapper {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .relevance-circle {
          width: 65px;
          height: 65px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          flex-shrink: 0;
        }
        .relevance-inner {
          width: 53px;
          height: 53px;
          border-radius: 50%;
          background: #121216;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .relevance-inner span {
          font-size: 1.15rem;
          font-weight: 700;
          color: #f4f4f5;
        }
        .relevance-desc h5 {
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 0.15rem;
        }
        .relevance-desc p {
          font-size: 0.75rem;
          color: #a1a1aa;
          line-height: 1.3;
        }

        .safety-badge-panel {
          padding: 1rem;
          border-radius: 10px;
          margin-top: 0.5rem;
        }
        .safety-badge-panel.safe {
          background: rgba(34, 197, 94, 0.06);
          border: 1px solid rgba(34, 197, 94, 0.15);
          color: #86efac;
        }
        .safety-badge-panel.unsafe {
          background: rgba(245, 158, 11, 0.06);
          border: 1px solid rgba(245, 158, 11, 0.15);
          color: #fde047;
        }
        .safety-status-header {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        .safety-details {
          font-size: 0.75rem;
          color: #a1a1aa;
          line-height: 1.3;
        }

        /* Text outputs and code blocks */
        .concept-text {
          font-size: 0.9rem;
          color: #e4e4e7;
          line-height: 1.6;
        }
        .label-with-action {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .text-copy-btn {
          background: transparent;
          color: #818cf8;
          border: none;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .text-copy-btn:hover {
          color: #c7d2fe;
          text-decoration: underline;
        }
        .code-block-wrapper {
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 1rem;
        }
        .code-block-wrapper code {
          font-family: 'Fira Code', monospace;
          font-size: 0.8rem;
          color: #e4e4e7;
          white-space: pre-wrap;
          word-break: break-all;
          line-height: 1.5;
        }

        /* Metadata Details list */
        .metadata-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        .metadata-grid .glass-card {
          margin-bottom: 0;
          padding: 1rem 1.25rem;
        }
        .meta-lbl {
          font-size: 0.7rem;
          font-weight: 600;
          color: #71717a;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.15rem;
        }
        .meta-val {
          font-size: 0.85rem;
          font-weight: 500;
          color: #f4f4f5;
        }

        /* Empty states */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          color: #71717a;
          border: 1px dashed rgba(255, 255, 255, 0.1);
        }
        .empty-state i {
          font-size: 3rem;
          color: rgba(255, 255, 255, 0.05);
          margin-bottom: 1rem;
        }
        .empty-state h3 {
          font-size: 1.1rem;
          color: #a1a1aa;
          font-weight: 600;
          margin-bottom: 0.35rem;
        }
        .empty-state p {
          font-size: 0.8rem;
          max-width: 320px;
          line-height: 1.4;
        }

        /* Lightbox modal styling */
        .lightbox-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.92);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(8px);
        }
        .lightbox-content {
          position: relative;
          max-width: 90%;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .lightbox-close {
          position: absolute;
          top: -45px;
          right: 0;
          background: transparent;
          border: none;
          color: white;
          font-size: 1.75rem;
          cursor: pointer;
        }
        .lightbox-img {
          max-width: 100%;
          max-height: 75vh;
          object-fit: contain;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .lightbox-caption {
          margin-top: 1rem;
          text-align: center;
        }
        .lightbox-caption h4 {
          font-size: 1.05rem;
          font-weight: 600;
        }
        .lightbox-caption p {
          font-size: 0.8rem;
          color: #a1a1aa;
          margin-top: 0.25rem;
        }

        /* Keyframe animations */
        .fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Animation utilities */
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .7; }
        }

        /* Responsive Breakpoints */
        @media (max-width: 960px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .app-container {
            padding: 2rem 1rem;
          }
          h1#main-title {
            font-size: 2rem;
          }
          .provider-tabs {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.2rem;
          }
        }
        @media (max-width: 580px) {
          .form-double-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .score-safety-row {
            flex-direction: column;
          }
          .provider-tabs {
            grid-template-columns: 1fr 1fr;
          }
        }
      ` }} />
    </div>
  );
}
