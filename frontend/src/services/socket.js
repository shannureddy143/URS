import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export const subscribeToUpdates = (callback) => {
  socket.on('newUser', callback);
  socket.on('newTransaction', callback);
};

export const unsubscribeFromUpdates = () => {
  socket.off('newUser');
  socket.off('newTransaction');
};

export default socket;