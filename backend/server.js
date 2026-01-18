const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const pollRoutes = require('./src/routes/pollRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());              
app.use(express.json());      

const db = require('./db');

app.get('/', (req, res) => {
    res.json({ message: "Welcome to the Reseldia" });
});


app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/polls', pollRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});