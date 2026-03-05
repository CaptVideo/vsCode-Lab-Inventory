const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const db = require('./database/db');
const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const locationRoutes = require('./routes/locations');
const reportsRoutes = require('./routes/reports');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize database
db.initialize();

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/inventory', authMiddleware, inventoryRoutes);
app.use('/api/locations', authMiddleware, locationRoutes);
app.use('/api/reports', authMiddleware, reportsRoutes);

// Serve index.html for all unmatched routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Lab Inventory Management System running on port ${PORT}`);
});
