import React from 'react';
import { Loader2, CheckCircle2, Search, Globe, Eye, FileText, CheckSquare } from 'lucide-react';

export default function ResearchProgress({ query, currentStep, mode }) {
  const steps = [
    { id: 1, title: 'Search Strategy', desc: 'AI converts query into search targets', icon: <Search size={16} /> },
    { id: 2, title: 'Multi-Web Search', desc: 'Queries search index via Context.dev', icon: <Globe size={16} /> },
    { id: 3, title: 'Fact Cross-Validation', desc: 'Deduplicates & extracts markdown data', icon: <Eye size={16} /> },
    { id: 4, title: 'Report Compiler', desc: 'Generates report, statistics & charts', icon: <FileText size={16} /> }
  ];

  return (
    <div style={{
      maxWidth: '650px',
      width: '100%',
      margin: '80px auto',
      padding: '40px',
      display: 'flex',
      flexDirection: 'column',
      gap: '30px'
    }} className="glass-panel">
      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>
          {mode === 'fast' ? '⚡ Running Fast Research' : '🧠 Initializing Deep Research Agent'}
        </h2>
        <div style={{
          fontSize: '24px',
          fontWeight: 800,
          color: '#white',
          wordBreak: 'break-word'
        }}>
          "{query}"
        </div>
      </div>

      {/* Steps List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: '20px 0' }}>
        {steps.map((step) => {
          const isDone = currentStep > step.id;
          const isActive = currentStep === step.id;
          
          return (
            <div 
              key={step.id} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                border: isActive ? '1px solid var(--border-active)' : '1px solid transparent',
                transition: 'var(--transition-smooth)'
              }}
            >
              {/* Step Status Icon */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDone 
                  ? 'rgba(16, 185, 129, 0.15)' 
                  : (isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.02)'),
                color: isDone 
                  ? '#10b981' 
                  : (isActive ? 'var(--color-primary)' : 'var(--text-dim)'),
                border: isDone 
                  ? '1px solid #10b981' 
                  : (isActive ? '1px solid var(--color-primary)' : '1px solid var(--border-glass)'),
                flexShrink: 0
              }}>
                {isDone ? <CheckCircle2 size={18} /> : (isActive ? <Loader2 className="spinning" size={18} style={{ animation: 'spin 2s linear infinite' }} /> : step.icon)}
              </div>

              {/* Step Details */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: isActive ? '#white' : (isDone ? 'var(--text-main)' : 'var(--text-dim)'),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {step.title}
                  {isActive && <span style={{ fontSize: '11px', backgroundColor: 'var(--color-primary)', color: 'white', padding: '2px 8px', borderRadius: '99px', fontWeight: 600 }}>Active</span>}
                </div>
                <div style={{ fontSize: '13px', color: isDone || isActive ? 'var(--text-muted)' : 'var(--text-dim)' }}>
                  {step.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Animated Loading Skeleton simulating scanning */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
        <div className="skeleton" style={{ height: '12px', width: '90%' }}></div>
        <div className="skeleton" style={{ height: '12px', width: '75%' }}></div>
        <div className="skeleton" style={{ height: '12px', width: '85%' }}></div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinning {
          animation: spin 1.2s linear infinite !important;
        }
      `}</style>
    </div>
  );
}
