const pool = require('../../db');

const getNotifications = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT *
             FROM notifications
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 30`,
            [req.user.user_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const markNotificationsRead = async (req, res) => {
    try {
        await pool.query(
            `UPDATE notifications
             SET read_at = CURRENT_TIMESTAMP
             WHERE user_id = $1 AND read_at IS NULL`,
            [req.user.user_id]
        );
        res.json({ message: "Notifications marked as read." });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = { getNotifications, markNotificationsRead };
