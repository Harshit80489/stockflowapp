// IMPORTANT: dotenv must be loaded first
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'StockFlow API is running' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/stock', require('./routes/stock'));
app.use('/api/dashboard', require('./routes/dashboard'));

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  let message = err.message || 'Server Error';
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field} already exists`;
  }
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }
  res.status(status).json({ success: false, message });
});

// Connect to MongoDB then start server
const MONGO_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;

if (!MONGO_URI) {
  console.error('ERROR: MONGODB_URI is not defined in .env file');
  console.error('Make sure .env file exists in the backend folder');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
