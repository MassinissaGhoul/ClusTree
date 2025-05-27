const express = require('express');
const router = express.Router();

const { verifyToken, authorizeRole } = require('../../services/auth');
const clusterController = require('../controllers/clusterController');

// Student - list the clusters they're allowed to see
router.get('/clusters', ensureAuthenticated, ensureRole('student'), async (req, res) => {
  try {
    const clusters = await clusterController.listStudentClusters(req.session.user);
    res.json({ clusters });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student - submit their preferences
router.post('/clusters/:clusterId/preferences', ensureAuthenticated, ensureRole('student'), async (req, res) => {
  try {
    const result = await clusterController.submitPreferences(req.session.user, req.params.clusterId, req.body);
    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Teacher - list their clusters
router.get('/teacher/clusters', ensureAuthenticated, ensureRole('teacher'), async (req, res) => {
  try {
    const clusters = await clusterController.listTeacherClusters(req.session.user);
    res.json({ clusters });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Teacher - create a new cluster
router.post('/teacher/clusters', ensureAuthenticated, ensureRole('teacher'), async (req, res) => {
  try {
    const cluster = await clusterController.createCluster(req.session.user, req.body);
    res.json({ cluster });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Teacher - run the script to create the groups
router.post('/teacher/clusters/:clusterId/run-script', ensureAuthenticated, ensureRole('teacher'), async (req, res) => {
  try {
    const output = await clusterController.runGroupGenerationScript(req.session.user, req.params.clusterId);
    res.json({ success: true, output });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
