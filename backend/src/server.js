require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./services/db');
const researchRouter = require('./routes/research');

// Context.dev is the only external API required for research.

const app = express();
const PORT = process.env.PORT || 5000;

// 2. Production-safe CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:5173']; // Common frontend development ports

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or REST client (like Postman) requests if no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy'));
  },
  credentials: true
}));

app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/research', researchRouter);

// History routes
app.get('/api/history', async (req, res) => {
  try {
    const history = await db.getHistory();
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/history/:id/save', async (req, res) => {
  const { id } = req.params;
  const { saved } = req.body;
  try {
    await db.toggleSave(id, saved);
    res.json({ success: true, saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/history/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteHistoryItem(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Collections routes
app.get('/api/collections', async (req, res) => {
  try {
    const collections = await db.getCollections();
    res.json(collections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/collections', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Collection name is required' });
  }
  try {
    const list = await db.createCollection(name);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/history/:id/collection', async (req, res) => {
  const { id } = req.params;
  const { collectionName } = req.body;
  if (!collectionName) {
    return res.status(400).json({ error: 'Collection name is required' });
  }
  try {
    await db.addToCollection(id, collectionName);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Settings validation
app.get('/api/settings/status', (req, res) => {
  res.json({
    contextConfigured: !!process.env.CONTEXT_DEV_API_KEY,
    requiredApi: 'context.dev'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong on the backend!' });
});

// 3. Optional: Wrap initialization in DB connection verification if supported
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`🚀 ResearchX AI Backend listening on port ${PORT}`);
  });
};

// If your db client exposes a connection check, use it here; otherwise just call startServer()
if (typeof db.connect === 'function') {
  db.connect().then(startServer).catch(err => {
    console.error('Database connection failed. Server shutting down.', err);
    process.exit(1);
  });
} else {
  startServer();
}

module.exports = app; // Helpful for testing frameworks down the road
