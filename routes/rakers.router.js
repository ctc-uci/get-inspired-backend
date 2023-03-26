const express = require('express');
const toUnnamed = require('named-placeholders')();
const { pool } = require('../server/db');
const { keysToCamel, isNumeric } = require('../common/utils');

const router = express.Router();

// get rakers
router.get('/', async (req, res) => {
  try {
    const rakers = await pool.query('SELECT * FROM raker;');
    res.status(200).json(keysToCamel(rakers));
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
    res.status(200).json(keysToCamel(raker[0]));
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
    res.status(200).json(keysToCamel(rakers));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// create raker
router.post('/', async (req, res) => {
  try {
    const {
      surveyId,
      number,
      name,
      startTime,
      endTime,
      startLat,
      startLong,
      midLat,
      midLong,
      endLat,
      endLong,
      startDepth,
      endDepth,
      rakeDistance,
      rakeWidth,
    } = req.body;
    isNumeric(surveyId);
    isNumeric(number);
    isNumeric(startLat);
    isNumeric(startLong);
    isNumeric(midLat);
    isNumeric(midLong);
    isNumeric(endLat);
    isNumeric(endLong);
    isNumeric(startDepth);
    isNumeric(endDepth);
    isNumeric(rakeDistance);
    isNumeric(rakeWidth);
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
      rake_width,
    )
    VALUES (
      :surveyId,
      :number,
      :name,
      :startTime,
      :endTime,
      :startLat,
      :startLong,
      :midLat,
      :midLong,
      :endLat,
      :endLong,
      :startDepth,
      :endDepth,
      :rakeDistance,
      :rakeWidth,
    );
    SELECT * FROM raker WHERE id = LAST_INSERT_ID();`,
      {
        surveyId,
        number,
        name,
        startTime,
        endTime,
        startLat,
        startLong,
        midLat,
        midLong,
        endLat,
        endLong,
        startDepth,
        endDepth,
        rakeDistance,
        rakeWidth,
      },
    );
    const raker = await pool.query(query, params);
    res.status(200).json(keysToCamel(raker));
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
    res.status(200).json(keysToCamel(raker[0]));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// update raker
router.put('/:rakerId', async (req, res) => {
  try {
    const { rakerId } = req.params;
    // TODO: UPDATE ALL COLUMNS DYNAMICALLY
    const {
      surveyId,
      number,
      name,
      startTime,
      endTime,
      startLat,
      startLong,
      midLat,
      midLong,
      endLat,
      endLong,
      startDepth,
      endDepth,
      rakeDistance,
      rakeWidth,
    } = req.body;
    const [query, params] = toUnnamed(
      `UPDATE raker
      SET
      ${surveyId !== undefined ? 'survey_id = :surveyId, ' : ''}
      ${number !== undefined ? 'number = :number, ' : ''}
      ${name !== undefined ? 'name = :name, ' : ''}
      ${startTime !== undefined ? 'start_time = :startTime, ' : ''}
      ${endTime !== undefined ? 'end_time = :endTime, ' : ''}
      ${startLat !== undefined ? 'start_lat = :startLat, ' : ''}
      ${startLong !== undefined ? 'start_long =:startLong , ' : ''}
      ${midLat !== undefined ? 'mid_lat = :midLat, ' : ''}
      ${midLong !== undefined ? 'mid_long =:midLong , ' : ''}
      ${endLat !== undefined ? 'end_lat = :endLat, ' : ''}
      ${endLong !== undefined ? 'end_long = :endLong, ' : ''}
      ${startDepth !== undefined ? 'start_depth = :startDepth, ' : ''}
      ${endDepth !== undefined ? 'end_depth = :endDepth, ' : ''}
      ${rakeDistance !== undefined ? 'rake_distance = :rakeDistance, ' : ''}
      ${rakeWidth !== undefined ? 'rake_width = :rakeWidth, ' : ''}
      id = :rakerId
    WHERE id = :rakerId;
    SELECT * FROM raker WHERE id = :rakerId;`,
      {
        surveyId,
        number,
        name,
        startTime,
        endTime,
        startLat,
        startLong,
        midLat,
        midLong,
        endLat,
        endLong,
        startDepth,
        endDepth,
        rakeDistance,
        rakeWidth,
        rakerId,
      },
    );
    const updatedRaker = await pool.query(query, params);
    res.status(200).json(keysToCamel(updatedRaker[0]));
  } catch (err) {
    res.status(500).send(err.message);
  }
});
module.exports = router;
