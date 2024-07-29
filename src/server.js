require('dotenv').config();
import path from "path";
import express from 'express';
import bodyParser from 'body-parser';
import configCORS from './config/cors';
import cookieParser from 'cookie-parser';
import connection from './config/connectDB';
import initApiRoutes from './routes/api';
require('./passport');

const app = express();

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
app.listen(POST, () => {
    console.log(`Server is running on port ${POST}`);
});