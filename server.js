const express = require('express');
const cors = require('cors');
const path = require('path');

// For Node.js 18+, fetch is available globally
// For older versions, you might need to install and import node-fetch

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Proxy endpoint for Arma API
app.get('/api/arma/stats', async (req, res) => {
  try {
    const response = await fetch('https://api.arma.xyz/api/v1/8453/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Almanak-App/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching Arma API data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Arma API data',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'build')));

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Arma API proxy available at: http://localhost:${PORT}/api/arma/stats`);
  console.log(`🏥 Health check available at: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
