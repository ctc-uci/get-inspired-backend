/* eslint-disable */
const express = require('express');
const toUnnamed = require('named-placeholders')();
const { pool } = require('../server/db');
const { isNumeric } = require('../common/utils');

const router = express.Router();

// get computations
router.get('/', async (req, res) => {
  try {
    const computations = await pool.query('SELECT * FROM computations;');
    res.status(200).json(computations);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// get computationsID
router.get('/computation/:computationId', async (req, res) => {
  try {
    const { computationId } = req.params;
    isNumeric(computationId);
    const [query, params] = toUnnamed('SELECT * FROM computations WHERE id = :computationId;', {
      computationId,
    });
    const computation = await pool.query(query, params);
    res.status(200).json(computation[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// get computations from surveyid
router.get('/computation/:computationId', async (req, res) => {
  try {
    const { surveyId } = req.params;
    isNumeric(surveyId);
    const [query, params] = toUnnamed('SELECT * FROM computations WHERE survey_id = :surveyId', {
      surveyId,
    });
    const computations = await pool.query(query, params);
    res.status(200).json(computations);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// create computation
// TODO: GET ALL COLUMNS DYNAMICALLY
router.post('/', async (req, res) => {
  try {
    // Get all column names dynamically
    const columnNames = (
      await pool.query(
        `SELECT COLUMN_NAME, DATA_TYPE from information_schema.columns
    WHERE table_schema = "${process.env.AWS_DB_NAME}"
    AND table_name = 'computations' AND COLUMN_NAME != 'id'`,
      )
    ).map((column) => column.COLUMN_NAME);

    const [query, params] = toUnnamed(
      `
    INSERT INTO computations (
      ${columnNames.map((columnName) => `\`${columnName}\``).join()}
    )
    VALUES (
     ${columnNames.map((columnName) => `:${columnName.replace(/\s+/g, '_')}`).join()}
    );
    SELECT * FROM computations WHERE id = LAST_INSERT_ID();`,
      columnNames.reduce(
        (acc, current) => ({
          ...acc,
          [current.replace(/\s+/g, '_')]: req.body[current] ? req.body[current] : null,
        }),
        {},
      ),
    );
    const computation = await pool.query(query, params);
    res.status(200).json(computation);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// delete computation
router.delete('/:computationId', async (req, res) => {
  try {
    const { computationId } = req.params;
    isNumeric(computationId);
    const [query, params] = toUnnamed(`DELETE from computations WHERE id = :computationId;`, {
      computationId,
    });
    const computation = await pool.query(query, params);
    res.status(200).json(computation[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// update computation
router.put('/:computationId', async (req, res) => {
  try {
    const { computationId } = req.params;

    // Get all column names dynamically
    const columnNames = (
      await pool.query(
        `SELECT COLUMN_NAME, DATA_TYPE from information_schema.columns
    WHERE table_schema = "${process.env.AWS_DB_NAME}"
    AND table_name = 'computations' AND COLUMN_NAME != 'id'`,
      )
    ).map((column) => column.COLUMN_NAME);

    // Update table based on all columns
    const [query, params] = toUnnamed(
      `UPDATE computations
      SET
       ${columnNames
         .map((columnName) => `\`${columnName}\` = :${columnName.replace(/\s+/g, '_')}, `)
         .join('')}
      id = :computationId
    WHERE id = :computationId;
    SELECT * FROM computations WHERE id = :computationId;`,
      columnNames.reduce(
        (dict, current) => ({ ...dict, [current.replace(/\s+/g, '_')]: req.body[current] }),
        {
          computationId,
        },
      ),
    );
    const updatedComputation = await pool.query(query, params);
    res.status(200).json(updatedComputation[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
module.exports = router;
