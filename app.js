let isConnected = false;
let socket = null;
const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';

document.getElementById('connectBtn').addEventListener('click', () => {
    const esp32Ip = document.getElementById('esp32Ip').value.trim();
    if (!esp32Ip) {
        alert('Please enter a valid IP address');
        return;
    }

    // Close existing connection if any
    if (socket) {
        socket.close();
    }

    // Connect to WebSocket server on ESP32
    socket = new WebSocket(`${wsProtocol}${esp32Ip}/ws`);

    socket.onopen = () => {
        console.log('WebSocket connected');
        isConnected = true;
        document.getElementById('status').textContent = 'Status: Connected';
        document.getElementById('onBtn').disabled = false;
        document.getElementById('offBtn').disabled = false;
    };

    socket.onmessage = (event) => {
        console.log('Message from server:', event.data);
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        alert('Failed to connect to ESP32. Check the IP and try again.');
    };

    socket.onclose = () => {
        console.log('WebSocket disconnected');
        isConnected = false;
        document.getElementById('status').textContent = 'Status: Disconnected';
        document.getElementById('onBtn').disabled = true;
        document.getElementById('offBtn').disabled = true;
    };
});

function sendCommand(command) {
    if (!isConnected || !socket) {
        alert('Not connected to ESP32');
        return;
    }
    
    try {
        socket.send(JSON.stringify({ command }));
    } catch (err) {
        console.error('Error sending command:', err);
        alert('Failed to send command');
    }
}

document.getElementById('onBtn').addEventListener('click', () => sendCommand('ON'));
document.getElementById('offBtn').addEventListener('click', () => sendCommand('OFF'));

// Disable buttons until connected
document.getElementById('onBtn').disabled = true;
document.getElementById('offBtn').disabled = true;