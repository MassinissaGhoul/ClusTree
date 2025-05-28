const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Multer setup for file uploads under uploads/<teacher_email>/<cluster_name>/
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const user = req.user;
        const cluster = req.params.cluster;

        if (!user || !cluster) {
            return cb(new Error('Missing user or cluster info'));
        }

        const dir = path.join(__dirname, '..', 'uploads', user.email, cluster);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

// Write a JSON file in a specific cluster folder
async function writeJsonInCluster(teacherEmail, clusterName, filename, data) {
    const dir = path.join(__dirname, '..', 'uploads', teacherEmail, clusterName);
    fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, filename);
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Create a folder and parse a student list to generate a graph JSON (placeholder)
async function createClusterGraphFromStudentList(teacherEmail, clusterName, studentFilePath) {
    const dir = path.join(__dirname, '..', 'uploads', teacherEmail, clusterName);
    fs.mkdirSync(dir, { recursive: true });

    // Placeholder logic: you will implement the real graph generation
    const dummyGraph = {
        nodes: [],
        edges: []
    };

    const filePath = path.join(dir, 'graph.json');
    await fs.promises.writeFile(filePath, JSON.stringify(dummyGraph, null, 2), 'utf-8');
}

// List all clusters for a specific teacher
async function listClusters(teacherEmail) {
    const baseDir = path.join(__dirname, '..', 'uploads', teacherEmail);
    try {
        const items = await fs.promises.readdir(baseDir, { withFileTypes: true });
        return items.filter(i => i.isDirectory()).map(i => i.name);
    } catch (err) {
        return []; // Return empty list if folder doesn't exist
    }
}

// Get full path to graph.json
function getGraphFilePath(teacherEmail, clusterName) {
    return path.join(__dirname, '..', 'uploads', teacherEmail, clusterName, 'graph.json');
}

// Read and parse graph.json
async function readGraphJson(teacherEmail, clusterName) {
    const filePath = getGraphFilePath(teacherEmail, clusterName);
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(content);
}

module.exports = {
    upload,
    writeJsonInCluster,
    createClusterGraphFromStudentList,
    listClusters,
    getGraphFilePath,
    readGraphJson
};
