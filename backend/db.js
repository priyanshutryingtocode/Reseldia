const { Pool } = require('pg');
require('dotenv').config();

const isCloud = !!process.env.DATABASE_URL;

const pool = new Pool(
    isCloud 
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        } 
        : {
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
        }
);

pool.connect((err) => {
    if (err) {
        console.error('Database connection error', err.stack);
    } else {
        console.log(isCloud ? 'Connected to Cloud Database ☁️' : 'Connected to Local Database 💻');
    }
});

module.exports = pool;