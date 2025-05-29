const db = require('../../db');

// Create a new cluster
async function createCluster({ name, ownerId, maxAffinity, minAffinity, groupSize, clusterType }) {
    const result = await db.query(
        `INSERT INTO clusters (name, owner_id, max_affinity, min_affinity, group_size, cluster_type)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
            name,
            ownerId,
            maxAffinity,
            minAffinity,
            groupSize,
            clusterType
        ]
    );
    return result.rows[0];
}

async function authorizeUserOnCluster(clusterId, userId) {
    await db.query(
        `INSERT INTO authorizedusers (cluster_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [clusterId, userId]
    );
}

// Get all clusters accessible to a given student (by user_id)
async function getClustersForStudent(userId) {
    const result = await db.query(`
        SELECT DISTINCT c.*
        FROM clusters c
        JOIN authorizedusers au ON c.id = au.cluster_id
        WHERE au.user_id = $1
    `, [userId]);
    return result.rows;
}

async function getStudentListInCluster(clusterId, userToExclude){
    try {
        const result = await db.query(`
        SELECT u.email 
        FROM users u
        INNER JOIN authorizedusers a ON u.id = a.user_id
        WHERE a.cluster_id = $1 AND u.id != $2
        `, [clusterId, userToExclude]); // exclude current user

        return result.rows;
    }catch(error){
        throw (error);
    }
}

// Get all clusters created by a specific teacher (by owner_id)
async function getClustersByOwner(ownerId) {
    const result = await db.query(
        `SELECT * FROM clusters WHERE owner_id = $1`,
        [ownerId]
    );
    return result.rows;
}

// Add a group to a cluster
async function linkClusterToGroup(clusterId, groupId) {
    await db.query(
        `INSERT INTO cluster_groups (cluster_id, group_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [clusterId, groupId]
    );
}

// Add a competence to a cluster
async function linkClusterToCompetence(clusterId, competenceId) {
    await db.query(
        `INSERT INTO cluster_competences (cluster_id, competence_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [clusterId, competenceId]
    );
}

// Get one cluster by ID (e.g., to fetch its metadata)
async function getClusterById(clusterId) {
    const result = await db.query(
        `SELECT * FROM clusters WHERE id = $1`,
        [clusterId]
    );
    return result.rows[0];
}

// Delete a cluster by ID and owner
async function deleteCluster(clusterId, ownerId) {
    const result = await db.query(
        `DELETE FROM clusters WHERE id = $1 AND owner_id = $2 RETURNING *`,
        [clusterId, ownerId]
    );
    return result.rowCount > 0;
}

async function getClusterFromId(clusterId){
    const result = await db.query(`
        SELECT c.name AS cluster_name, u.email AS teacher_email
        FROM clusters c
        JOIN users u ON u.id = c.owner_id
        WHERE c.id = $1
    `, [clusterId]);

    if (result.rows.length === 0) throw new Error("Cannot find cluster");

    const { cluster_name, teacher_email } = result.rows[0];
    return { cluster_name, teacher_email };
}

module.exports = {
    createCluster,
    getClustersForStudent,
    getClustersByOwner,
    linkClusterToGroup,
    linkClusterToCompetence,
    getClusterById,
    deleteCluster,
    authorizeUserOnCluster,
    getStudentListInCluster,
    getClusterFromId
};
