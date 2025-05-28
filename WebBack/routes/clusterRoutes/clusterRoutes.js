const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const clusterFileDAO = require('../../middlewares/db/clusterDAO');
const localFilesDAO = require('../../middlewares/localFiles/localFilesDAO');

// JWT middleware
const { authorizeRole } = require('../../services/auth');

// TEACHER — Create a cluster from uploaded file and insert in DB
router.post('/teacher/create', authorizeRole('teacher'), async (req, res) => {
    try {
        const { name, maxAffinity, groupSize } = req.body;
        const ownerEmail = req.user.email;

        // Placeholder: simulate reading student list and creating graph
        const studentListPath = path.join(__dirname, '..', 'uploads', ownerEmail, name, 'students.csv');
        const graph = await localFilesDAO.generateGraphFromFile(studentListPath); // <- this is your placeholder logic

        await localFilesDAO.writeGraphJson(ownerEmail, name, graph);

        const cluster = await clusterFileDAO.createCluster({
            name,
            ownerId: req.user.id,
            maxAffinity: maxAffinity ? parseInt(maxAffinity) : null,
            groupSize: groupSize ? parseInt(groupSize) : null
        });

        res.status(201).json({ message: 'Cluster created', cluster });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create cluster' });
    }
});

// TEACHER — List all their own clusters
router.get('/teacher/list', authorizeRole('teacher'), async (req, res) => {
    try {
        const clusters = await clusterFileDAO.getClustersByOwner(req.user.id);
        res.json(clusters);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch clusters' });
    }
});

// STUDENT — List accessible clusters
router.get('/student/list', authorizeRole('student'), async (req, res) => {
    try {
        const clusters = await clusterFileDAO.getClustersForStudent(req.user.id);
        res.json(clusters);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch clusters' });
    }
});

// Shared — Get raw content of graph.json for a cluster
router.get('/:cluster/graph/raw', async (req, res) => {
    try {
        const clusterName = req.params.cluster;
        const ownerEmail = req.query.owner; // or determine it by lookup if you have that relation

        const graph = await localFilesDAO.readGraphJson(ownerEmail, clusterName);
        res.json(graph);
    } catch (err) {
        res.status(404).json({ error: 'Graph not found' });
    }
});

// Shared — Get file path to graph.json (for download)
router.get('/:cluster/graph/file', async (req, res) => {
    try {
        const clusterName = req.params.cluster;
        const ownerEmail = req.query.owner;

        const filePath = await localFilesDAO.getGraphJsonPath(ownerEmail, clusterName);
        res.sendFile(filePath);
    } catch (err) {
        res.status(404).json({ error: 'File not found' });
    }
});

module.exports = router;
