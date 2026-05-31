const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const pollRoutes = require('./src/routes/pollRoutes');
const announcementRoutes = require('./src/routes/announcementRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET is not set. Authenticated routes will reject requests.');
}

app.use(cors());              
app.use(express.json());      

const initFeatureTables = require('./src/db/initFeatureTables');

app.get('/', (req, res) => {
    res.json({ message: "Welcome to the Reseldia" });
});


app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);

const startServer = async () => {
    try {
        await initFeatureTables();
        console.log('Feature tables are ready.');

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to initialize feature tables.');
        console.error(err.message);
        process.exit(1);
    }
};

startServer();
