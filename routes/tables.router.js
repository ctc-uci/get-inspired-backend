const express = require('express');
const toUnnamed = require('named-placeholders')();
const { pool } = require('../server/db');

require('dotenv').config('..');

const tablesRouter = express.Router();

// Get all tables
tablesRouter.get('/', async (req, res) => {
  try {
    const tables = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = "${process.env.AWS_DB_NAME}"`,
    );
    res.status(200).send(tables);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get all columns given a table
tablesRouter.get('/:table/columns', async (req, res) => {
  try {
    const { table } = req.params;
    const [query, params] = toUnnamed(
      `SELECT COLUMN_NAME, DATA_TYPE from information_schema.columns
    WHERE table_schema = "${process.env.AWS_DB_NAME}"
    AND table_name = :table`,
      {
        table,
      },
    );
    const columns = await pool.query(query, params);
    res.status(200).send(columns);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = tablesRouter;
