const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());              
app.use(express.json());      

const db = require('./db');

app.get('/', (req, res) => {
    res.json({ message: "Welcome to the Reseldia" });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});