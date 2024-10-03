// socketServer.js
import { Server } from 'socket.io';

const initSocketServer = (server) => {
    const io = new Server(server, {
        cors: "http://localhost:3000",  // CORS cho frontend
    });

    let onlineCustomers = [];

    io.on('connection', (socket) => {
        console.log(`New client connected: ${socket.id}`);

        socket.on("addNewCustomer", (cusId) => {
            !onlineCustomers.some((cus) => cus.cusId === cusId) &&
             onlineCustomers.push({ cusId, socketId: socket.id });
             
             console.log("======onlineCustomer", onlineCustomers);
             io.emit('updateOnlineCustomers', onlineCustomers);
        })

        socket.on("disconnect", () => {
            console.log("disconnect================================", socket.id)
            onlineCustomers = onlineCustomers.filter(cus => cus.socketId !== socket.id);

            console.log("======onlineCustomer", onlineCustomers);
            io.emit('updateOnlineCustomers', onlineCustomers);
        })

        socket.on('sendMessage', (message) => {
            console.log('Message received:', message);
            socket.broadcast.emit('receiveMessage', message);
        });

        socket.on('getOnlineCustomers', () => {
            socket.emit('updateOnlineCustomers', onlineCustomers);
        });
    });

    return io;
};

export default initSocketServer;