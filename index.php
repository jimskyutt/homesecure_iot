<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ESP32 Remote Connection</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center p-4">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h1 class="text-2xl font-bold text-gray-800 mb-2 text-center">ESP32 Remote Connection</h1>
        <p class="text-center text-gray-600 mb-6">Connect to your ESP32 from anywhere in the world</p>
        
        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div class="flex">
                <div class="flex-shrink-0">
                    <i class="fas fa-info-circle text-blue-500 text-xl"></i>
                </div>
                <div class="ml-3">
                    <p class="text-sm text-blue-700">
                        For remote access, ensure your ESP32's network has:
                        <ul class="list-disc pl-5 mt-1 space-y-1">
                            <li>Port forwarding enabled (usually port 80)</li>
                            <li>Dynamic DNS set up (recommended for home networks)</li>
                            <li>Firewall exceptions for the ESP32's port</li>
                        </ul>
                    </p>
                </div>
            </div>
        </div>
        
        <form id="espForm" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="ipAddress" class="block text-sm font-medium text-gray-700 mb-1">ESP32 Address</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-network-wired text-gray-400"></i>
                        </div>
                        <input 
                            type="text" 
                            id="ipAddress" 
                            name="ipAddress" 
                            placeholder="e.g., 192.168.1.100 or your-domain.ddns.net" 
                            class="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                    </div>
                    <p class="mt-1 text-xs text-gray-500">
                        Enter IP or domain (e.g., 123.45.67.89 or myesp32.ddns.net)
                    </p>
                </div>
                <div>
                    <label for="port" class="block text-sm font-medium text-gray-700 mb-1">Port</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-plug text-gray-400"></i>
                        </div>
                        <input 
                            type="number" 
                            id="port" 
                            name="port" 
                            value="80"
                            min="1" 
                            max="65535"
                            class="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                    </div>
                    <p class="mt-1 text-xs text-gray-500">
                        Default: 80 (or your forwarded port)
                    </p>
                </div>
            </div>
            
            <div class="flex justify-between items-center pt-2">
                <button 
                    type="submit" 
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Connect
                </button>
                <button 
                    type="button" 
                    id="testConnection" 
                    class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                    Test Connection
                </button>
            </div>
        </form>

        <div id="status" class="mt-6 p-4 rounded-md hidden">
            <p class="text-center"></p>
        </div>
    </div>

    <script>
        document.getElementById('espForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const ipAddress = document.getElementById('ipAddress').value;
            await testConnection(ipAddress, 'Connecting to ESP32...');
        });

        document.getElementById('testConnection').addEventListener('click', async function() {
            const ipAddress = document.getElementById('ipAddress').value;
            if (!ipAddress) {
                showStatus('Please enter an IP address', 'error');
                return;
            }
            await testConnection(ipAddress, 'Testing connection to ESP32...');
        });

        async function testConnection(ip, message) {
            const statusDiv = document.getElementById('status');
            const statusText = statusDiv.querySelector('p');
            const port = document.getElementById('port').value || '80';
            const url = `http://${ip}${port !== '80' ? ':' + port : ''}`;
            
            try {
                // Show loading state
                statusDiv.className = 'mt-6 p-4 rounded-md bg-blue-100 border border-blue-300';
                statusText.textContent = message;
                statusDiv.classList.remove('hidden');
                
                // Show a more informative message
                showStatus(`Attempting to connect to ${url}...`, 'info');
                
                // Try to fetch from the ESP32 with timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
                
                const response = await fetch(url, {
                    method: 'GET',
                    mode: 'no-cors',
                    cache: 'no-cache',
                    signal: controller.signal,
                    headers: {
                        'Accept': 'text/plain',
                        'Cache-Control': 'no-cache'
                    }
                }).finally(() => clearTimeout(timeoutId));
                
                // If we get here, the request was made
                showStatus('Successfully connected to ESP32!', 'success');
                
            } catch (error) {
                console.error('Connection error:', error);
                if (error.name === 'AbortError') {
                    showStatus('Connection timed out. Check if the ESP32 is online and the port is forwarded correctly.', 'error');
                } else {
                    showStatus('Failed to connect to ESP32. Please check the following:<br>1. Correct IP/domain and port<br>2. Port forwarding is properly configured<br>3. Firewall allows the connection<br>4. ESP32 is powered on and connected to the internet', 'error');
                }
            }
        }

        function showStatus(message, type = 'info') {
            const statusDiv = document.getElementById('status');
            const statusText = statusDiv.querySelector('p');
            
            // Reset classes
            statusDiv.className = 'mt-6 p-4 rounded-md transition-colors duration-300';
            
            // Set appropriate styling based on message type
            const styles = {
                success: {
                    bg: 'bg-green-50',
                    border: 'border-green-300',
                    text: 'text-green-800',
                    icon: 'check-circle'
                },
                error: {
                    bg: 'bg-red-50',
                    border: 'border-red-300',
                    text: 'text-red-800',
                    icon: 'exclamation-circle'
                },
                info: {
                    bg: 'bg-blue-50',
                    border: 'border-blue-300',
                    text: 'text-blue-800',
                    icon: 'info-circle'
                }
            };
            
            const style = styles[type] || styles.info;
            
            statusDiv.className = `mt-6 p-4 rounded-md border ${style.bg} ${style.border} ${style.text} transition-all duration-300`;
            statusText.className = 'flex items-start';
            statusText.innerHTML = `
                <i class="fas fa-${style.icon} mt-1 mr-2 flex-shrink-0"></i>
                <span>${message}</span>
            `;
            statusDiv.classList.remove('hidden');
        }
    </script>
</body>
</html>
