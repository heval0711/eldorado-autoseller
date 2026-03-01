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
        console.log('📥 Incoming request params:', req.query);
        
        // Clean up msRange - remove spaces
        const cleanedQuery = { ...req.query };
        if (cleanedQuery.msRange) {
            cleanedQuery.msRange = cleanedQuery.msRange.replace(/\s+/g, '');
            console.log('🧹 Cleaned msRange:', cleanedQuery.msRange);
        }
        
        const queryParams = new URLSearchParams(cleanedQuery).toString();
        const url = `https://eldorado.gg/api/flexibleOffers?${queryParams}`;
        
        console.log('🌐 Fetching from Eldorado:', url);
        
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        console.log('📊 Eldorado response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Eldorado error response:', errorText);
            throw new Error(`Eldorado API returned ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Eldorado returned', data.offers ? data.offers.length : 0, 'offers');
        
        res.json(data);
        
    } catch (error) {
        console.error('💥 Price fetch error:', error.message);
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
        
        console.log('📤 Creating offer:', offerData.itemName);
        
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://eldorado.gg/api/offers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Cookie': `__Host-EldoradoIdToken=${token}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify(offerData)
        });
        
        console.log('📊 Create offer response status:', response.status);
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error('❌ Create offer error:', data);
            throw new Error(data.message || `HTTP ${response.status}`);
        }
        
        console.log('✅ Offer created successfully');
        
        res.json({
            success: true,
            data: data
        });
        
    } catch (error) {
        console.error('💥 Create offer error:', error.message);
        res.status(500).json({
            error: error.message,
            details: 'Failed to create offer on Eldorado'
        });
    }
});

app.listen(PORT, () => {
    console.log('🚀 Eldorado API Proxy running on port', PORT);
    console.log('🌐 Ready to proxy requests to Eldorado.gg');
});

module.exports = app;
