// ─── Load env FIRST before anything else ────────────────────────────────────
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

const pool = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// ─── Verify DB on startup ────────────────────────────────────────────────────
pool.query('SELECT NOW()')
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch(err => {
    console.error('❌ PostgreSQL connection failed:', err.message);
    console.error('   Check your .env DB_* values and that PostgreSQL is running.');
    process.exit(1);
  });

// ─── App ─────────────────────────────────────────────────────────────────────
const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Request logger (dev only) ────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT NOW() AS time');
    res.json({
      success:   true,
      message:   'Camcol API is running 🚀',
      db_time:   rows[0].time,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'DB unreachable', error: err.message });
  }
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/gigs',     require('./routes/gigs'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/reviews',  require('./routes/reviews'));
app.use('/api/messages', require('./routes/messages'));

// ─── 404 + Error handlers ─────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '5000');
app.listen(PORT, () => {
  console.log(`\n🚀  Camcol API  →  http://localhost:${PORT}`);
  console.log(`📦  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\nEndpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/gigs`);
  console.log(`   GET  /api/projects`);
  console.log(`   GET  /api/users\n`);
});

module.exports = app;