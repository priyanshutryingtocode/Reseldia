const pool = require('../../db');

const initFeatureTables = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS event_bookmarks (
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, activity_id)
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            type VARCHAR(50) NOT NULL,
            title VARCHAR(160) NOT NULL,
            message TEXT NOT NULL,
            activity_id INTEGER REFERENCES activities(id) ON DELETE SET NULL,
            read_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS announcements (
            id SERIAL PRIMARY KEY,
            title VARCHAR(160) NOT NULL,
            description TEXT NOT NULL,
            category VARCHAR(80) DEFAULT 'Announcement',
            image_url TEXT,
            is_active BOOLEAN DEFAULT true,
            created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
};

module.exports = initFeatureTables;
