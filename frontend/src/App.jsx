import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MainSearch from './components/MainSearch';
import ResearchProgress from './components/ResearchProgress';
import ResearchReport from './components/ResearchReport';
import SettingsModal from './components/SettingsModal';
import { HelpCircle, Star, Folder, BookOpen, Trash2, Library, Calendar } from 'lucide-react';

const BACKEND_URL = 'http://localhost:5000';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('search'); // 'search' | 'researching' | 'report' | 'history'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // History & Collections
  const [history, setHistory] = useState([]);
  const [collections, setCollections] = useState([]);
  const [filterCollection, setFilterCollection] = useState(null);

  // Active Research State
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('deep');
  const [freshness, setFreshness] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [activeReport, setActiveReport] = useState(null);

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Load history & collections on startup
  useEffect(() => {
    fetchHistory();
    fetchCollections();
    initVoiceSearch();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch research history:', err);
    }
  };

  const fetchCollections = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/collections`);
      if (res.ok) {
        const data = await res.json();
        setCollections(data);
      }
    } catch (err) {
      console.error('Failed to fetch collections:', err);
    }
  };

  const initVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => setIsRecording(true);
      rec.onend = () => setIsRecording(false);
      
      rec.onresult = (e) => {
        const text = e.results[0][0].transcript;
        console.log('Voice recognition result:', text);
        handleSearch(text, { mode, freshness });
      };

      rec.onerror = (err) => {
        console.error('Speech recognition error:', err);
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  };

  const toggleVoice = () => {
    if (!recognition) {
      alert('Speech Recognition is not supported in this browser. Try Chrome or Safari.');
      return;
    }
    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  // Perform research (Connect via SSE stream)
  const handleSearch = async (searchQuery, options = {}) => {
    const researchMode = options.mode || 'deep';
    const researchFreshness = options.freshness || '';
    
    setQuery(searchQuery);
    setMode(researchMode);
    setFreshness(researchFreshness);
    setCurrentStep(1);
    setActiveScreen('researching');

    // Create EventSource URL. The backend uses only Context.dev access.
    let url = `${BACKEND_URL}/api/research/stream?query=${encodeURIComponent(searchQuery)}&mode=${researchMode}`;
    if (researchFreshness) {
      url += `&freshness=${researchFreshness}`;
    }

    console.log('Connecting to SSE stream:', url);
    const eventSource = new EventSource(url);

    let streamedReportText = '';
    let completedReportObject = null;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'progress') {
          setCurrentStep(data.step);
        } 
        else if (data.type === 'chunk') {
          setActiveScreen('report');
          streamedReportText += data.content;
          
          setActiveReport({
            query: searchQuery,
            mode: researchMode,
            report: streamedReportText,
            confidence: 80,
            sources: [],
            followUpQuestions: []
          });
        } 
        else if (data.type === 'done') {
          console.log('SSE Stream done, history item saved:', data.id);
          completedReportObject = data.historyItem;
          setActiveReport(completedReportObject);
          eventSource.close();
          fetchHistory();
        } 
        else if (data.type === 'error') {
          console.error('SSE reported error:', data.message);
          // Generic application level error alert
          alert(`Research process encountered an error: ${data.message}`);
          eventSource.close();
          setActiveScreen('search');
        }
      } catch (err) {
        console.error('Error handling SSE message:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('EventSource connection error:', err);
      eventSource.close();
      if (streamedReportText.length === 0) {
        alert('Could not establish connection to the backend server. Make sure it is running on port 5000!');
        setActiveScreen('search');
      }
    };
  };

  const handleSaveToggle = async (id, isSaved) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/history/${id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saved: isSaved })
      });
      if (res.ok) {
        if (activeReport && activeReport.id === id) {
          setActiveReport({ ...activeReport, saved: isSaved });
        }
        fetchHistory();
      }
    } catch (err) {
      console.error('Failed to toggle save status:', err);
    }
  };

  const handleDeleteHistory = async (id) => {
    if (!confirm('Are you sure you want to delete this research report?')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/history/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        if (activeReport && activeReport.id === id) {
          setActiveScreen('search');
          setActiveReport(null);
        }
        fetchHistory();
      }
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  const handleSelectHistory = (item) => {
    setActiveReport(item);
    setActiveScreen('report');
  };

  const filteredHistory = filterCollection 
    ? history.filter(h => h.collections && h.collections.includes(filterCollection))
    : history;

  return (
    <div className="app-container">
      <div className="aurora-bg">
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
        <div className="aurora-orb aurora-orb-3" />
      </div>

      <Sidebar 
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        onOpenSettings={() => setIsSettingsOpen(true)}
        history={history}
        onSelectHistory={handleSelectHistory}
        onDeleteHistory={handleDeleteHistory}
        collections={collections}
        onSelectCollection={setFilterCollection}
      />

      <div className="glass-main">
        {activeScreen === 'search' && (
          <MainSearch 
            onSearch={handleSearch} 
            isRecording={isRecording}
            toggleVoice={toggleVoice}
          />
        )}

        {activeScreen === 'researching' && (
          <ResearchProgress 
            query={query} 
            currentStep={currentStep}
            mode={mode}
          />
        )}

        {activeScreen === 'report' && activeReport && (
          <ResearchReport 
            report={activeReport}
            onBack={() => setActiveScreen('search')}
            onSaveToggle={handleSaveToggle}
            onFollowUp={(q) => handleSearch(q, { mode, freshness })}
          />
        )}

        {activeScreen === 'history' && (
          <div style={{ maxWidth: '850px', width: '100%', margin: '0 auto' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>
              Research Ledger
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
              Browse through your past research logs, facts check databases, and saved collections.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredHistory.length === 0 ? (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  No research records found. Start researching on the dashboard!
                </div>
              ) : (
                filteredHistory.map((item) => (
                  <div 
                    key={item.id} 
                    className="glass-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '24px',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleSelectHistory(item)}
                  >
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', color: 'white' }}>
                        {item.query}
                      </h3>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} /> {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                        <span style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
                          Confidence: {item.confidence}%
                        </span>
                        <span style={{ textTransform: 'capitalize' }}>
                          Mode: {item.mode}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleSaveToggle(item.id, !item.saved)}
                        style={{ background: 'none', border: 'none', color: item.saved ? 'var(--color-secondary)' : 'var(--text-dim)', cursor: 'pointer' }}
                      >
                        <Star size={18} fill={item.saved ? 'var(--color-secondary)' : 'none'} />
                      </button>
                      <button
                        onClick={() => handleDeleteHistory(item.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
