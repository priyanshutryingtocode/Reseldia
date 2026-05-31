const initFeatureTables = require('../src/db/initFeatureTables');
const pool = require('../db');

const run = async () => {
    try {
        await initFeatureTables();
        console.log('Feature tables created or already exist.');
    } catch (err) {
        console.error('Migration failed.');
        console.error(err.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
};

run();
