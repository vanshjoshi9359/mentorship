require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

console.log('=== SERVER STARTING ===');
console.log('__dirname:', __dirname);
console.log('Node version:', process.version);

const authRoutes = require('./routes/authRoutes');

let storyRoutes, doubtRoutes;
try {
  storyRoutes = require('./routes/storyRoutes');
  doubtRoutes = require('./routes/doubtRoutes');
  console.log('Routes loaded successfully');
} catch (e) {
  console.error('Route loading error:', e.message);
}

connectDB();

const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
if (storyRoutes) app.use('/api/stories', storyRoutes);
if (doubtRoutes) app.use('/api/doubts', doubtRoutes);

app.get('/', (req, res) => res.json({ message: 'PlaceConnect API', version: '2.0', routes: ['/health', '/api/auth', '/api/stories', '/api/doubts'] }));
app.get('/health', (req, res) => res.json({ status: 'ok', message: 'PlaceConnect API v2 running', routes: ['/api/auth', '/api/stories', '/api/doubts'] }));
app.get('/test', (req, res) => res.json({ test: 'ok', timestamp: new Date().toISOString() }));
app.get('/env-check', (req, res) => res.json({ 
  hasGroq: !!process.env.GROQ_API_KEY,
  groqKeyStart: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 10) + '...' : 'NOT SET'
}));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
