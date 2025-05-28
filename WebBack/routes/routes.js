/**
 * THIS IS THE MAIN ROUTING FILE
 */

const express = require("express");

// Add the subroutes directories
const userRoutes = require("./userRoutes/userRoutes");
const clusterRoutes = require("./clusterRoutes/clusterRoutes");

const router = express.Router();

router.use("/user", userRoutes);
router.use("/cluster", clusterRoutes);

module.exports = router;