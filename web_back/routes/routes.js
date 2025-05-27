/**
 * THIS IS THE MAIN ROUTING FILE
 */

const express = require("express");

// Add the subroutes directories
const userRoutes = require("./userRoutes/userRoutes");

const router = express.Router();

router.use("", userRoutes);

module.exports = router;