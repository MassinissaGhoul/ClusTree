const { Pool } = require('pg');

// PSQL login pool
const pool = new Pool({
  user: process.env.POSTGRES_USER, // Database user
  host: process.env.POSTGRES_HOST,  // Host's IP
  database: process.env.POSTGRES_DB, // Database name
  password: process.env.POSTGRES_PASSWORD, // PSQL's user password
  port: process.env.POSTGRES_PORT // DB port
});

module.exports = pool;