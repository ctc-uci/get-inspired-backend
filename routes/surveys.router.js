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
router.get('/survey/:surveyId', async (req, res) => {
  try {
    const { surveyId } = req.params;
    isNumeric(surveyId);
    const [query, params] = toUnnamed('SELECT * FROM survey WHERE id = :surveyId', {
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

const surveyInfoToSummary = ({ formatted_date: formattedDate, beach_id: beachId, location }) => {
  return `${formattedDate} - ${beachId} - ${location}`;
};

// Build the date to survey map
router.get('/manageDataOptions', async (req, res) => {
  try {
    const years = await pool.query(`SELECT DISTINCT YEAR(date) AS year FROM survey`);
    const surveyPromises = years.map((year) =>
      pool.query(
        `SELECT *, DATE_FORMAT(date, '%M %d %Y') as formatted_date FROM survey WHERE YEAR(date) = ${year.year}`,
      ),
    );
    const formattedSurveys = (await Promise.all(surveyPromises)).map((surveys) =>
      surveys.map((value) => ({
        label: surveyInfoToSummary(value),
        value: value.id,
      })),
    );
    const map = years.reduce(
      (acc, year, index) => [
        ...acc,
        {
          label: year.year.toString(),
          value: year.year.toString(),
          children: formattedSurveys[index],
        },
      ],
      [],
    );
    res.status(200).json(keysToCamel(map));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// create survey
router.post('/', async (req, res) => {
  try {
    const {
      beach,
      startTime,
      location,
      method,
      date,
      startDepth,
      endDepth,
      tide,
      duration,
      distance,
      slope,
    } = req.body;

    isNumeric(startDepth);
    isNumeric(endDepth);
    isNumeric(tide);
    isNumeric(duration);
    isNumeric(distance);
    isNumeric(slope);

    const [query, params] = toUnnamed(
      `
      INSERT INTO survey (
        beach,
        start_time,
        location,
        method,
        date,
        start_depth,
        end_depth,
        tide,
        duration,
        distance,
        slope,
        )
      VALUES (
        :beach,
        :startTime,
        :location,
        :method,
        :date,
        :startDepth,
        :endDepth,
        :tide,
        :duration,
        :distance,
        :slope,
      );
      SELECT * FROM survey WHERE id = LAST_INSERT_ID();`,
      {
        beach,
        startTime,
        location,
        method,
        date,
        startDepth,
        endDepth,
        tide,
        duration,
        distance,
        slope,
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
    const { surveyId } = req.params;
    const {
      beach,
      startTime,
      location,
      method,
      date,
      startDepth,
      endDepth,
      tide,
      duration,
      distance,
      slope,
    } = req.body;

    isNumeric(surveyId);
    isNumeric(startDepth);
    isNumeric(endDepth);
    isNumeric(tide);
    isNumeric(duration);
    isNumeric(distance);
    isNumeric(slope);

    const [query, params] = toUnnamed(
      `UPDATE survey
         SET
         ${beach ? 'beach_id = :beachId, ' : ''}
         ${startTime ? 'start_time = :startTime, ' : ''}
         ${location ? 'location = :location, ' : ''}
         ${method ? 'method = :method, ' : ''}
         ${date ? 'date = :date, ' : ''}
         ${startDepth ? 'start_depth = :startDepth, ' : ''}
         ${endDepth ? 'end_depth = :endDepth, ' : ''}
         ${tide ? 'tide = :tide, ' : ''}
         ${duration ? 'duration = :duration, ' : ''}
         ${distance ? 'distance = :distance, ' : ''}
         ${slope ? 'slope = :slope, ' : ''}
         id = :surveyId
        WHERE id = :surveyId;
      SELECT * FROM survey WHERE id = :surveyId`,
      {
        beach,
        startTime,
        location,
        method,
        date,
        startDepth,
        endDepth,
        tide,
        duration,
        distance,
        slope,
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
    const [query, params] = toUnnamed(`DELETE from survey WHERE id = :surveyId;`, {
      surveyId,
    });
    await pool.query(query, params);
    res.status(200).send(`Deleted survey with id ${surveyId}`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
