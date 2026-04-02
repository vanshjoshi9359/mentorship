require('dotenv').config();
const express = require('express');
const cors = require('cors');


const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const topicRoutes = require('./routes/topicRoutes');
const questionRoutes = require('./routes/questionRoutes');
const answerRoutes = require('./routes/answerRoutes');
const voteRoutes = require('./routes/voteRoutes');
const searchRoutes = require('./routes/searchRoutes');
const groupRoutes = require('./routes/groupRoutes');
const taskRoutes = require('./routes/taskRoutes');
const messageRoutes = require('./routes/messageRoutes');
const storyRoutes = require('./routes/storyRoutes');

// Connect to database
connectDB();

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://college-connect-frontend-lp2n.onrender.com',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // In production, log the blocked origin to help debug
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/stories', storyRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'College Connect API is running' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
