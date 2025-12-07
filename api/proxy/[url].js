// This is a serverless function that acts as a proxy
// It runs on Vercel's edge network

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the target URL from the query parameters
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  try {
    // Forward the request to the target URL
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
        'Cache-Control': 'no-cache'
      }
    });

    // Get the response text
    const data = await response.text();
    
    // Forward the response
    res.status(response.status).send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch from target URL' });
  }
}

export const config = {
  // This makes the function run on the edge network
  runtime: 'edge',
  // This allows the function to be called from any origin
  // In production, you should restrict this to your domain
  cors: {
    origin: '*',
    methods: ['GET']
  }
};
