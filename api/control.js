// /api/control.js
const https = require('https');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { ip, command } = req.body;
        
        if (!ip || !command) {
            return res.status(400).json({ error: 'IP and command are required' });
        }

        // Forward the command to ESP32
        const response = await new Promise((resolve, reject) => {
            const req = https.request(`http://${ip}/control?cmd=${command}`, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(data));
            });
            
            req.on('error', reject);
            req.end();
        });

        res.status(200).json({ status: 'success', response });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};