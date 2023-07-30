/* eslint-disable */
const express = require('express');
const toUnnamed = require('named-placeholders')();
const { pool } = require('../server/db');
const { isNumeric } = require('../common/utils');

const router = express.Router();

// get rakers
router.get('/', async (req, res) => {
  try {
    const rakers = await pool.query('SELECT * FROM raker;');
    res.status(200).json(rakers);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// get rakerId
router.get('/raker/:rakerId', async (req, res) => {
  try {
    const { rakerId } = req.params;
    isNumeric(rakerId);
    const [query, params] = toUnnamed('SELECT * FROM raker WHERE id = :rakerId;', {
      rakerId,
    });
    const raker = await pool.query(query, params);
    res.status(200).json(raker[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// get rakers from surveyid
router.get('/survey/:surveyId', async (req, res) => {
  try {
    const { surveyId } = req.params;
    isNumeric(surveyId);
    const [query, params] = toUnnamed('SELECT * FROM raker WHERE survey_id = :surveyId', {
      surveyId,
    });
    const rakers = await pool.query(query, params);
    res.status(200).json(rakers);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// create raker
router.post('/', async (req, res) => {
  try {
    // Get all column names dynamically
    const columnNames = (
      await pool.query(
        `SELECT COLUMN_NAME, DATA_TYPE from information_schema.columns
    WHERE table_schema = "${process.env.AWS_DB_NAME}"
    AND table_name = 'raker' AND COLUMN_NAME != 'id'`,
      )
    ).map((column) => column.COLUMN_NAME);

    const [query, params] = toUnnamed(
      `
      INSERT INTO raker (
        ${columnNames.map((columnName) => `\`${columnName}\``).join()}
      )
      VALUES
      ${req.body.rakers
        .map(
          (aRaker, index) =>
            `(${columnNames
              .map((columnName) => `:${columnName.replace(/\s+/g, '_') + index}`)
              .join()})`,
        )
        .join(',')};

      SELECT * FROM raker WHERE id = LAST_INSERT_ID();
    `,
      req.body.rakers
        .map((rakerDict, index) => {
          const dict = {};
          Object.keys(rakerDict).forEach((key) => {
            dict[`${key.replace(/\s+/g, '_')}${index}`] = rakerDict[key];
          });
          dict[`survey_id${index}`] = req.body.survey_id;
          return dict;
        })
        .reduce((acc, dict) => Object.assign(acc, dict), {}),
    );
    const raker = await pool.query(query, params);
    res.status(200).json(raker);
  } catch (err) {
    res.status(500).send(err.message);
    console.log(err.message);
  }
});

// delete raker
router.delete('/', async (req, res) => {
  try {
    const ids = req.query.ids.split(',').map(Number);
    const [query, params] = toUnnamed(`DELETE from raker WHERE id IN (:ids);`, { ids });
    const raker = await pool.query(query, params);

    res.status(200).json(raker[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// update raker
router.put('/', async (req, res) => {
  try {
    const rakerIds = Object.keys(req.body);

    // Get all column names dynamically
    const columnNames = (
      await pool.query(
        `SELECT COLUMN_NAME, DATA_TYPE from information_schema.columns
    WHERE table_schema = "${process.env.AWS_DB_NAME}"
    AND table_name = 'raker' AND COLUMN_NAME != 'id'`,
      )
    ).map((column) => column.COLUMN_NAME);

    const setClause = columnNames
      .map((column) => {
        const cases = rakerIds
          .map(
            (rakerId) =>
              `WHEN id = :rakerId_${rakerId} THEN :${column.replace(
                /\s+/g,
                '_',
              )}_rakerId_${rakerId}`,
          )
          .join(' ');
        return `\`${column}\` = CASE ${cases} ELSE \`${column}\` END`;
      })
      .join(', ');

    const theParams = rakerIds.reduce((result, rakerId) => {
      const rakerData = req.body[rakerId];
      const updatedResult = { ...result }; // Create a new object to avoid modifying the parameter directly
      Object.keys(rakerData).forEach((column) => {
        updatedResult[`${column.replace(/\s+/g, '_')}_rakerId_${rakerId}`] = rakerData[column];
      });
      updatedResult[`rakerId_${rakerId}`] = rakerId;
      return updatedResult;
    }, {});

    // Update table based on all columns
    const [query, params] = toUnnamed(
      `UPDATE raker SET ${setClause} WHERE id IN (${rakerIds.join(', ')});
                   SELECT * FROM raker WHERE id IN (${rakerIds.join(', ')});`,
      theParams,
    );

    const updatedRaker = await pool.query(query, params);
    res.status(200).json(updatedRaker[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
module.exports = router;
