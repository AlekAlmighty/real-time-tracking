const socket = io(); // Connect to the server

// Initialize the map
const map = L.map('map').setView([12.8797, 121.7740], 6); // Centered on the Philippines
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Markers for the user and admin
let userMarker = null;
let adminMarker = null;

// Function to update or create the user's marker
function updateUserMarker(lat, lng) {
    if (userMarker) {
        userMarker.setLatLng([lat, lng]);
    } else {
        userMarker = L.marker([lat, lng], { icon: L.icon({ iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' }) }).addTo(map);
    }
    map.setView([lat, lng], 13); // Center the map on the user's location
}

// Function to update or create the admin's marker
function updateAdminMarker(lat, lng) {
    if (adminMarker) {
        adminMarker.setLatLng([lat, lng]);
    } else {
        adminMarker = L.marker([lat, lng], { icon: L.icon({ iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' }) }).addTo(map);
    }
}

// Function to show a temporary notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '50%';
    notification.style.left = '50%';
    notification.style.transform = 'translate(-50%, -50%)';
    notification.style.backgroundColor = '#007bff';
    notification.style.color = 'white';
    notification.style.padding = '20px 40px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    notification.style.zIndex = '1000';
    document.body.appendChild(notification);

    // Remove the notification after 3 seconds
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
}

// Get the user's location and update the map
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            updateUserMarker(latitude, longitude);

            // Send location to the server when the button is clicked
            document.getElementById('send-location').addEventListener('click', () => {
                socket.emit('sendLocation', { lat: latitude, lng: longitude });
                showNotification('Location sent to admin!');
            });
        },
        (error) => {
            console.error('Error getting location:', error);
        },
        { enableHighAccuracy: true }
    );
} else {
    alert('Geolocation is not supported by your browser.');
}

// Listen for admin's location updates from the server
socket.on('updateAdminLocation', (location) => {
    if (location) {
        const { lat, lng } = location;
        updateAdminMarker(lat, lng); // Update the admin's marker on the map
    }
});

// Listen for "Admin is on the way" notification
socket.on('adminOnTheWay', () => {
    showNotification('Admin is on the way!');
});