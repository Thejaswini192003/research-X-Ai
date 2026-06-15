import React from 'react';
import { X, Settings, Shield, Info } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '30px',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={24} style={{ color: 'var(--color-primary)' }} /> Settings
        </h2>

        {/* Application Status Information */}
        <div style={{
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          fontSize: '14px',
          color: 'white',
          display: 'flex',
          gap: '12px'
        }}>
          <Shield size={24} style={{ flexShrink: 0, color: 'var(--color-primary)' }} />
          <div>
            <strong style={{ display: 'block', marginBottom: '4px' }}>Context.dev Authentication:</strong> 
            Research uses the Context.dev key configured on the backend. No OpenAI key is required.
          </div>
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-glass)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          fontSize: '13px',
          color: 'var(--text-muted)',
          display: 'flex',
          gap: '12px'
        }}>
          <Info size={20} style={{ flexShrink: 0, color: 'var(--text-dim)' }} />
          <div>
            Only Context.dev API access is needed. You can update it in the backend environment file.
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-primary" style={{ padding: '10px 24px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
