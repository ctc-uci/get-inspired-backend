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
// TODO: GET ALL COLUMNS DYNAMICALLY
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

    const getRowData = (rowData) => {
      return columnNames.map((col) => {
        if (col == 'survey_id') {
          console.log('yes i am adidng the survey id');
          return req.body.survey_id;
        } else {
          return rowData[col] ? rowData[col] : null;
        }
      });
    };

    // console.log(values);
    const [query, params] = toUnnamed(
      `
      INSERT INTO raker (
        ${columnNames.map((columnName) => `\`${columnName}\``).join()}
      )
      VALUES
      ${req.body.rakers
        .map(
          (aRaker) =>
            `(${columnNames.map((columnName) => `:${columnName.replace(/\s+/g, '_')}`).join()})`,
        )
        .join(',')};

      SELECT * FROM raker WHERE id = LAST_INSERT_ID();
    `,
      req.body.rakers
        .map((rowData) => getRowData(rowData))
        .reduce((acc, row) => acc.concat(row), []),
    );
    console.log('um hello?');
    console.log(query);
    console.log(params);
    const raker = await pool.query(query, params);
    console.log(raker);
    res.status(200).json(raker);
  } catch (err) {
    res.status(500).send(err.message);
    console.log(err.message);
  }
});
// delete raker
router.delete('/:rakerId', async (req, res) => {
  try {
    const { rakerId } = req.params;
    isNumeric(rakerId);
    const [query, params] = toUnnamed(`DELETE from raker WHERE id = :rakerId;`, {
      rakerId,
    });
    const raker = await pool.query(query, params);
    res.status(200).json(raker[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// update raker
router.put('/:rakerId', async (req, res) => {
  try {
    const { rakerId } = req.params;

    // Get all column names dynamically
    const columnNames = (
      await pool.query(
        `SELECT COLUMN_NAME, DATA_TYPE from information_schema.columns
    WHERE table_schema = "${process.env.AWS_DB_NAME}"
    AND table_name = 'raker' AND COLUMN_NAME != 'id'`,
      )
    ).map((column) => column.COLUMN_NAME);

    // Update table based on all columns
    const [query, params] = toUnnamed(
      `UPDATE raker
      SET
       ${columnNames
         .map((columnName) => `\`${columnName}\` = :${columnName.replace(/\s+/g, '_')}, `)
         .join('')}
      id = :rakerId
    WHERE id = :rakerId;
    SELECT * FROM raker WHERE id = :rakerId;`,
      columnNames.reduce(
        (dict, current) => ({ ...dict, [current.replace(/\s+/g, '_')]: req.body[current] }),
        {
          rakerId,
        },
      ),
    );
    const updatedRaker = await pool.query(query, params);
    res.status(200).json(updatedRaker[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
module.exports = router;
