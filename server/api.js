import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const app = express();
app.use(cors());
app.use(express.json());

// HubSpot proxy endpoint
app.post('/api/hubspot/contacts/latest', async (req, res) => {
  try {
    const response = await fetch(
      'https://api.hubapi.com/crm/v3/objects/contacts/search',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch HubSpot data' });
  }
});

app.get('/api/hubspot/test', async (req, res) => {
  try {
    const response = await fetch(
      'https://api.hubapi.com/crm/v3/objects/contacts?limit=1',
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        },
      }
    );
    const data = await response.json();
    res.json({ connected: response.ok, total: data.results?.length || 0 });
  } catch (error) {
    res.status(500).json({ connected: false });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
