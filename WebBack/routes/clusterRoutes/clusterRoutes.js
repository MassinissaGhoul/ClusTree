const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const { parseStudentList } = require("../../utils/parseStudentList");

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // To buffer-in the files

const clusterDAO = require('../../middlewares/db/clusterDAO');
const localFilesDAO = require('../../middlewares/localFiles/localFilesDAO');
const userDAO = require('../../middlewares/db/userDAO');

// JWT middleware
const { authorizeRole } = require('../../services/auth');

// TEACHER — Create a cluster from uploaded file and insert in DB
router.post('/teacher/create', authorizeRole("teacher"), upload.single('studentsFile'), async (req, res) => {
    try {
        const { maxAffinity, minAffinity, groupSize, clusterName, clusterType } = req.body;
        if(!maxAffinity || !minAffinity || !groupSize || !clusterName || !clusterType){
            console.log(maxAffinity, minAffinity, groupSize, clusterName, clusterType )
            throw new Error("Missing fields");
        }
        const ownerEmail = req.user.email;

        // Read the student list : csv, json, anything
        const studentList = parseStudentList(req.file.buffer);

        const CLIparams = {groupSize: parseInt(groupSize), outputFolder:"../../WebBack/uploads/" + ownerEmail +"/" + clusterName};
        const graph = await localFilesDAO.createClusterGraphFromStudentList(ownerEmail, clusterName, studentList, CLIparams);

        const name = clusterName;
        const cluster = await clusterDAO.createCluster({
            name,
            ownerId: req.user.id,
            maxAffinity: maxAffinity ? parseInt(maxAffinity) : 5, // Default 5
            minAffinity: minAffinity ? parseInt(minAffinity) : 0, // Default 0
            groupSize: groupSize ? parseInt(groupSize) : 3, // Default 3
            clusterType
        });

        for (const email of studentList) {
            const userId = await userDAO.getUserIdByEmail(email);
            if (userId) {
                await clusterDAO.authorizeUserOnCluster(cluster.id, userId);
            } else {
                console.warn(`Utilisateur non trouvé pour l'email : ${email}`);
            }
        }

        res.status(201).json({ message: 'Cluster created', cluster });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create cluster\n' + err });
    }
});

// TEACHER - Delete the chosen cluster
router.delete('/teacher/delete/:clusterId', authorizeRole('teacher'), async (req, res) => {
    const clusterId = req.params.clusterId;
    const ownerId = req.user.id;

    try {
        const cluster = await clusterDAO.getClusterById(clusterId);
        if (!cluster || cluster.owner_id !== ownerId) {
            return res.status(403).json({ error: 'Not authorized to delete this cluster' });
        }

        await clusterDAO.deleteCluster(clusterId);
        res.json({ message: 'Cluster deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete cluster' });
    }
});


// TEACHER — List all their own clusters
router.get('/teacher/list', authorizeRole('teacher'), async (req, res) => {
    try {
        const clusters = await clusterDAO.getClustersByOwner(req.user.id);
        res.json(clusters);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch clusters' });
    }
});

// STUDENT — List accessible clusters
router.get('/student/list', authorizeRole('student'), async (req, res) => {
    try {
        const clusters = await clusterDAO.getClustersForStudent(req.user.id);
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
