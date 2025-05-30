const db = require('../../db');

// Create a new cluster
async function createCluster({ name, ownerId, maxAffinity, groupSize }) {
    const result = await db.query(
        `INSERT INTO clusters (name, owner_id, max_affinity, group_size)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [name, ownerId, maxAffinity, groupSize]
    );
    return result.rows[0];
}

// Get all clusters accessible to a given student (by user_id)
async function getClustersForStudent(userId) {
    const result = await db.query(`
        SELECT DISTINCT c.*
        FROM clusters c
        JOIN cluster_groups cg ON c.id = cg.cluster_id
        JOIN user_groups ug ON cg.group_id = ug.group_id
        WHERE ug.user_id = $1
    `, [userId]);
    return result.rows;
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

module.exports = {
    createCluster,
    getClustersForStudent,
    getClustersByOwner,
    linkClusterToGroup,
    linkClusterToCompetence,
    getClusterById
};
