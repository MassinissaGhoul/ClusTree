// services/auth.js
const { V4 } = require('paseto');
const { readFileSync } = require('fs');
const path = require('path');

const privateKey = readFileSync(path.join(__dirname, '../secret/keys/private.key.pem'));
const publicKey = readFileSync(path.join(__dirname, '../secret/keys/public.key.pem'));

async function generateToken(payload) {
    return await V4.sign(payload, privateKey, {
        expiresIn: '1h',
        audience: 'users',
        issuer: 'your-app-name'
    });
}

async function verifyToken(token) {
    try {
        return await V4.verify(token, publicKey, {
            audience: 'users',
            issuer: 'your-app-name'
        });
    } catch (err) {
        throw new Error('Invalid or expired token');
    }
}

function authorizeRole(requiredRole) {
    return async (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Missing token' });

        try {
            const payload = await verifyToken(token);
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
