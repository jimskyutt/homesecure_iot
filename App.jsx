import React, { useState } from 'react';

function App() {
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState('80');
  const [status, setStatus] = useState({ message: '', type: 'info' });
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async (e) => {
    if (e) e.preventDefault();
    
    if (!ipAddress) {
      showStatus('Please enter an IP address', 'error');
      return;
    }

    setIsLoading(true);
    const url = `http://${ipAddress}${port !== '80' ? ':' + port : ''}`;
    showStatus(`Attempting to connect to ${url}...`, 'info');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      // Create a proxy endpoint URL that will be handled by Vercel
      const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
      
      // Try with proxy first
      let response;
      try {
        response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'text/plain',
            'Cache-Control': 'no-cache',
            'X-Requested-With': 'XMLHttpRequest' // Required by some CORS proxies
          },
          signal: controller.signal
        });
      } catch (error) {
        console.log('Proxy request failed, trying direct connection...');
        // If proxy fails, try direct connection (will only work in development)
        response = await fetch(url, {
          method: 'GET',
          mode: 'no-cors',
          cache: 'no-cache',
          signal: controller.signal,
          headers: {
            'Accept': 'text/plain',
            'Cache-Control': 'no-cache'
          }
        });
      } finally {
        clearTimeout(timeoutId);
      }

      showStatus('Successfully connected to ESP32!', 'success');
    } catch (error) {
      console.error('Connection error:', error);
      if (error.name === 'AbortError') {
        showStatus('Connection timed out. Check if the ESP32 is online and the port is forwarded correctly.', 'error');
      } else if (error.message.includes('Failed to fetch')) {
        showStatus('Connection blocked by browser. Try these solutions: 1. Use HTTPS in ESP32 2. Set up a CORS proxy 3. Use a domain with valid SSL', 'error');
      } else {
        showStatus('Failed to connect to ESP32. Please check: 1. Correct IP/domain and port 2. Port forwarding 3. Firewall settings 4. ESP32 is online', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const showStatus = (message, type = 'info') => {
    setStatus({ message, type });
  };

  const getStatusClasses = () => {
    const base = 'mt-6 p-4 rounded-md border transition-all duration-300';
    const typeClasses = {
      success: 'bg-green-50 border-green-300 text-green-800',
      error: 'bg-red-50 border-red-300 text-red-800',
      info: 'bg-blue-50 border-blue-300 text-blue-800'
    };
    return `${base} ${typeClasses[status.type] || typeClasses.info}`;
  };

  const getStatusIcon = () => {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-circle',
      info: 'info-circle'
    };
    return `fas fa-${icons[status.type] || 'info-circle'}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">ESP32 Remote Connection</h1>
        <p className="text-center text-gray-600 mb-6">Connect to your ESP32 from anywhere in the world</p>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-info-circle text-blue-500 text-xl"></i>
            </div>
            <div className="ml-3">
              <div className="text-sm text-blue-700">
                <p className="mb-2">For remote access, ensure your ESP32's network has:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Port forwarding enabled (usually port 80)</li>
                  <li>Dynamic DNS set up (recommended for home networks)</li>
                  <li>Firewall exceptions for the ESP32's port</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={testConnection} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ipAddress" className="block text-sm font-medium text-gray-700 mb-1">
                ESP32 Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-network-wired text-gray-400"></i>
                </div>
                <input
                  type="text"
                  id="ipAddress"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder="e.g., 192.168.1.100 or your-domain.ddns.net"
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enter IP or domain (e.g., 123.45.67.89 or myesp32.ddns.net)
              </p>
            </div>
            
            <div>
              <label htmlFor="port" className="block text-sm font-medium text-gray-700 mb-1">
                Port
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-plug text-gray-400"></i>
                </div>
                <input
                  type="number"
                  id="port"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  min="1"
                  max="65535"
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Default: 80 (or your forwarded port)
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </button>
            <button
              type="button"
              onClick={testConnection}
              disabled={isLoading}
              className={`px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isLoading
                  ? 'bg-green-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              }`}
            >
              Test Connection
            </button>
          </div>
        </form>

        {status.message && (
          <div className={getStatusClasses()}>
            <p className="flex items-start">
              <i className={`${getStatusIcon()} mt-1 mr-2 flex-shrink-0`}></i>
              <span>{status.message}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
