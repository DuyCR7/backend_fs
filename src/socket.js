// socketServer.js
import { Server } from 'socket.io';

const initSocketServer = (server) => {
    const io = new Server(server, {
        cors: "http://localhost:3000",  // CORS cho frontend
    });

    io.on('connection', (socket) => {
        console.log(`New client connected: ${socket.id}`);

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });

        socket.on('sendMessage', (message) => {
            console.log('Message received:', message);
            socket.broadcast.emit('receiveMessage', message);
        });
    });

    return io;
};

export default initSocketServer;