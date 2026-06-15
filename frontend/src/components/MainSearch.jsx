import React, { useState } from 'react';
import { Search, Mic, MicOff, Compass, Flame, ShieldAlert, Cpu, Briefcase, Landmark, Trophy, Microscope } from 'lucide-react';

export default function MainSearch({ onSearch, isRecording, toggleVoice }) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('deep');
  const [freshness, setFreshness] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), { mode, freshness });
    }
  };

  const handleSuggestionClick = (text) => {
    setQuery(text);
    onSearch(text, { mode, freshness });
  };

  const trendingTopics = [
    { text: 'EV market share in India', category: 'Business' },
    { text: 'How many AirPods were sold this year?', category: 'Tech' },
    { text: 'Latest Tesla sales figures', category: 'Finance' },
    { text: 'Best AI startups in Europe', category: 'Tech' },
    { text: 'India\'s GDP growth rate', category: 'Finance' },
    { text: 'Top YouTube creators in education', category: 'Business' }
  ];

  const categories = [
    { name: 'Technology', icon: <Cpu size={20} />, query: 'Key advancements in quantum computing' },
    { name: 'Business', icon: <Briefcase size={20} />, query: 'Top venture capital trends' },
    { name: 'Science', icon: <Microscope size={20} />, query: 'Recent breakthroughs in nuclear fusion' },
    { name: 'Politics', icon: <Landmark size={20} />, query: 'Global climate treaty progress' },
    { name: 'Finance', icon: <Flame size={20} />, query: 'Inflation trends in major economies' },
    { name: 'Sports', icon: <Trophy size={20} />, query: 'Formula 1 technical regulation changes' }
  ];

  return (
    <div style={{
      maxWidth: '850px',
      width: '100%',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minHeight: '80vh',
      gap: '40px'
    }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '56px',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          marginBottom: '16px',
          background: 'linear-gradient(to right, #ffffff, #a5b4fc, #6366f1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.1
        }}>
          Research Anything.
        </h1>
        <p style={{
          fontSize: '18px',
          color: 'var(--text-muted)',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: 1.5
        }}>
          Search the web, validate facts, extract tables, analyze timelines, and compile AI-powered intelligence reports in real-time.
        </p>
      </div>

      {/* Main Search Panel */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <form onSubmit={handleSubmit} className="search-container">
          <div className="search-box">
            <Search size={22} style={{ color: 'var(--text-dim)', marginLeft: '8px' }} />
            <input
              type="text"
              placeholder="Ask anything about the world..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
            {toggleVoice && (
              <button
                type="button"
                onClick={toggleVoice}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isRecording ? 'red' : 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  marginRight: '8px'
                }}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            )}
            <button type="submit" className="btn-primary" style={{ padding: '12px 28px' }}>
              Research →
            </button>
          </div>

          {/* Search Options Toolbar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '0 8px'
          }}>
            {/* Mode Selector */}
            <div style={{
              display: 'flex',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              padding: '4px'
            }}>
              <button
                type="button"
                onClick={() => setMode('deep')}
                style={{
                  background: mode === 'deep' ? 'rgba(255, 255, 255, 0.08)' : 'none',
                  border: 'none',
                  color: mode === 'deep' ? '#white' : 'var(--text-muted)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
              >
                🧠 Deep Research
              </button>
              <button
                type="button"
                onClick={() => setMode('fast')}
                style={{
                  background: mode === 'fast' ? 'rgba(255, 255, 255, 0.08)' : 'none',
                  border: 'none',
                  color: mode === 'fast' ? '#white' : 'var(--text-muted)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
              >
                ⚡ Fast Mode
              </button>
            </div>

            {/* Freshness Filter */}
            <select
              value={freshness}
              onChange={(e) => setFreshness(e.target.value)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-glass)',
                borderRadius: '12px',
                color: 'var(--text-main)',
                padding: '8px 16px',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="" style={{ background: '#0c1020' }}>Anytime</option>
              <option value="last_24_hours" style={{ background: '#0c1020' }}>Last 24 Hours</option>
              <option value="last_week" style={{ background: '#0c1020' }}>Last Week</option>
              <option value="last_month" style={{ background: '#0c1020' }}>Last Month</option>
              <option value="last_year" style={{ background: '#0c1020' }}>Last Year</option>
            </select>
          </div>
        </form>
      </div>

      {/* Trending Section */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--text-muted)',
          marginBottom: '16px'
        }}>
          <Flame size={16} style={{ color: 'orange' }} /> Trending Searches
        </div>
        <div style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          {trendingTopics.map((topic, idx) => (
            <div
              key={idx}
              onClick={() => handleSuggestionClick(topic.text)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-glass)',
                borderRadius: '30px',
                padding: '8px 16px',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
              className="glass-card"
            >
              {topic.text}
            </div>
          ))}
        </div>
      </div>

      {/* Categories Cards Grid */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--text-muted)',
          marginBottom: '16px'
        }}>
          <Compass size={16} style={{ color: 'var(--color-secondary)' }} /> Explore Domains
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '16px'
        }}>
          {categories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => handleSuggestionClick(cat.query)}
              className="glass-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                padding: '20px'
              }}
            >
              <div style={{
                color: 'var(--color-primary)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                padding: '12px',
                borderRadius: '12px'
              }}>
                {cat.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{cat.name}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Explore recent insights</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
