let isConnected = false;
const API_URL = 'https://homesecure-iot.vercel.app/api'; // Your Vercel app URL

document.getElementById('connectBtn').addEventListener('click', async () => {
    const esp32Ip = document.getElementById('esp32Ip').value.trim();
    if (!esp32Ip) {
        alert('Please enter a valid IP address');
        return;
    }

    // Show loading state
    const connectBtn = document.getElementById('connectBtn');
    const originalBtnText = connectBtn.textContent;
    connectBtn.disabled = true;
    connectBtn.textContent = 'Connecting...';

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ip: esp32Ip })
        });

        const data = await response.json();

        if (response.ok) {
            isConnected = true;
            document.getElementById('status').textContent = 'Status: Connected';
            document.getElementById('onBtn').disabled = false;
            document.getElementById('offBtn').disabled = false;
            localStorage.setItem('esp32Ip', esp32Ip);
        } else {
            throw new Error(data.error || 'Failed to connect to ESP32');
        }
    } catch (err) {
        console.error('Connection error:', err);
        alert(err.message || 'Failed to connect to ESP32. Check the IP and try again.');
        isConnected = false;
        document.getElementById('status').textContent = 'Status: Disconnected';
        document.getElementById('onBtn').disabled = true;
        document.getElementById('offBtn').disabled = true;
    } finally {
        // Reset button state
        connectBtn.disabled = false;
        connectBtn.textContent = originalBtnText;
    }
});

async function sendCommand(command) {
    if (!isConnected) {
        alert('Not connected to ESP32');
        return;
    }
    
    try {
        const esp32Ip = localStorage.getItem('esp32Ip');
        const response = await fetch(`${API_URL}/control`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ip: esp32Ip,
                command: command
            })
        });

        if (!response.ok) {
            throw new Error('Command failed');
        }

        const result = await response.json();
        console.log('Command response:', result);
    } catch (err) {
        console.error('Error sending command:', err);
        alert('Failed to send command');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('onBtn').addEventListener('click', () => sendCommand('ON'));
    document.getElementById('offBtn').addEventListener('click', () => sendCommand('OFF'));
    document.getElementById('onBtn').disabled = true;
    document.getElementById('offBtn').disabled = true;
    
    // Load saved IP if exists
    const savedIp = localStorage.getItem('esp32Ip');
    if (savedIp) {
        document.getElementById('esp32Ip').value = savedIp;
    }
});