const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
// require('./auto-shutdown'); // Auto-shutdown after 2 hours - DISABLED

const authRoutes = require('./routes/auth');
const umbrellaRoutes = require('./routes/umbrellas');
const walletRoutes = require('./routes/wallet');
const rentalRoutes = require('./routes/rentals');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Make io available globally
global.io = io;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://palisettysanjaykumar_db_user:StPcfumQIOvDAEtS@urs.h9jrkne.mongodb.net/demo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/umbrellas', umbrellaRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/rentals', rentalRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});