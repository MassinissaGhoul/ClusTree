const argon2 = require('argon2');
const db = require('../db');

async function userLogin(email, password) {
    if (!email || !password) {
        throw new Error('Missing required fields');
    }

    // Get the user informations including their role
    const result = await db.query(
        `SELECT u.id, u.email, u.password, u.name, u.family_name, r.role_name 
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE u.email = $1`,
        [email]
    );

    const user = result.rows[0];
    if (!user) {
        throw new Error('User does not exist');
    }

    // Check if the password matches
    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) {
        throw new Error('Wrong credentials');
    }

    // Format the informations, without the password
    const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        familyName: user.family_name,
        role: user.role_name
    };

    return userData;
}

async function userRegister(email, name, family_name, password) {
    if (!email || !name || !family_name || !password) {
        throw new Error("Missing required fields");
    }

    // Solid hashing method
    const hashedPassword = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 3,
        parallelism: 1
    });

    // Register the user but don't duplicate the field email
    const result = await db.query(
        "INSERT INTO users (email, name, family_name, password) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING",
        [email, name, family_name, hashedPassword]
    );

    if (result.rowCount === 0) {
        throw new Error('User already registered');
    }

    return { id: result.rows[0].id };
}

async function deleteUser(userId) {
    if (!userId) {
        throw new Error("Missing userId");
    }

    // Just delete the user
    await db.query("DELETE FROM users WHERE id = $1", [userId]);

    return { success: true };
}

async function updateUser(id, email, name, family_name, password) {
    // Get the existing informations
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);

    if (result.rows.length === 0) {
        throw new Error("User not found");
    }

    const existingUser = result.rows[0];

    // If the field is set in the args, then replace it, keep the previous one otherwise
    const updatedEmail = email || existingUser.email;
    const updatedName = name || existingUser.name;
    const updatedFamilyName = family_name || existingUser.family_name;

    let updatedPassword = existingUser.password;
    if (password) {
        // Rehash the password if the user wishes to update it
        updatedPassword = await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 1
        });
    }

    // Then query the update to the database
    await db.query(
        "UPDATE users SET email = $1, name = $2, family_name = $3, password = $4 WHERE id = $5",
        [
            updatedEmail,
            updatedName,
            updatedFamilyName,
            updatedPassword,
            id
        ]
    );

    return { success: true };
}

async function getUserInfos(userId) {
    const result = await db.query(
        "SELECT id, email, name, family_name, register_date FROM users WHERE id = $1",
        [
            userId
        ]
    );

    if (result.rows.length === 0) {
        throw new Error('User does not exist');
    }

    return result.rows[0];
}

module.exports = { userLogin, userRegister, deleteUser, updateUser, getUserInfos };
