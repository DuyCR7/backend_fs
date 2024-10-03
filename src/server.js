require('dotenv').config();
import path from "path";
import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import configCORS from './config/cors';
import cookieParser from 'cookie-parser';
import connection from './config/connectDB';
import initApiRoutes from './routes/api';
import initSocketServer from "./socket";
require('./passport');

const app = express();
const server = http.createServer(app);

// Khởi tạo server Socket.IO
const io = initSocketServer(server);

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