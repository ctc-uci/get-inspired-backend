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
      VALUES
      ${req.body.clams
        .map(
          (aClam, index) =>
            `(${columnNames
              .map((columnName) => `:${columnName.replace(/\s+/g, '_') + index}`)
              .join()})`,
        )
        .join(',')};

      SELECT * FROM clam WHERE id = LAST_INSERT_ID();
    `,
      req.body.clams
        .map((clamDict, index) => {
          const dict = {};
          Object.keys(clamDict).forEach((key) => {
            dict[`${key.replace(/\s+/g, '_')}${index}`] = clamDict[key];
          });
          dict[`survey_id${index}`] = req.body.survey_id;
          return dict;
        })
        .reduce((acc, dict) => Object.assign(acc, dict), {}),
    );

    const clam = await pool.query(query, params);
    res.status(200).json(clam);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update clam
router.put('/', async (req, res) => {
  try {
    const clamIds = Object.keys(req.body);

    // Get all column names dynamically
    const columnNames = (
      await pool.query(
        `SELECT COLUMN_NAME, DATA_TYPE from information_schema.columns
    WHERE table_schema = "${process.env.AWS_DB_NAME}"
    AND table_name = 'clam' AND COLUMN_NAME != 'id'`,
      )
    ).map((column) => column.COLUMN_NAME);

    const setClause = columnNames
      .map((column) => {
        const cases = clamIds
          .map(
            (clamId) =>
              `WHEN id = :clamId_${clamId} THEN :${column.replace(/\s+/g, '_')}_clamId_${clamId}`,
          )
          .join(' ');
        return `\`${column}\` = CASE ${cases} ELSE \`${column}\` END`;
      })
      .join(', ');

    const theParams = clamIds.reduce((result, clamId) => {
      const clamData = req.body[clamId];
      const updatedResult = { ...result }; // Create a new object to avoid modifying the parameter directly
      Object.keys(clamData).forEach((column) => {
        updatedResult[`${column.replace(/\s+/g, '_')}_clamId_${clamId}`] = clamData[column];
      });
      updatedResult[`clamId_${clamId}`] = clamId;
      return updatedResult;
    }, {});

    // Update table based on all columns
    const [query, params] = toUnnamed(
      `UPDATE clam SET ${setClause} WHERE id IN (${clamIds.join(', ')});
                   SELECT * FROM clam WHERE id IN (${clamIds.join(', ')});`,
      theParams,
    );

    const updatedClam = await pool.query(query, params);
    res.status(200).json(updatedClam[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete clam
router.delete('/', async (req, res) => {
  try {
    const ids = req.query.ids.split(',').map(Number);
    const [query, params] = toUnnamed(`DELETE from clam WHERE id IN (:ids);`, { ids });
    const clam = await pool.query(query, params);

    res.status(200).json(clam[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
