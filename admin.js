const socket = io(); // Connect to the server

// Initialize the map
const map = L.map('map').setView([12.8797, 121.7740], 6); // Centered on the Philippines
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Marker for the user
let userMarker = null;

// Marker for the admin
let adminMarker = null;

// Routing control instance
let routingControl = null;

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
    map.setView([lat, lng], 13); // Center the map on the admin's location
}

// Get the admin's location and send it to the server
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            updateAdminMarker(latitude, longitude);
            socket.emit('adminLocation', { lat: latitude, lng: longitude }); // Send admin's location to the server
        },
        (error) => {
            console.error('Error getting location:', error);
        },
        { enableHighAccuracy: true }
    );
} else {
    alert('Geolocation is not supported by your browser.');
}

// Listen for location updates from the user
socket.on('updateUserLocation', (location) => {
    if (location) {
        const { lat, lng } = location;
        updateUserMarker(lat, lng); // Update the user's marker on the map
    }
});

// Add "On the Way!" button functionality
const onTheWayButton = document.createElement('button');
onTheWayButton.textContent = 'On the Way!';
onTheWayButton.style.position = 'fixed';
onTheWayButton.style.bottom = '20px';
onTheWayButton.style.right = '20px';
onTheWayButton.style.padding = '10px 20px';
onTheWayButton.style.backgroundColor = '#007bff';
onTheWayButton.style.color = 'white';
onTheWayButton.style.border = 'none';
onTheWayButton.style.borderRadius = '5px';
onTheWayButton.style.cursor = 'pointer';
onTheWayButton.style.zIndex = '1000';
document.body.appendChild(onTheWayButton);

onTheWayButton.addEventListener('click', () => {
    socket.emit('adminOnTheWay'); // Emit an event to notify the user
});

// Add "Direction" button functionality
const directionButton = document.createElement('button');
directionButton.textContent = 'Direction';
directionButton.style.position = 'fixed';
directionButton.style.bottom = '60px';
directionButton.style.right = '20px';
directionButton.style.padding = '10px 20px';
directionButton.style.backgroundColor = '#28a745';
directionButton.style.color = 'white';
directionButton.style.border = 'none';
directionButton.style.borderRadius = '5px';
directionButton.style.cursor = 'pointer';
directionButton.style.zIndex = '1000';
document.body.appendChild(directionButton);

directionButton.addEventListener('click', () => {
    if (adminMarker && userMarker) {
        const adminLatLng = adminMarker.getLatLng();
        const userLatLng = userMarker.getLatLng();

        // Remove existing routing control if it exists
        if (routingControl) {
            map.removeControl(routingControl);
        }

        // Add a new routing control with a minimize button
        routingControl = L.Routing.control({
            waypoints: [adminLatLng, userLatLng],
            routeWhileDragging: true,
            show: true,
            createMarker: () => null, // Prevent additional markers
        }).addTo(map);

        // Add a minimize button to the directions panel
        const directionsContainer = document.querySelector('.leaflet-routing-container');
        const minimizeButton = document.createElement('button');
        minimizeButton.textContent = 'Minimize';
        minimizeButton.style.position = 'absolute';
        minimizeButton.style.top = '10px';
        minimizeButton.style.right = '10px';
        minimizeButton.style.padding = '5px 10px';
        minimizeButton.style.backgroundColor = '#dc3545';
        minimizeButton.style.color = 'white';
        minimizeButton.style.border = 'none';
        minimizeButton.style.borderRadius = '5px';
        minimizeButton.style.cursor = 'pointer';
        minimizeButton.style.zIndex = '1000';
        directionsContainer.appendChild(minimizeButton);

        minimizeButton.addEventListener('click', () => {
            directionsContainer.style.display = 'none'; // Hide the directions panel
        });
    } else {
        alert('Both admin and user locations must be available to calculate the route.');
    }
});