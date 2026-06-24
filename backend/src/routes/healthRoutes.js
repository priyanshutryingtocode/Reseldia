const router = require('express').Router();
const pool = require('../../db');

router.get('/', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(503).json({
            status: 'error',
            database: 'unavailable',
            error: err.message
        });
    }
});

module.exports = router;
