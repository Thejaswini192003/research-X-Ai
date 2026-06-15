import React, { useState, useEffect } from 'react';
import { Home, History, Settings, Folder, BookOpen, Trash2, Library, Star } from 'lucide-react';

export default function Sidebar({ 
  activeScreen, 
  setActiveScreen, 
  onOpenSettings, 
  history, 
  onSelectHistory, 
  onDeleteHistory,
  collections,
  onSelectCollection
}) {
  const [selectedCollection, setSelectedCollection] = useState(null);

  const handleCollectionClick = (colName) => {
    if (selectedCollection === colName) {
      setSelectedCollection(null);
      onSelectCollection(null);
    } else {
      setSelectedCollection(colName);
      onSelectCollection(colName);
    }
  };

  return (
    <div className="glass-sidebar">
      {/* Brand Logo */}
      <div style={{
        fontSize: '22px',
        fontWeight: 900,
        letterSpacing: '-0.03em',
        background: 'linear-gradient(to right, #ffffff, #6366f1)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '36px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Library size={24} style={{ color: 'var(--color-primary)' }} />
        ResearchX AI
      </div>

      {/* Main Menu Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '30px' }}>
        <div 
          onClick={() => { setActiveScreen('search'); setSelectedCollection(null); onSelectCollection(null); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '15px',
            color: activeScreen === 'search' ? '#fff' : 'var(--text-muted)',
            backgroundColor: activeScreen === 'search' ? 'rgba(255,255,255,0.06)' : 'transparent',
            transition: 'var(--transition-smooth)'
          }}
          className="menu-item"
        >
          <Home size={18} /> Dashboard
        </div>

        <div 
          onClick={() => { setActiveScreen('history'); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '15px',
            color: activeScreen === 'history' ? '#fff' : 'var(--text-muted)',
            backgroundColor: activeScreen === 'history' ? 'rgba(255,255,255,0.06)' : 'transparent',
            transition: 'var(--transition-smooth)'
          }}
          className="menu-item"
        >
          <History size={18} /> History
        </div>

        <div 
          onClick={onOpenSettings}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '15px',
            color: 'var(--text-muted)',
            transition: 'var(--transition-smooth)'
          }}
          className="menu-item"
        >
          <Settings size={18} /> Settings
        </div>
      </div>

      {/* Collections Section */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-dim)',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Folder size={12} /> Collections
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto' }}>
          {collections.map((col) => (
            <div
              key={col}
              onClick={() => handleCollectionClick(col)}
              style={{
                fontSize: '14px',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                color: selectedCollection === col ? 'var(--color-secondary)' : 'var(--text-muted)',
                backgroundColor: selectedCollection === col ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: selectedCollection === col ? 600 : 400
              }}
            >
              <span>•</span> {col}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Researches / Mini History */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-dim)',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <BookOpen size={12} /> Recent Research
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1 }}>
          {history.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--text-dim)', padding: '0 8px' }}>
              No research yet.
            </div>
          ) : (
            history.slice(0, 10).map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-glass)',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
                onClick={() => onSelectHistory(item)}
              >
                <div style={{
                  fontSize: '13px',
                  color: 'var(--text-main)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flex: 1,
                  marginRight: '8px'
                }}>
                  {item.query}
                </div>
                {item.saved && <Star size={12} fill="var(--color-secondary)" color="var(--color-secondary)" style={{ marginRight: '6px' }} />}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteHistory(item.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    opacity: 0.5
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = 1}
                  onMouseLeave={(e) => e.target.style.opacity = 0.5}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
