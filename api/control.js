const http = require('http');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { ip, command } = req.body;
        
        if (!ip || !command) {
            return res.status(400).json({ error: 'IP and command are required' });
        }

        // Verify the ESP32 is still reachable
        const isReachable = await testEsp32Connection(ip);
        if (!isReachable) {
            return res.status(400).json({ error: 'ESP32 is not reachable' });
        }

        // Forward the command to ESP32
        const response = await sendCommandToEsp32(ip, command);
        res.status(200).json({ status: 'success', response });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to send command to ESP32' });
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

function sendCommandToEsp32(ip, command) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: ip,
            port: 80,
            path: `/control?cmd=${encodeURIComponent(command)}`,
            method: 'GET',
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}