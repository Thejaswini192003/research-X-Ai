import React, { useState } from 'react';
import { ArrowLeft, Download, FileText, Share2, Clipboard, Check, Star, AlertCircle, Link2, ExternalLink } from 'lucide-react';
import { marked } from 'marked';

// Configure marked to open links in new tabs
const renderer = new marked.Renderer();
renderer.link = ({ href, title, text }) => {
  return `<a href="${href}" title="${title || ''}" target="_blank" rel="noopener noreferrer">${text} <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-left:2px"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></a>`;
};
marked.setOptions({ renderer });

export default function ResearchReport({ report, onBack, onSaveToggle, onFollowUp }) {
  const [copied, setCopied] = useState(false);

  // Helper to split metadata
  const parts = report.report.split('[REPORT_METADATA]');
  const mainReportMarkdown = parts[0].trim();
  
  let metadata = {};
  if (parts[1]) {
    try {
      let jsonStr = parts[1].trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '');
      }
      metadata = JSON.parse(jsonStr);
    } catch (err) {
      console.error('Failed to parse metadata in UI:', err);
    }
  }

  // Fallbacks if metadata isn't populated
  const confidence = report.confidence || metadata.confidenceScore || 75;
  const confidenceReason = report.summary || metadata.confidenceReason || 'Analyzed and cross-validated across sources.';
  const charts = metadata.charts || [];
  const followUps = report.followUpQuestions || metadata.followUpQuestions || [];

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(mainReportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `research_report_${report.id || 'export'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportPdf = () => {
    window.print();
  };

  // Get color for confidence score
  const getConfidenceColor = (score) => {
    if (score >= 85) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  return (
    <div style={{ maxWidth: '960px', width: '100%', margin: '0 auto', paddingBottom: '80px' }} className="print-area">
      {/* Top Toolbar */}
      <div className="no-print" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '30px',
        borderBottom: '1px solid var(--border-glass)',
        paddingBottom: '20px'
      }}>
        <button onClick={onBack} className="btn-secondary" style={{ padding: '8px 16px' }}>
          <ArrowLeft size={16} /> Back to Search
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => onSaveToggle(report.id, !report.saved)} 
            className="btn-secondary" 
            style={{ padding: '8px 16px', color: report.saved ? 'var(--color-secondary)' : 'var(--text-main)' }}
          >
            <Star size={16} fill={report.saved ? 'var(--color-secondary)' : 'none'} />
            {report.saved ? 'Saved' : 'Save Research'}
          </button>
          
          <button onClick={handleCopyMarkdown} className="btn-secondary" style={{ padding: '8px 16px' }}>
            {copied ? <Check size={16} style={{ color: '#10b981' }} /> : <Clipboard size={16} />}
            {copied ? 'Copied!' : 'Copy Markdown'}
          </button>

          <button onClick={handleDownloadJson} className="btn-secondary" style={{ padding: '8px 16px' }}>
            <Download size={16} /> JSON
          </button>

          <button onClick={handleExportPdf} className="btn-primary" style={{ padding: '8px 16px' }}>
            <FileText size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* Main Report Dashboard Layout */}
      <div style={{ display: 'flex', gap: '30px', flexDirection: 'column' }}>
        
        {/* Confidence Banner */}
        <div className="glass-panel" style={{
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          borderLeft: `6px solid ${getConfidenceColor(confidence)}`
        }}>
          {/* Circular Progress Gauge */}
          <div style={{ position: 'relative', width: '70px', height: '70px', flexShrink: 0 }}>
            <svg width="70" height="70" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={getConfidenceColor(confidence)}
                strokeDasharray={`${confidence}, 100`}
                strokeWidth="3.2"
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 4px ${getConfidenceColor(confidence)}44)` }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '15px',
              fontWeight: 800,
              color: 'white'
            }}>
              {confidence}%
            </div>
          </div>
          
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Fact Check Verification Rating
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              {confidenceReason}
            </p>
          </div>
        </div>

        {/* Scraped Content & Main Markdown Report */}
        <div className="glass-panel" style={{ padding: '40px' }}>
          <article 
            className="report-markdown"
            dangerouslySetInnerHTML={{ __html: marked(mainReportMarkdown) }}
          />
        </div>

        {/* Premium Custom Visual Charts (CSS-only for stability) */}
        {charts.length > 0 && (
          <div className="glass-panel no-print" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', color: 'white' }}>
              Data Visualizations
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              {charts.map((chart, idx) => {
                const maxVal = Math.max(...chart.values, 1);
                
                return (
                  <div key={idx} style={{ width: '100%' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '20px' }}>
                      {chart.title}
                    </h4>
                    
                    {/* Render Bar Chart */}
                    {chart.type === 'bar' && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        height: '220px',
                        borderBottom: '1px solid var(--border-glass)',
                        paddingBottom: '10px',
                        gap: '20px',
                        margin: '0 10px'
                      }}>
                        {chart.values.map((val, bIdx) => {
                          const percentage = (val / maxVal) * 100;
                          return (
                            <div key={bIdx} style={{
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              height: '100%',
                              justifyContent: 'flex-end'
                            }}>
                              {/* Hover Value Box */}
                              <div style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                color: 'var(--color-secondary)',
                                marginBottom: '6px'
                              }}>
                                {val.toLocaleString()}
                              </div>
                              
                              {/* Glowing Bar Column */}
                              <div style={{
                                width: '100%',
                                maxWidth: '48px',
                                height: `${percentage}%`,
                                background: 'linear-gradient(to top, var(--color-primary) 0%, var(--color-secondary) 100%)',
                                borderRadius: '6px 6px 0 0',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                                transition: 'height 1s ease-in-out'
                              }} />
                              
                              {/* Label below bar */}
                              <div style={{
                                fontSize: '12px',
                                color: 'var(--text-dim)',
                                marginTop: '10px',
                                textAlign: 'center',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                width: '100%'
                              }} title={chart.labels[bIdx]}>
                                {chart.labels[bIdx]}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Render Line/Row list if Line Chart */}
                    {chart.type !== 'bar' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {chart.values.map((val, lIdx) => {
                          const percentage = (val / maxVal) * 100;
                          return (
                            <div key={lIdx} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ width: '120px', fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {chart.labels[lIdx]}
                              </div>
                              <div style={{ flex: 1, height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                  width: `${percentage}%`,
                                  height: '100%',
                                  background: 'linear-gradient(to right, var(--color-primary), var(--color-accent))',
                                  borderRadius: '4px'
                                }} />
                              </div>
                              <div style={{ width: '60px', textAlign: 'right', fontSize: '13px', fontWeight: 700, color: 'white' }}>
                                {val.toLocaleString()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* References / Scraped Sources Registry */}
        {report.sources && report.sources.length > 0 && (
          <div className="glass-panel" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'white' }}>
              Scraped Sources & Reference Links
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {report.sources.map((source, idx) => (
                <a 
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    textDecoration: 'none',
                    height: '100%',
                    gap: '12px'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginBottom: '6px', lineHeight: 1.3 }}>
                      [{idx + 1}] {source.title}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.4, wordBreak: 'break-word' }}>
                      {source.description ? source.description.substring(0, 100) + '...' : 'Live web source scraped via Context.dev.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-secondary)' }}>
                    <Link2 size={12} /> {new URL(source.url).hostname} <ExternalLink size={10} />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Follow-up suggestion questions */}
        {followUps.length > 0 && (
          <div className="glass-panel no-print" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} style={{ color: 'var(--color-primary)' }} /> Follow-up Questions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {followUps.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => onFollowUp(question)}
                  style={{
                    textAlign: 'left',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '12px',
                    padding: '14px 20px',
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    e.target.style.borderColor = 'var(--border-active)';
                    e.target.style.color = '#white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.02)';
                    e.target.style.borderColor = 'var(--border-glass)';
                    e.target.style.color = 'var(--text-muted)';
                  }}
                >
                  {question} →
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Styled Print Rules */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-area {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          .glass-panel {
            background: none !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .report-markdown h1 {
            color: black !important;
            background: none !important;
            -webkit-text-fill-color: initial !important;
          }
          .report-markdown h2 {
            color: black !important;
            border-left-color: #333 !important;
          }
          .report-markdown p, .report-markdown li, .report-markdown td {
            color: #333 !important;
          }
        }
      `}</style>
    </div>
  );
}
