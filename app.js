require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('../backend/db.config/dbConnections.js');
const urlRoutes = require('../backend/routes/urlRoutes.js');

const app = express();


connectDB();

app.use(express.json());
app.use(cors({
    // origin: 'https://url-website-p59k.vercel.app', 
    // origin: "http://localhost:5173",
    origin: "https://url-frontend-zeta.vercel.app",
    // origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    // headers: ['Content-Type', 'application/json'],
    credentials: true,
}));



// Routes
app.use('/api', urlRoutes);

const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

module.exports = app;