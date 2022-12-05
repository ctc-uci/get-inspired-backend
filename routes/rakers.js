const express = require('express');
const { pool } = require('../server/db');
const { keysToCamel } = require('../common/utils');

const router = express.Router();

// get rakers
router.get('/', async (req, res) => {
  try {
    const rakers = await pool.query('SELECT * FROM raker;');
    res.status(200).json(keysToCamel(rakers));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// get rakerId
router.get('/:rakerId', async (req, res) => {
  try {
    const raker = await pool.query('SELECT * FROM raker WHERE rakerId = $(rakerId);');
    res.status(200).json(keysToCamel(raker.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// get rakers from surveyid
router.get('/survey/:surveyid/rakers', async (req, res) => {
  try {
    const raker = await pool.query('SELECT * FROM raker WHERE surveyId = $(surveyid)');
    res.status(200).json(keysToCamel(raker.rows));
  } catch (err) {
    res.status(400).send(err.message);
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
    const raker = await pool.query(
      `INSERT INTO survey (
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
      status
      )
    VALUES (
      ${rakerId ? '$(rakerId), ' : ''}
      ${surveyId ? '$(surveyId), ' : ''}
      ${rakerName ? '$(rakerName), ' : ''}
      ${startLat ? '$(startLat), ' : ''}
      ${startLong ? '$(startLong), ' : ''}
      ${startTime ? '$(startTime), ' : ''}
      ${endTime ? '$(endTime), ' : ''}
      ${endLat ? '$(endLat), ' : ''}
      ${endDepth ? '$(endDepth), ' : ''}
      ${startSlope ? '$(startSlope), ' : ''}
      ${endSlope ? '$(endSlope), ' : ''}
      ${startSlope ? '$(startSlope), ' : ''}
      ${endSlope ? '$(endSlope), ' : ''}
      ${rakeArea ? '$(rake_are), ' : ''}
      $(status)
    )
    RETURNING *;`,
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
    res.status(200).json(keysToCamel(raker.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// delete raker
router.delete('/rakers/:rakerId', async (req, res) => {
  try {
    const { rakerId } = req.params;
    const raker = await pool.query(`DELETE from raker WHERE rakerId = $(rakerId) RETURNING *;`, {
      rakerId,
    });
    res.status(200).json(keysToCamel(raker.rows));
  } catch (err) {
    res.status(400).send(err.message);
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
    const updatedRaker = await pool.query(
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
    res.status(200).json(keysToCamel(updatedRaker.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});
module.exports = router;
