require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const storyRoutes = require('./routes/storyRoutes');
const doubtRoutes = require('./routes/doubtRoutes');

connectDB();

const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/doubts', doubtRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', message: 'PlaceConnect API running' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
