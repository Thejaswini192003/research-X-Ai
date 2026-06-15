const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

let pool = null;
const usePostgres = !!process.env.DATABASE_URL;

const dbFolder = path.join(__dirname, '..', '..', 'data');
const jsonDbPath = path.join(dbFolder, 'database.json');

// Ensure data folder exists for local JSON DB
if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder, { recursive: true });
}

// Default state of JSON DB
const defaultDbState = {
  history: [],
  saved: [],
  collections: ['Technology', 'Business', 'Science', 'Politics', 'Finance', 'Sports'],
  settings: {}
};

// Initialize JSON database if it doesn't exist
if (!fs.existsSync(jsonDbPath)) {
  fs.writeFileSync(jsonDbPath, JSON.stringify(defaultDbState, null, 2));
}

// Helper to read JSON DB
function readJsonDb() {
  try {
    const data = fs.readFileSync(jsonDbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading JSON database, resetting to default:', err);
    return defaultDbState;
  }
}

// Helper to write JSON DB
function writeJsonDb(data) {
  try {
    fs.writeFileSync(jsonDbPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing JSON database:', err);
  }
}

// Initialize Postgres if configured
if (usePostgres) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
    });
    console.log('PostgreSQL database pool initialized.');
    
    // Initialize Postgres tables in background
    pool.query(`
      CREATE TABLE IF NOT EXISTS research_history (
        id VARCHAR(50) PRIMARY KEY,
        query TEXT NOT NULL,
        mode VARCHAR(20) DEFAULT 'deep',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        confidence NUMERIC(4,2),
        summary TEXT,
        report TEXT,
        sources JSONB,
        timeline JSONB,
        key_insights JSONB,
        statistics JSONB,
        charts JSONB,
        saved BOOLEAN DEFAULT FALSE,
        collections TEXT[] DEFAULT '{}'
      );
    `).catch(err => console.error('Failed to create Postgres tables:', err));
  } catch (err) {
    console.error('Failed to connect to PostgreSQL, falling back to local JSON mode.', err);
  }
} else {
  console.log('PostgreSQL URL not found. Using zero-config local JSON database.');
}

const db = {
  // Get all history
  async getHistory() {
    if (usePostgres && pool) {
      try {
        const { rows } = await pool.query('SELECT * FROM research_history ORDER BY timestamp DESC');
        return rows.map(row => ({
          ...row,
          sources: typeof row.sources === 'string' ? JSON.parse(row.sources) : row.sources,
          timeline: typeof row.timeline === 'string' ? JSON.parse(row.timeline) : row.timeline,
          key_insights: typeof row.key_insights === 'string' ? JSON.parse(row.key_insights) : row.key_insights,
          statistics: typeof row.statistics === 'string' ? JSON.parse(row.statistics) : row.statistics,
          charts: typeof row.charts === 'string' ? JSON.parse(row.charts) : row.charts
        }));
      } catch (err) {
        console.error('Postgres query error, falling back to JSON:', err);
      }
    }
    const data = readJsonDb();
    return [...data.history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  // Save history item
  async saveHistoryItem(item) {
    const formattedItem = {
      id: item.id || Math.random().toString(36).substring(2, 11),
      query: item.query,
      mode: item.mode || 'deep',
      timestamp: item.timestamp || new Date().toISOString(),
      confidence: item.confidence || 0,
      summary: item.summary || '',
      report: item.report || '',
      sources: item.sources || [],
      timeline: item.timeline || [],
      key_insights: item.key_insights || [],
      statistics: item.statistics || [],
      charts: item.charts || [],
      saved: item.saved || false,
      collections: item.collections || []
    };

    if (usePostgres && pool) {
      try {
        await pool.query(
          `INSERT INTO research_history 
           (id, query, mode, timestamp, confidence, summary, report, sources, timeline, key_insights, statistics, charts, saved, collections) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           ON CONFLICT (id) DO UPDATE SET 
           query = EXCLUDED.query, mode = EXCLUDED.mode, timestamp = EXCLUDED.timestamp, 
           confidence = EXCLUDED.confidence, summary = EXCLUDED.summary, report = EXCLUDED.report, 
           sources = EXCLUDED.sources, timeline = EXCLUDED.timeline, key_insights = EXCLUDED.key_insights, 
           statistics = EXCLUDED.statistics, charts = EXCLUDED.charts, saved = EXCLUDED.saved, collections = EXCLUDED.collections`,
          [
            formattedItem.id,
            formattedItem.query,
            formattedItem.mode,
            formattedItem.timestamp,
            formattedItem.confidence,
            formattedItem.summary,
            formattedItem.report,
            JSON.stringify(formattedItem.sources),
            JSON.stringify(formattedItem.timeline),
            JSON.stringify(formattedItem.key_insights),
            JSON.stringify(formattedItem.statistics),
            JSON.stringify(formattedItem.charts),
            formattedItem.saved,
            formattedItem.collections
          ]
        );
        return formattedItem;
      } catch (err) {
        console.error('Postgres insert error, falling back to JSON:', err);
      }
    }

    const data = readJsonDb();
    const existingIndex = data.history.findIndex(h => h.id === formattedItem.id);
    if (existingIndex > -1) {
      data.history[existingIndex] = formattedItem;
    } else {
      data.history.push(formattedItem);
    }
    writeJsonDb(data);
    return formattedItem;
  },

  // Delete history item
  async deleteHistoryItem(id) {
    if (usePostgres && pool) {
      try {
        await pool.query('DELETE FROM research_history WHERE id = $1', [id]);
        return true;
      } catch (err) {
        console.error('Postgres delete error, falling back to JSON:', err);
      }
    }
    const data = readJsonDb();
    data.history = data.history.filter(h => h.id !== id);
    writeJsonDb(data);
    return true;
  },

  // Toggle saved status
  async toggleSave(id, saved) {
    if (usePostgres && pool) {
      try {
        await pool.query('UPDATE research_history SET saved = $1 WHERE id = $2', [saved, id]);
        return true;
      } catch (err) {
        console.error('Postgres toggleSave error, falling back to JSON:', err);
      }
    }
    const data = readJsonDb();
    const item = data.history.find(h => h.id === id);
    if (item) {
      item.saved = saved;
      writeJsonDb(data);
    }
    return true;
  },

  // Get collections list
  async getCollections() {
    const data = readJsonDb();
    return data.collections || [];
  },

  // Create collection
  async createCollection(name) {
    const data = readJsonDb();
    if (!data.collections.includes(name)) {
      data.collections.push(name);
      writeJsonDb(data);
    }
    return data.collections;
  },

  // Add search to collection
  async addToCollection(id, collectionName) {
    if (usePostgres && pool) {
      try {
        await pool.query('UPDATE research_history SET collections = array_append(collections, $1) WHERE id = $2 AND NOT ($1 = ANY(collections))', [collectionName, id]);
        return true;
      } catch (err) {
        console.error('Postgres addToCollection error, falling back to JSON:', err);
      }
    }
    const data = readJsonDb();
    const item = data.history.find(h => h.id === id);
    if (item) {
      if (!item.collections) item.collections = [];
      if (!item.collections.includes(collectionName)) {
        item.collections.push(collectionName);
        writeJsonDb(data);
      }
    }
    return true;
  }
};

module.exports = db;
