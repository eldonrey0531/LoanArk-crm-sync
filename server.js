const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import the TypeScript handler (we'll compile it or use ts-node)
let hubspotSyncHandler;

// Try to import the compiled JavaScript version first, then fall back to TypeScript
try {
  hubspotSyncHandler = require('./dist/server/api/hubspot-sync.js').hubspotSyncHandler;
} catch (error) {
  // If compiled version doesn't exist, use ts-node to run TypeScript directly
  try {
    require('ts-node/register');
    hubspotSyncHandler = require('./src/server/api/hubspot-sync.ts').hubspotSyncHandler;
  } catch (tsError) {
    console.error('Could not load hubspot-sync handler:', tsError);
    process.exit(1);
  }
}

// Routes
app.post('/api/hubspot-sync', hubspotSyncHandler);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`HubSpot sync endpoint: http://localhost:${PORT}/api/hubspot-sync`);
});