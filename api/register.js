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
            path: '/',
            method: 'HEAD',
            timeout: 3000 // 3 second timeout
        };

        const req = http.request(options, (res) => {
            // If we get any response, the device is reachable
            resolve(res.statusCode < 400);
        });

        req.on('error', () => {
            resolve(false);
        });

        req.on('timeout', () => {
            req.destroy(); // Kill the request
            resolve(false);
        });

        req.end();
    });
}