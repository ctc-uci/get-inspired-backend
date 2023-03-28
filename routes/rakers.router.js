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
    const {
      surveyId,
      number,
      name,
      start_time,
      end_time,
      start_lat,
      start_long,
      mid_lat,
      mid_long,
      end_lat,
      end_long,
      start_depth,
      end_depth,
      rake_distance,
      rake_width,
    } = req.body;
    console.log(req.body);
    // isNumeric(surveyId);
    // isNumeric(number);
    // isNumeric(startLat);
    // isNumeric(startLong);
    // isNumeric(midLat);
    // isNumeric(midLong);
    // isNumeric(endLat);
    // isNumeric(endLong);
    // isNumeric(startDepth);
    // isNumeric(endDepth);
    // isNumeric(rakeDistance);
    // isNumeric(rakeWidth);
    const [query, params] = toUnnamed(
      `
    INSERT INTO raker (
      survey_id,
      number,
      name,
      start_time,
      end_time,
      start_lat,
      start_long,
      mid_lat,
      mid_long,
      end_lat,
      end_long,
      start_depth,
      end_depth,
      rake_distance,
      rake_width
    )
    VALUES (
      :surveyId,
      :number,
      :name,
      :start_time,
      :end_time,
      :start_lat,
      :start_long,
      :mid_lat,
      :mid_long,
      :end_lat,
      :end_long,
      :start_depth,
      :end_depth,
      :rake_distance,
      :rake_width
    );
    SELECT * FROM raker WHERE id = LAST_INSERT_ID();`,
      {
        surveyId,
        number,
        name,
        start_time,
        end_time,
        start_lat,
        start_long,
        mid_lat,
        mid_long,
        end_lat,
        end_long,
        start_depth,
        end_depth,
        rake_distance,
        rake_width,
      },
    );
    const raker = await pool.query(query, params);
    res.status(200).json(raker);
  } catch (err) {
    res.status(500).send(err.message);
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
       ${columnNames.map((columnName) => `${columnName} = :${columnName}, `).join('')}
      id = :rakerId
    WHERE id = :rakerId;
    SELECT * FROM raker WHERE id = :rakerId;`,
      columnNames.reduce((dict, current) => ({ ...dict, [current]: req.body[current] }), {
        rakerId,
      }),
    );

    const updatedRaker = await pool.query(query, params);
    res.status(200).json(updatedRaker[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
module.exports = router;
