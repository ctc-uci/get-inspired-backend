const express = require('express');
const toUnnamed = require('named-placeholders')();
const { pool } = require('../server/db');
const { isNumeric, keysToCamel } = require('../common/utils');

const router = express.Router();

// get surveys
router.get('/', async (req, res) => {
  try {
    const survey = await pool.query('SELECT * FROM survey;');
    res.status(200).json(keysToCamel(survey));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// get survey based on survey id
router.get('/:surveyId', async (req, res) => {
  try {
    const { surveyId } = req.params;
    isNumeric(surveyId);
    const [query, params] = toUnnamed('SELECT * FROM survey WHERE survey_id = :surveyId', {
      surveyId,
    });
    const survey = await pool.query(query, params);
    res.status(200).json(keysToCamel(survey));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// get surveys based on beach id
router.get('/beach/:beachId', async (req, res) => {
  try {
    const { beachId } = req.params;
    isNumeric(beachId);
    const [query, params] = toUnnamed('SELECT * FROM survey WHERE beach_id = :beachId', {
      beachId,
    });
    const surveys = await pool.query(query, params);
    res.status(200).json(keysToCamel(surveys));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// create survey
router.post('/', async (req, res) => {
  try {
    const { surveyId, beachId, lot, date, location, method, tide } = req.body;
    isNumeric(surveyId);
    isNumeric(beachId);
    isNumeric(lot);
    isNumeric(tide);
    const [query, params] = toUnnamed(
      `
      INSERT INTO survey (
        survey_id,
        beach_id,
        lot,
        date,
        location,
        method,
        tide
        )
      VALUES (
        :surveyId,
        :beachId,
        :lot,
        :date,
        :location,
        :method,
        :tide
      );
      SELECT * FROM survey WHERE survey_id = :surveyId`,
      {
        surveyId,
        beachId,
        lot,
        date,
        location,
        method,
        tide,
      },
    );
    const survey = await pool.query(query, params);
    res.status(200).json(keysToCamel(survey));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// update survey
router.put('/:surveyId', async (req, res) => {
  try {
    const { surveyId, beachId, lot, date, location, method, tide } = req.body;
    const [query, params] = toUnnamed(
      `UPDATE survey
         SET
         ${beachId ? 'beach_id = :beachId, ' : ''}
         ${lot ? 'lot = :lot, ' : ''}
         ${date ? 'date = :date, ' : ''}
         ${location ? 'location = :location, ' : ''}
         ${method ? 'method = :method, ' : ''}
         ${tide ? 'tide = :tide, ' : ''}
         survey_id = :surveyId
        WHERE survey_id = :surveyId;
      SELECT * FROM survey WHERE survey_id = :surveyId`,
      {
        surveyId,
        beachId,
        lot,
        date,
        location,
        method,
        tide,
      },
    );
    const updatedSurvey = await pool.query(query, params);
    res.status(200).json(keysToCamel(updatedSurvey));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// delete survey
router.delete('/:surveyId', async (req, res) => {
  try {
    const { surveyId } = req.params;
    const [query, params] = toUnnamed(`DELETE from survey WHERE survey_id = :surveyId;`, {
      surveyId,
    });
    await pool.query(query, params);
    res.status(200).send(`Deleted survey with id ${surveyId}`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
