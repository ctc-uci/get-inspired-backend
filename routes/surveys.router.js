const express = require('express');
const toUnnamed = require('named-placeholders')();
const { pool } = require('../server/db');
const { isNumeric } = require('../common/utils');

const router = express.Router();

// get surveys
router.get('/', async (req, res) => {
  try {
    const survey = await pool.query('SELECT * FROM survey;');
    res.status(200).json(survey);
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
    res.status(200).json(survey);
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
    res.status(200).json(surveys);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

const surveyInfoToSummary = ({ formatted_date: formattedDate, beach_id: beachId, location }) => {
  return `${formattedDate} - ${beachId} - ${location}`;
};

// Build the date to survey map
router.get('/existingSurveyOptions', async (req, res) => {
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
    res.status(200).json(map);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// create survey
router.post('/', async (req, res) => {
  try {
    const columnNames = (
      await pool.query(
        `SELECT COLUMN_NAME, DATA_TYPE from information_schema.columns
    WHERE table_schema = "${process.env.AWS_DB_NAME}"
    AND table_name = 'survey' AND COLUMN_NAME != 'id'`,
      )
    ).map((column) => column.COLUMN_NAME);

    const [query, params] = toUnnamed(
      `
      INSERT INTO survey (
       ${columnNames.join()}
        )
      VALUES (
        ${columnNames.map((columnName) => `:${columnName.replace(/\s+/g, '_')}`).join()}
      );
      SELECT * FROM survey WHERE id = LAST_INSERT_ID();`,
      columnNames.reduce(
        (dict, current) => ({ ...dict, [current.replace(/\s+/g, '_')]: req.body[current] }),
        {},
      ),
    );
    const survey = await pool.query(query, params);
    res.status(200).json(survey);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// update survey
// TODO: GET ALL COLUMNS DYNAMICALLY
router.put('/:surveyId', async (req, res) => {
  try {
    const { surveyId } = req.params;

    // Get all column names dynamically
    const columnNames = (
      await pool.query(
        `SELECT COLUMN_NAME, DATA_TYPE from information_schema.columns
    WHERE table_schema = "${process.env.AWS_DB_NAME}"
    AND table_name = 'survey' AND COLUMN_NAME != 'id'`,
      )
    ).map((column) => column.COLUMN_NAME);

    // Update table based on all column names
    const [query, params] = toUnnamed(
      `UPDATE survey
         SET
        ${columnNames
          .map((columnName) => `\`${columnName}\` = :${columnName.replace(/\s+/g, '_')}, `)
          .join('')}
         id = :surveyId
        WHERE id = :surveyId;
      SELECT * FROM survey WHERE id = :surveyId`,
      columnNames.reduce(
        (dict, current) => ({ ...dict, [current.replace(/\s+/g, '_')]: req.body[current] }),
        {
          surveyId,
        },
      ),
    );

    const updatedSurvey = await pool.query(query, params);
    res.status(200).json(updatedSurvey);
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
