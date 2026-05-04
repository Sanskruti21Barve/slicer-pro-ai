import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import './App.css';

const DOMAINS_LIST = ['google.com', 'mit.edu', 'nasa.gov', 'apple.com', 'isro.gov.in', 'harvard.edu'];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDark, setIsDark] = useState(false);
  const [email, setEmail] = useState('');
  const [fileName, setFileName] = useState('No file chosen');
  const [history, setHistory] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [bulkResults, setBulkResults] = useState([]);
  const [gameWon, setGameWon] = useState(false);

  // Game States
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [timer, setTimer] = useState(30);
  const [gameActive, setGameActive] = useState(false);

  const getDomainType = (dom) => {
    if (dom.endsWith('.edu') || dom.endsWith('.ac.in')) return 'Educational';
    if (dom.endsWith('.gov') || dom.endsWith('.gov.in')) return 'Government';
    return 'Commercial';
  };

  // High-Intensity Celebration with "Balloons"
  const celebrate = () => {
    const duration = 5 * 1000; // 5 seconds of fun
    const animationEnd = Date.now() + duration;

    // 1. Massive Confetti Rain
    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      
      const particleCount = 80 * (timeLeft / duration);
      
      // Standard colorful confetti
      confetti({
        particleCount,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
      });

      // 2. The "Balloon" Effect (Large circular particles)
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#FF4500', '#1E90FF'],
        shapes: ['circle'], // Makes them look like round balloons
        scalar: 4, // Scale them up to be very large
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FF1493', '#00CED1', '#7FFF00'],
        shapes: ['circle'],
        scalar: 4,
      });
    }, 150);
  };
  // CSV Export
  const downloadCSV = () => {
    const headers = "Username,Domain,Category,Source\n";
    const rows = history.map(h => `${h.user},${h.dom},${h.type},${h.method}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sliced_emails.csv';
    a.click();
  };

  const handleSlice = () => {
    if (!email.includes('@')) return alert("Enter valid email!");
    const [user, dom] = email.split('@');
    const result = { user, dom, type: getDomainType(dom), method: 'Manual' };
    setLastResult(result);
    setHistory([result, ...history]);
    setBulkResults([]); 
    celebrate();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Strict Validation: Must be .txt
    if (!file.name.endsWith(".txt")) {
      alert("Error: Only .txt files are allowed!");
      e.target.value = null;
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const lines = event.target.result.split(/\r?\n/);
      const newEntries = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed.includes('@')) {
          const [user, dom] = trimmed.split('@');
          return { user, dom, type: getDomainType(dom), method: 'Bulk' };
        }
        return null;
      }).filter(Boolean);

      if (newEntries.length === 0) {
        alert("The file contains no valid emails!");
        return;
      }

      setBulkResults(newEntries);
      setHistory([...newEntries, ...history]);
      setLastResult(null);
    };
    reader.readAsText(file);
  };

  // Memory Game Logic
  const startMemoryGame = () => {
    const symbols = ['🧩', '📧', '💻', '⚡', '🔒', '🌐'];
    const deck = [...symbols, ...symbols].sort(() => Math.random() - 0.5).map((s, i) => ({ id: i, s }));
    setCards(deck);
    setMatched([]);
    setFlipped([]);
    setTimer(30);
    setGameWon(false);
    setGameActive(true);
  };

  useEffect(() => {
    let interval;
    if (gameActive && timer > 0 && matched.length < cards.length) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && matched.length < cards.length) {
      setGameActive(false);
    }
    return () => clearInterval(interval);
  }, [gameActive, timer, matched, cards.length]);

  useEffect(() => {
    if (matched.length > 0 && matched.length === cards.length) {
      setGameWon(true);
      setGameActive(false);
      celebrate();
    }
  }, [matched, cards]);

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first].s === cards[second].s) {
        setMatched(m => [...m, first, second]);
      }
      setTimeout(() => setFlipped([]), 800);
    }
  }, [flipped, cards]);

  return (
    <div className={`app-container ${isDark ? 'dark-mode' : 'light-mode'}`}>
      <div className="sidebar">
        <h2 className="logo">Slicer Pro</h2>
        <nav>
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</div>
          <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>📜 History</div>
          <div className={`nav-item ${activeTab === 'memory' ? 'active' : ''}`} onClick={() => {setActiveTab('memory'); startMemoryGame();}}>🧩 Domain Memory</div>
          <div className="nav-item mode-toggle" onClick={() => setIsDark(!isDark)}>{isDark ? '☀️ Light' : '🌙 Dark'}</div>
        </nav>
      </div>

      <div className="main-content">
        <div className="glass-panel">
          {activeTab === 'dashboard' && (
            <div className="view">
              <h1>Email Slicer</h1>
              <div className="input-group">
                <input className="main-input" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Enter email..." />
                <button className="slice-btn" onClick={handleSlice}>SLICE</button>
              </div>
              <div className="file-section">
                <input type="file" id="bulk" accept=".txt" onChange={handleFileUpload} hidden />
                <label htmlFor="bulk" className="file-btn">Choose File</label>
                <span className="file-name">{fileName}</span>
              </div>
              
              <div className="scrollable-results">
                {bulkResults.length > 0 && bulkResults.map((res, i) => (
                  <div key={i} className="result-box bulk-item">
                    <p><strong>{res.user}</strong> @ {res.dom} | <span className={`badge ${res.type.toLowerCase()}`}>{res.type}</span></p>
                  </div>
                ))}
                {lastResult && (
                  <div className="result-box">
                    <p><strong>Username:</strong> {lastResult.user}</p>
                    <p><strong>Domain:</strong> {lastResult.dom}</p>
                    <p><strong>Category:</strong> <span className={`badge ${lastResult.type.toLowerCase()}`}>{lastResult.type}</span></p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="view">
              <h1>Extraction History</h1>
              <div className="action-bar">
                <button className="export-btn" onClick={downloadCSV}>📥 Download CSV</button>
                <button className="clear-btn" onClick={() => setHistory([])}>🗑️ Clear All</button>
              </div>
              <div className="table-container">
                <table className="history-table">
                  <thead>
                    <tr><th>User</th><th>Domain</th><th>Category</th></tr>
                  </thead>
                  <tbody>
                    {history.map((h, i) => (<tr key={i}><td>{h.user}</td><td>{h.dom}</td><td>{h.type}</td></tr>))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'memory' && (
            <div className="view">
              <h1>Domain Memory</h1>
              {gameWon ? (
                <div className="congrats-screen">
                  <h2 className="bounce-text">🎊 CONGRATULATIONS! 🎊</h2>
                  <p>You matched all domains!</p>
                  <button className="restart-btn animated" onClick={startMemoryGame}>PLAY AGAIN</button>
                </div>
              ) : (
                <>
                  <div className="timer-display">⏳ {timer}s</div>
                  <div className="memory-grid">
                    {cards.map((card, i) => (
                      <div key={i} className={`card ${(flipped.includes(i) || matched.includes(i)) ? 'flipped' : ''}`} onClick={() => gameActive && flipped.length < 2 && !flipped.includes(i) && setFlipped([...flipped, i])}>
                        <div className="card-face back">?</div>
                        <div className="card-face front">{card.s}</div>
                      </div>
                    ))}
                  </div>
                  <button className="restart-btn" onClick={startMemoryGame}>RESTART GAME</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;