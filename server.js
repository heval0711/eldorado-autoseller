const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(express.json());

// Health Check
app.get('/', (req, res) => {
    res.json({
        status: 'running',
        service: 'Eldorado API Proxy',
        version: '1.0.0'
    });
});

// Price Fetching
app.get('/api/prices', async (req, res) => {
    try {
        const queryParams = new URLSearchParams(req.query).toString();
        const url = `https://eldorado.gg/api/flexibleOffers?${queryParams}`;
        
        console.log('Fetching prices from:', url);
        
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Eldorado-AutoSeller/1.0'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Eldorado API returned ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Price fetch error:', error);
        res.status(500).json({
            error: error.message,
            details: 'Failed to fetch prices from Eldorado'
        });
    }
});

// Create Offer
app.post('/api/create-offer', async (req, res) => {
    try {
        const { token, offerData } = req.body;
        
        if (!token) {
            return res.status(401).json({ error: 'No authentication token provided' });
        }
        
        console.log('Creating offer:', offerData.itemName);
        
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://eldorado.gg/api/offers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Cookie': `__Host-EldoradoIdToken=${token}`,
                'User-Agent': 'Eldorado-AutoSeller/1.0'
            },
            body: JSON.stringify(offerData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}`);
        }
        
        res.json({
            success: true,
            data: data
        });
        
    } catch (error) {
        console.error('Create offer error:', error);
        res.status(500).json({
            error: error.message,
            details: 'Failed to create offer on Eldorado'
        });
    }
});

app.listen(PORT, () => {
    console.log('🚀 Eldorado API Proxy running on port', PORT);
});

module.exports = app;
