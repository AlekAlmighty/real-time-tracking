const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// Serve static files
app.use(express.static(__dirname));

// Store locations for admin and user
let adminLocation = null;
let userLocation = null;

// Handle socket connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle location updates from the admin
    socket.on('adminLocation', (location) => {
        adminLocation = location; // Update the admin's location
        io.emit('updateAdminLocation', adminLocation); // Broadcast the admin's location to all clients
    });

    // Handle location updates from the user
    socket.on('sendLocation', (location) => {
        userLocation = location; // Update the user's location
        io.emit('updateUserLocation', userLocation); // Broadcast the user's location to all clients
    });

    // Handle "On the Way!" event from the admin
    socket.on('adminOnTheWay', () => {
        io.emit('adminOnTheWay'); // Broadcast the "Admin is on the way" message to all users
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});