const express = require('express');
const toUnnamed = require('named-placeholders')();
const { pool } = require('../server/db');

require('dotenv').config('..');

const tablesRouter = express.Router();

// Get the names of all of the tables (minus the users table)
tablesRouter.get('/', async (req, res) => {
  try {
    const tables = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = "${process.env.AWS_DB_NAME}" AND table_name != 'user'`,
    );
    res.status(200).send(tables.map((table) => table.TABLE_NAME));
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

// Change table columns
tablesRouter.post('/:tableName/:newAttributeName/:dataType', async (req, res) => {
  try {
    const { tableName, newAttributeName, dataType } = req.params;
    const [query, params] = toUnnamed(
      `ALTER TABLE ${tableName}
    ADD \`${newAttributeName}\` ${dataType} NOT NULL;`,
      {
        tableName,
        newAttributeName,
        dataType,
      },
    );
    const table = await pool.query(query, params);
    res.status(200).send(table);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

tablesRouter.delete('/:tableName/:columnName', async (req, res) => {
  try {
    const { tableName, columnName } = req.params;
    const [query, params] = toUnnamed(
      `ALTER TABLE ${tableName}
    DROP COLUMN \`${columnName}\`;`,
      {
        tableName,
        columnName,
      },
    );
    const table = await pool.query(query, params);
    res.status(200).send(table);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

tablesRouter.put('/:tableName/:columnName/:attributeName', async (req, res) => {
  try {
    const { tableName, columnName, attributeName } = req.params;
    const [query, params] = toUnnamed(
      `ALTER TABLE ${tableName} RENAME COLUMN \`${columnName}\` TO \`${attributeName}\`;`,
      {
        tableName,
        columnName,
        attributeName,
      },
    );
    const table = await pool.query(query, params);
    res.status(200).send(table);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = tablesRouter;
