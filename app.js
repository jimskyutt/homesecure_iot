let isConnected = false;
let esp32Ip = '';

document.getElementById('connectBtn').addEventListener('click', () => {
    esp32Ip = document.getElementById('esp32Ip').value.trim();
    if (!esp32Ip) {
        alert('Please enter a valid IP address');
        return;
    }
    
    // Test connection
    fetch(`http://${esp32Ip}/test`)
        .then(response => response.text())
        .then(data => {
            if (data === 'OK') {
                isConnected = true;
                document.getElementById('status').textContent = 'Status: Connected';
                document.getElementById('onBtn').disabled = false;
                document.getElementById('offBtn').disabled = false;
            }
        })
        .catch(err => {
            console.error('Connection error:', err);
            alert('Failed to connect to ESP32. Check the IP and try again.');
        });
});

function sendCommand(command) {
    if (!isConnected) {
        alert('Not connected to ESP32');
        return;
    }
    
    fetch(`http://${esp32Ip}/control?cmd=${command}`)
        .then(response => response.text())
        .then(data => {
            console.log('Command response:', data);
        })
        .catch(err => {
            console.error('Error sending command:', err);
            alert('Failed to send command');
        });
}

document.getElementById('onBtn').addEventListener('click', () => sendCommand('ON'));
document.getElementById('offBtn').addEventListener('click', () => sendCommand('OFF'));

// Disable buttons until connected
document.getElementById('onBtn').disabled = true;
document.getElementById('offBtn').disabled = true;