document.addEventListener('DOMContentLoaded', () => {
    const connectBtn = document.getElementById('connectBtn');
    const esp32Ip = document.getElementById('esp32Ip');
    const controls = document.getElementById('controls');
    const deviceStatus = document.getElementById('deviceStatus');
    const controlButtons = document.querySelectorAll('.control-btn');

    let isConnected = false;

    // Handle connection to ESP32
    connectBtn.addEventListener('click', async () => {
        const ip = esp32Ip.value.trim();
        
        if (!ip) {
            alert('Please enter a valid IP address or domain');
            return;
        }

        try {
            // Test connection
            const response = await fetch(`https://${ip}/status`, {
                method: 'GET',
                timeout: 5000 // 5 seconds timeout
            });
            
            if (response.ok) {
                isConnected = true;
                controls.style.display = 'block';
                deviceStatus.textContent = 'Connected';
                deviceStatus.classList.add('connected');
                connectBtn.textContent = 'Connected';
                connectBtn.disabled = true;
                esp32Ip.disabled = true;
                
                // Update status from ESP32
                updateDeviceStatus(ip);
            } else {
                throw new Error('Connection failed');
            }
        } catch (error) {
            alert(`Failed to connect to ${ip}. Please check the IP/domain and ensure the ESP32 is online.`);
            console.error('Connection error:', error);
        }
    });

    // Handle control button clicks
    controlButtons.forEach(button => {
        button.addEventListener('click', async () => {
            if (!isConnected) return;
            
            const command = button.dataset.command;
            const ip = esp32Ip.value.trim();
            
            try {
                const response = await fetch(`https://${ip}/control`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `command=${command}`,
                    timeout: 3000
                });
                
                if (!response.ok) throw new Error('Command failed');
                
                // Update status after command
                updateDeviceStatus(ip);
            } catch (error) {
                console.error('Command error:', error);
                alert('Failed to send command. Check connection.');
            }
        });
    });

    // Function to update device status
    async function updateDeviceStatus(ip) {
        try {
            const response = await fetch(`https://${ip}/status`, {
                method: 'GET',
                timeout: 3000
            });
            
            if (response.ok) {
                const data = await response.text();
                deviceStatus.textContent = data === 'on' ? 'ON' : 'OFF';
                deviceStatus.style.color = data === 'on' ? '#2ecc71' : '#e74c3c';
            }
        } catch (error) {
            console.error('Status update error:', error);
        }
    }
});
