const http = require('http');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { ip } = req.body;
        
        if (!ip) {
            return res.status(400).json({ error: 'IP is required' });
        }

        // Test connection to ESP32
        const isReachable = await testEsp32Connection(ip);
        
        if (!isReachable) {
            return res.status(400).json({ error: 'Could not connect to ESP32. Check the IP and try again.' });
        }

        // If we get here, the ESP32 is reachable
        res.status(200).json({ 
            status: 'connected',
            message: 'Successfully connected to ESP32'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

function testEsp32Connection(ip) {
    return new Promise((resolve) => {
        const options = {
            hostname: ip,
            port: 80,
            path: '/test',
            method: 'GET',
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve(response.status === 'ok');
                } catch (e) {
                    console.error('Error parsing response:', e);
                    resolve(false);
                }
            });
        });

        req.on('error', (err) => {
            console.error('Connection error:', err);
            resolve(false);
        });

        req.on('timeout', () => {
            console.error('Connection timeout');
            req.destroy();
            resolve(false);
        });

        req.end();
    });
}