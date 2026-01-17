const pool = require('../../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    const { full_name, email, password, flat_number, role } = req.body;

    try {
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(401).json({ error: "User already exists!" });
        }

        const saltRound = 10;
        const hashedPassword = await bcrypt.hash(password, saltRound);

        // Security Note: In a real app, force 'role' to be 'resident' here 
        // to prevent people from registering themselves as admins via Postman.
        const newUser = await pool.query(
            'INSERT INTO users (full_name, email, password_hash, flat_number, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, role',
            [full_name, email, hashedPassword, flat_number, role || 'resident']
        );

        res.json({ message: "Registration Successful! ✅", user: newUser.rows[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (user.rows.length === 0) {
            return res.status(401).json({ error: "Invalid Credentials" });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid Credentials" });
        }

        const token = jwt.sign(
            { user_id: user.rows[0].id, role: user.rows[0].role }, 
            process.env.JWT_SECRET || 'fallback_secret', 
            { expiresIn: '1h' }
        );

        res.json({ 
            token, 
            role: user.rows[0].role,
            user: {
                id: user.rows[0].id,
                full_name: user.rows[0].full_name,
                email: user.rows[0].email
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

const getMe = async (req, res) => {
    try {
        const user = await pool.query(
            'SELECT id, full_name, email, flat_number, role FROM users WHERE id = $1', 
            [req.user.user_id]
        );
        
        res.json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

module.exports = { registerUser, loginUser, getMe };