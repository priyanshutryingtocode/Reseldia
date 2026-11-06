const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const pollRoutes = require('./src/routes/pollRoutes');
const announcementRoutes = require('./src/routes/announcementRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const healthRoutes = require('./src/routes/healthRoutes');
const { notFound, errorHandler } = require('./src/middleware/errorMiddleware');


const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is not set. Refusing to start.');
    process.exit(1);
}

const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(helmet());
app.use(cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true
}));
app.use(express.json({ limit: '100kb' }));
// Express 5 leaves req.body undefined for unparsed requests; controllers rely on it.
app.use((req, res, next) => {
    if (req.body === undefined) req.body = {};
    next();
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many attempts. Please try again later.' }
});

const initFeatureTables = require('./src/db/initFeatureTables');

app.get('/', (req, res) => {
    res.json({ message: "Welcome to the Reseldia" });
});


app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/health', healthRoutes);

app.use(notFound);
app.use(errorHandler);

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
