require('dotenv').config();
import path from "path";
import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import configCORS from './config/cors';
import cookieParser from 'cookie-parser';
import connection from './config/connectDB';
import initApiRoutes from './routes/api';
import { Server } from 'socket.io'
require('./passport');

const app = express();
const server = http.createServer(app);

// Khởi tạo server Socket.IO
const io = new Server(server, {
    cors: "http://localhost:3000",  // CORS cho frontend
});

// Lắng nghe sự kiện kết nối của client
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });

    // Lắng nghe sự kiện tin nhắn hoặc các sự kiện khác nếu cần
    socket.on('sendMessage', (message) => {
        console.log('Message received:', message);
        socket.broadcast.emit('receiveMessage', message);  // Phát sự kiện cho tất cả các client khác
    });
});

// Export `io` để có thể sử dụng trong các file khác
export { io };

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// config CORS
configCORS(app);

// config body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// config cookie-parser
app.use(cookieParser())

// connection();

initApiRoutes(app);

const POST = process.env.PORT || 8080;
server.listen(POST, () => {
    console.log(`Server is running on port ${POST}`);
});