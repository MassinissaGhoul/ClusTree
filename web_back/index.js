// Load .env variables
require('dotenv').config();

// Expressjs
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

const helmet = require('helmet');

// DB
const db = require('./db');

// Routes
const routes = require("./routes/routes");

// API
const cors = require('cors');
app.use(cors());

app.use(express.json());

// Main routes
app.use("/api", routes);

// Try to
(async () => {
    try {
        const result = await db.query('SELECT NOW()');
        console.log('Database successfully !', result.rows);
    } catch (err) {
        console.error('Erreur de connexion de la BDD :', err);
    }
})();

// To secure the API
app.use(helmet({
  contentSecurityPolicy: {
      directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
      },
  },
  /*
  hsts: { // May be important to allow the front to not hash the passwords for the debugging and SSL
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
  },*/
  noSniff: true,
  referrerPolicy: { policy: 'same-origin' }
}));

// Allow the API to be used to the public
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on : http://localhost:${PORT}`);
});