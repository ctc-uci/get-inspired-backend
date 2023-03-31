const express = require('express');
const toUnnamed = require('named-placeholders')();
const { pool } = require('../server/db');
const { isNumeric } = require('../common/utils');

const router = express.Router();

// Get data for all clams
router.get('/', async (req, res) => {
  try {
    const clams = await pool.query('SELECT * FROM clam;');
    res.status(200).json(clams);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get data for specific clam based on clamId
router.get('/:clamId', async (req, res) => {
  try {
    const { clamId } = req.params;
    isNumeric(clamId);

    const [query, params] = toUnnamed('SELECT * FROM clam WHERE id = :clamId', { clamId });
    const clam = await pool.query(query, params);

    res.status(200).json(clam);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get data for clams based on rakerId
router.get('/raker/:rakerId', async (req, res) => {
  try {
    const { rakerId } = req.params;
    isNumeric(rakerId);

    const [query, params] = toUnnamed('SELECT * FROM clam WHERE raker_id = :rakerId', { rakerId });
    const clams = await pool.query(query, params);

    res.status(200).json(clams);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get data for clams based on surveyId
router.get('/survey/:surveyId', async (req, res) => {
  try {
    const { surveyId } = req.params;

    const [query, params] = toUnnamed('SELECT * FROM clam WHERE survey_id = :surveyId', {
      surveyId,
    });
    const clams = await pool.query(query, params);
    res.status(200).json(clams);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Create clam
// TODO: GET ALL COLUMNS DYNAMICALLY
router.post('/', async (req, res) => {
  try {
    // Get all column names dynamically
    const columnNames = (
      await pool.query(
        `SELECT COLUMN_NAME, DATA_TYPE from information_schema.columns
    WHERE table_schema = "${process.env.AWS_DB_NAME}"
    AND table_name = 'clam' AND COLUMN_NAME != 'id'`,
      )
    ).map((column) => column.COLUMN_NAME);

    const [query, params] = toUnnamed(
      `
      INSERT INTO clam (
      ${columnNames.map((columnName) => `\`${columnName}\``).join()}
        )
      VALUES (
        ${columnNames.map((columnName) => `:${columnName.replace(/\s+/g, '_')}`).join()}
      );
      SELECT * FROM clam WHERE id = LAST_INSERT_ID();`,
      columnNames.reduce(
        (acc, current) => ({ ...acc, [current.replace(/\s+/g, '_')]: req.body[current] }),
        {},
      ),
    );
    const clam = await pool.query(query, params);

    res.status(200).json(clam[1]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update clam
router.put('/:clamId', async (req, res) => {
  try {
    const { clamId } = req.params;

    // Get all column names dynamically
    const columnNames = (
      await pool.query(
        `SELECT COLUMN_NAME, DATA_TYPE from information_schema.columns
    WHERE table_schema = "${process.env.AWS_DB_NAME}"
    AND table_name = 'clam' AND COLUMN_NAME != 'id'`,
      )
    ).map((column) => column.COLUMN_NAME);

    // Update table based on all column names
    const [query, params] = toUnnamed(
      `UPDATE clam
         SET
        ${columnNames
          .map((columnName) => `\`${columnName}\` = :${columnName.replace(/\s+/g, '_')}, `)
          .join('')}
         id = :clamId
         WHERE id = :clamId;
      SELECT * FROM clam WHERE id = :clamId;`,
      columnNames.reduce(
        (dict, current) => ({
          ...dict,
          [current.replace(/\s+/g, '_')]: req.body[current] ? req.body[current] : '',
        }),
        {
          clamId,
        },
      ),
    );

    const updatedClam = await pool.query(query, params);

    res.status(200).json(updatedClam[1]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete clam
router.delete('/:clamId', async (req, res) => {
  try {
    const { clamId } = req.params;
    isNumeric(clamId);

    const [query, params] = toUnnamed('DELETE FROM clam WHERE id = :clamId', { clamId });
    await pool.query(query, params);

    res.status(200).json(`Deleted clam #${clamId}`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
