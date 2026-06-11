const { Pool } = require("pg");
require("dotenv").config();

const logger = require("./logger");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool
  .connect()
  .then(() => {
    logger.info("PostgreSQL Connected");
  })
  .catch((err) => {
    logger.error(err);
  });

module.exports = pool;
