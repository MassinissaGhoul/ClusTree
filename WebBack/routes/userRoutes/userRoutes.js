const express = require('express');
const router = express.Router();

const userDAO = require('../../middlewares/db/userDAO');
const { verifyToken, authorizeRole, generateToken } = require('../../services/auth'); // Auth service

// Authentification middleware
async function requireAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
        const payload = await verifyToken(token);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(403).json({ error: err.message });
    }
}

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { userData } = await userDAO.userLogin(email, password);
        const token = await generateToken(userData);
        res.json({ user: userData, token });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
});

// Register
router.post('/register', async (req, res) => {
    const { email, name, family_name, password } = req.body;
    try {
        const user = await userDAO.userRegister(email, name, family_name, password);
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// User infos already authed
router.get('/me', requireAuth, async (req, res) => {
    try {
        const user = await userDAO.getUserInfos(req.user.id);
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// User infos update
router.put('/me', requireAuth, async (req, res) => {
    const { email, name, family_name, password } = req.body;
    try {
        const result = await userDAO.updateUser(req.user.id, email, name, family_name, password);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete user
router.delete('/me', requireAuth, async (req, res) => {
    try {
        const result = await userDAO.deleteUser(req.user.id);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
