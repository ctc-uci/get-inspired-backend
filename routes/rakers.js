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
router.get('/:rakerId', async (req, res) => {
  try {
    const { rakerId } = req.params;
    isNumeric(rakerId);
    const [query, params] = toUnnamed('SELECT * FROM raker WHERE rakerId = $(rakerId);');
    const raker = await pool.query(query, params);
    res.status(200).json(keysToCamel(raker.rows));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// get rakers from surveyid
router.get('/survey/:surveyid/rakers', async (req, res) => {
  try {
    const { raker } = req.params;
    isNumeric(raker);
    const [query, params] = toUnnamed('SELECT * FROM raker WHERE surveyId = $(surveyid)');
    await pool.query(query, params);
    res.status(200).json(keysToCamel(raker.rows));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// create raker
router.post('/', async (req, res) => {
  try {
    const {
      rakerId,
      surveyId,
      rakerName,
      startLat,
      startLong,
      startTime,
      endTime,
      endLat,
      endLong,
      startDepth,
      endDepth,
      startSlope,
      endSlope,
      rakeArea,
    } = req.body;
    isNumeric(rakerId);
    isNumeric(surveyId);
    isNumeric(startLat);
    isNumeric(startLong);
    isNumeric(endLat);
    isNumeric(endLong);
    isNumeric(startDepth);
    isNumeric(endDepth);
    isNumeric(startSlope);
    isNumeric(endSlope);
    isNumeric(rakeArea);
    const [query, params] = toUnnamed(
      `
    INSERT INTO survey (
      raker_id,
      surveyId,
      rakerName,
      startLat,
      startLong,
      startTime,
      endTime,
      endLat,
      endLong,
      startDepth,
      endDepth,
      startSlope,
      endSlope,
      rakeArea
    )
    VALUES (
      :rakerId,
      :surveyId,
      :rakerName,
      :startLat,
      :startLong,
      :startTime,
      :endTime,
      :endLat,
      :endDepth,
      :startSlope,
      :endSlope,
      :startSlope,
      :endSlope,
      :rakeArea
    );
    SELECT * FROM rakers WHERE raker_id:rakerId`,
      {
        rakerId,
        surveyId,
        rakerName,
        startLat,
        startLong,
        startTime,
        endTime,
        endLat,
        endDepth,
        startSlope,
        endSlope,
        rakeArea,
      },
    );
    const raker = await pool.query(query, params);
    res.status(200).json(keysToCamel(raker));
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

// delete raker
router.delete('/rakers/:rakerId', async (req, res) => {
  try {
    const { rakerId } = req.params;
    isNumeric(rakerId);
    const [query, params] = toUnnamed(`DELETE from raker WHERE rakerId = $(rakerId) RETURNING *;`, {
      rakerId,
    });
    const raker = await pool.query(query, params);
    res.status(200).json(keysToCamel(raker.rows));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// update raker
router.put('/rakers/:rakerId', async (req, res) => {
  try {
    const { rakerId } = req.params;
    const {
      surveyId,
      rakerName,
      startLat,
      startLong,
      startTime,
      endTime,
      endLat,
      endLong,
      startDepth,
      endDepth,
      startSlope,
      endSlope,
      rakeArea,
    } = req.body;
    const [query, params] = toUnnamed(
      `UPDATE raker 
      SET
      ${rakerId ? 'rakerId, ' : ''}
      ${surveyId ? 'surveyId, ' : ''}
      ${rakerName ? 'rakerName, ' : ''}
      ${startLat ? 'startLat, ' : ''}
      ${startLong ? 'startLong, ' : ''}
      ${startTime ? 'startTime, ' : ''}
      ${endTime ? 'endTime, ' : ''}
      ${endLat ? 'endLat, ' : ''}
      ${endLong ? 'endLong, ' : ''}
      ${startDepth ? 'startDepth, ' : ''}
      ${endDepth ? 'endDepth, ' : ''}
      ${startSlope ? 'start_slop, ' : ''}
      ${endSlope ? 'endSlope, ' : ''}
      ${rakeArea ? 'rakeArea, ' : ''}
    WHERE rakerId = $(rakerId)
    RETURNING *`,
      {
        rakerId,
        surveyId,
        rakerName,
        startLat,
        startLong,
        startTime,
        endTime,
        endLat,
        endLong,
        startDepth,
        endDepth,
        startSlope,
        endSlope,
        rakeArea,
      },
    );
    const updatedRaker = await pool.query(query, params);
    res.status(200).json(keysToCamel(updatedRaker.rows));
  } catch (err) {
    res.status(500).send(err.message);
  }
});
module.exports = router;
