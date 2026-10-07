require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api', require('./routes/auth'));
app.use('/api/grievances', require('./routes/grievance'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Student Grievance API is running...',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
