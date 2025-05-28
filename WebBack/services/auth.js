const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Change ce secret ou stocke-le dans .env
const JWT_SECRET = fs.readFileSync(path.join(__dirname, '../secret/keys/secret.key'), 'utf8').trim();
const JWT_EXPIRES_IN = '1h';

function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        audience: 'users',
        issuer: 'clustree'
    });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET, {
            audience: 'users',
            issuer: 'clustree'
        });
    } catch (err) {
        throw new Error('Invalid or expired token');
    }
}

function authorizeRole(requiredRole) {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Missing token' });

        try {
            const payload = verifyToken(token);
            if (payload.role !== requiredRole) {
                return res.status(403).json({ error: 'Forbidden: insufficient role' });
            }
            req.user = payload;
            next();
        } catch (error) {
            return res.status(403).json({ error: error.message });
        }
    };
}

module.exports = { generateToken, verifyToken, authorizeRole };
