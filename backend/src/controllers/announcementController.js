const pool = require('../../db');

const getActiveAnnouncements = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM announcements
             WHERE is_active = true
             ORDER BY created_at DESC
             LIMIT 10`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const getAllAnnouncements = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const createAnnouncement = async (req, res) => {
    const { title, description, category, image_url, is_active = true } = req.body;

    if (!title?.trim() || !description?.trim()) {
        return res.status(400).json({ message: "Title and description are required." });
    }

    try {
        const result = await pool.query(
            `INSERT INTO announcements (title, description, category, image_url, is_active, created_by)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
                title.trim(),
                description.trim(),
                category?.trim() || 'Announcement',
                image_url?.trim() || null,
                Boolean(is_active),
                req.user.user_id
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const updateAnnouncement = async (req, res) => {
    const { title, description, category, image_url, is_active = true } = req.body;

    if (!title?.trim() || !description?.trim()) {
        return res.status(400).json({ message: "Title and description are required." });
    }

    try {
        const result = await pool.query(
            `UPDATE announcements
             SET title = $1, description = $2, category = $3, image_url = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
             WHERE id = $6
             RETURNING *`,
            [
                title.trim(),
                description.trim(),
                category?.trim() || 'Announcement',
                image_url?.trim() || null,
                Boolean(is_active),
                req.params.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Announcement not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

const deleteAnnouncement = async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM announcements WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Announcement not found" });
        }
        res.json({ message: "Announcement deleted." });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = {
    getActiveAnnouncements,
    getAllAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
};
