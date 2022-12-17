const express = require('express');
const { db } = require('../server/db');
const { keysToCamel } = require('../common/utils');

const router = express.Router();
module.exports = router;
// get surveys
router.get('/', async (req, res) => {
  try {
    const survey = await db.query('SELECT * FROM survey;');
    res.status(200).json(survey.rows);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// get survey id based on survey id
router.get('/:surveyid', async (req, res) => {
  try {
    const survey = await db.query('SELECT * FROM survey WHERE survey_id = $(surveyid);');
    res.status(200).json(survey.rows);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// get survey based on beach id
router.get('/beach/:beachid/survey', async (req, res) => {
  try {
    const survey = await db.query('SELECT * FROM survey WHERE beachid = $(beachid)');
    res.status(200).json(keysToCamel(survey.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// create survey
router.post('/', async (req, res) => {
  try {
    const { surveyId, beachId, lot, surveyDate, surveyLocation, method, tide } = req.body;
    const survey = await db.query(
      `INSERT INTO survey (
      ${surveyId ? 'survey_id, ' : ''}
      ${beachId ? 'beach_id, ' : ''}
      ${lot ? 'lot, ' : ''}
      ${surveyDate ? 'survey_date, ' : ''}
      ${surveyLocation ? 'survey_location, ' : ''}
      ${method ? 'method, ' : ''}
      ${tide ? 'tide, ' : ''}
      status
      )
    VALUES (
      ${surveyId ? 'survey_id, ' : ''}
      ${beachId ? 'beach_id, ' : ''}
      ${lot ? 'lot, ' : ''}
      ${surveyDate ? 'survey_date, ' : ''}
      ${surveyLocation ? 'survey_location, ' : ''}
      ${method ? 'method, ' : ''}
      ${tide ? 'tide, ' : ''}
      $(status)
    )
    RETURNING *;`,
      {
        surveyId,
        beachId,
        lot,
        surveyDate,
        surveyLocation,
        method,
        tide,
      },
    );
    res.status(200).json(survey.rows);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// delete survey
router.delete('/surveys/:surveyid', async (req, res) => {
  try {
    const { surveyid } = req.params;
    const deletedSurvey = await db.query(
      `DELETE from survey WHERE survey_id = $(surveyid) RETURNING *;`,
      { surveyid },
    );
    res.status(200).json(deletedSurvey.rows);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// update survey
router.put('/surveys/:surveyid', async (req, res) => {
  try {
    const { surveyId, beachId, lot, surveyDate, surveyLocation, method, tide } = req.body;
    const updatedSurveyTable = await db.query(
      `UPDATE survey
         SET
         ${surveyId ? 'survey_id, ' : ''}
         ${beachId ? 'beach_id, ' : ''}
         ${lot ? 'lot, ' : ''}
         ${surveyDate ? 'survey_date, ' : ''}
         ${surveyLocation ? 'survey_location, ' : ''}
         ${method ? 'method, ' : ''}
         ${tide ? 'tide, ' : ''}
        WHERE survey_id = $(surveyid)
        RETURNING *`,
      {
        surveyId,
        beachId,
        lot,
        surveyDate,
        surveyLocation,
        method,
        tide,
      },
    );
    res.status(200).json(updatedSurveyTable.rows);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
