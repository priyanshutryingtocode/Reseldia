const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {

    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ msg: "Authentication is not configured" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        
        next();
    } catch (err) {
        res.status(401).json({ msg: "Token is not valid" });
    }
};
