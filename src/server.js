require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import configCORS from './config/cors';
import cookieParser from 'cookie-parser';
import connection from './config/connectDB';

const app = express();

// config CORS
configCORS(app);

// config body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// config cookie-parser
app.use(cookieParser())

// connection();

const POST = process.env.PORT || 8080;
app.listen(POST, () => {
    console.log(`Server is running on port ${POST}`);
});