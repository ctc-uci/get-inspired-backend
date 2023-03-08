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
    const raker = await pool.query(query, params);
    res.status(200).json(keysToCamel(raker[0]));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// create raker
router.post('/', async (req, res) => {
  try {
    const {
      surveyId,
      name,
      startLat,
      startLong,
      midLat,
      midLong,
      startTime,
      endTime,
      endLat,
      endLong,
      startDepth,
      endDepth,
      startSlope,
      endSlope,
      distance,
      width,
      rakeArea,
    } = req.body;
    isNumeric(surveyId);
    isNumeric(startLat);
    isNumeric(startLong);
    isNumeric(midLat);
    isNumeric(midLong);
    isNumeric(endLat);
    isNumeric(endLong);
    isNumeric(startDepth);
    isNumeric(endDepth);
    isNumeric(startSlope);
    isNumeric(endSlope);
    isNumeric(distance);
    isNumeric(width);
    isNumeric(rakeArea);
    const [query, params] = toUnnamed(
      `
    INSERT INTO raker (
      survey_id,
      name,
      start_lat,
      start_long,
      mid_lat,
      mid_long,
      start_time,
      end_time,
      end_lat,
      end_long,
      start_depth,
      end_depth,
      start_slope,
      end_slope,
      distance,
      width,
      rake_area
    )
    VALUES (
      :surveyId,
      :name,
      :startLat,
      :startLong,
      :midLat,
      :midLong,
      :startTime,
      :endTime,
      :endLat,
      :endDepth,
      :startSlope,
      :endSlope,
      :startSlope,
      :endSlope,
      :distance,
      :width,
      :rakeArea
    );
    SELECT * FROM raker WHERE id = LAST_INSERT_ID();`,
      {
        surveyId,
        name,
        startLat,
        startLong,
        midLat,
        midLong,
        startTime,
        endTime,
        endLat,
        endDepth,
        startSlope,
        endSlope,
        distance,
        width,
        rakeArea,
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
    const {
      surveyId,
      name,
      startLat,
      startLong,
      midLat,
      midLong,
      startTime,
      endTime,
      endLat,
      endLong,
      startDepth,
      endDepth,
      startSlope,
      endSlope,
      distance,
      width,
      rakeArea,
    } = req.body;
    const [query, params] = toUnnamed(
      `UPDATE raker
      SET
      ${surveyId ? 'survey_id = :surveyId, ' : ''}
      ${name ? 'name = :name, ' : ''}
      ${startLat ? 'start_lat = :startLat, ' : ''}
      ${startLong ? 'start_long =:startLong , ' : ''}
      ${midLat ? 'mid_lat = :midLat, ' : ''}
      ${midLong ? 'mid_long =:midLong , ' : ''}
      ${startTime ? 'start_time = :startTime, ' : ''}
      ${endTime ? 'end_time = :endTime, ' : ''}
      ${endLat ? 'end_lat = :endLat, ' : ''}
      ${endLong ? 'end_long = :endLong, ' : ''}
      ${startDepth ? 'start_depth = :startDepth, ' : ''}
      ${endDepth ? 'end_depth = :endDepth, ' : ''}
      ${startSlope ? 'start_slope = :startSlope, ' : ''}
      ${endSlope ? 'end_slope = :endSlope, ' : ''}
      ${distance ? 'distance = :distance, ' : ''}
      ${width ? 'width = :width, ' : ''}
      ${rakeArea ? 'rake_area = :rakeArea, ' : ''}
      id = :rakerId
    WHERE id = :rakerId;
    SELECT * FROM raker WHERE id = :rakerId;`,
      {
        rakerId,
        surveyId,
        name,
        startLat,
        startLong,
        midLat,
        midLong,
        startTime,
        endTime,
        endLat,
        endLong,
        startDepth,
        endDepth,
        startSlope,
        endSlope,
        distance,
        width,
        rakeArea,
      },
    );
    const updatedRaker = await pool.query(query, params);
    res.status(200).json(keysToCamel(updatedRaker[0]));
  } catch (err) {
    res.status(500).send(err.message);
  }
});
module.exports = router;
