// /api/register.js
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { ip } = req.body;
        
        if (!ip) {
            return res.status(400).json({ error: 'IP is required' });
        }

        // Here you could add validation or store the IP in a database
        // For now, we'll just return success
        res.status(200).json({ status: 'connected' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};