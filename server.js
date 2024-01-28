const express = require('express');
const https = require('https');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const currentFolder = process.cwd();
const keypath = path.join(currentFolder, "key.pem");
const certpath = path.join(currentFolder, "cert.pem");
const options = {
    key: fs.readFileSync(keypath),
    cert: fs.readFileSync(certpath),
    passphrase: '1234'
  };

  const server = https.createServer(options, app);
const io = new socketIO.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
    // Add the following line to explicitly enable WSS
    allowEIO3: true,
    transports: ['websocket'],
});

const port = 3000;

app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

// Serve your static files (HTML, JS, CSS)
app.use(express.static('public'));

// Serve index.html
app.get('/driver', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index2.html'));
});

// Serve second.html
app.get('/user', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

// Handling HTTP POST request for location updates
app.post('/location', (req, res) => {
    const { lat, lon } = req.body;
    console.log('Received location:', lat, lon);

    // Broadcast the location to all connected clients
    io.emit('locationUpdate', { lat, lon });

    res.json({ success: true, message: 'Location received successfully' });
});

// Handling WebSocket connections
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(port, () => {
    console.log(`Server is running on https://localhost:${port}`);
});
