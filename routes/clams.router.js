const express = require('express');
const toUnnamed = require('named-placeholders')();
const { pool } = require('../server/db');
const { keysToCamel, isNumeric } = require('../common/utils');

const router = express.Router();

// Get data for all clams
router.get('/', async (req, res) => {
  try {
    const clams = await pool.query('SELECT * FROM clam;');
    res.status(200).json(keysToCamel(clams));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get data for specific clam based on clamId
router.get('/:clamId', async (req, res) => {
  try {
    const { clamId } = req.params;
    isNumeric(clamId);

    const [query, params] = toUnnamed('SELECT * FROM clam WHERE id = :clamId', { clamId });
    const clam = await pool.query(query, params);

    res.status(200).json(keysToCamel(clam));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get data for clams based on rakerId
router.get('/raker/:rakerId', async (req, res) => {
  try {
    const { rakerId } = req.params;
    isNumeric(rakerId);

    const [query, params] = toUnnamed('SELECT * FROM clam WHERE raker_id = :rakerId', { rakerId });
    const clams = await pool.query(query, params);

    res.status(200).json(keysToCamel(clams));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get data for clams based on surveyId
router.get('/survey/:surveyId', async (req, res) => {
  try {
    const { surveyId } = req.params;

    const [query, params] = toUnnamed('SELECT * FROM clam WHERE survey_id = :surveyId', {
      surveyId,
    });
    const clams = await pool.query(query, params);
    res.status(200).json(keysToCamel(clams));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Create clam
router.post('/', async (req, res) => {
  try {
    const { surveyId, name, color, lat, lon, length, width, weight, comments, image } = req.body;

    isNumeric(surveyId);
    isNumeric(lat);
    isNumeric(lon);
    isNumeric(length);
    isNumeric(width);
    isNumeric(weight);

    const [query, params] = toUnnamed(
      `
      INSERT INTO clam (
        survey_id,
        name,
        color,
        lat,
        lon,
        length,
        width,
        weight,
        comments,
        image
        )
      VALUES (
        :surveyId,
        :name,
        :color,
        :lat,
        :lon,
        :length,
        :width,
        :weight,
        :comments,
        :image
      );
      SELECT * FROM clam WHERE id = LAST_INSERT_ID();`,
      {
        surveyId,
        name,
        color,
        lat,
        lon,
        length,
        width,
        weight,
        comments,
        image,
      },
    );

    const clam = await pool.query(query, params);

    res.status(200).json(keysToCamel(clam[1]));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update clam
router.put('/:clamId', async (req, res) => {
  try {
    // TODO: UPDATE ALL COLUMNS DYNAMICALLY
    const { clamId } = req.params;
    isNumeric(clamId);

    const { surveyId, name, color, lat, lon, length, width, weight, comments, image } = req.body;

    isNumeric(surveyId);
    isNumeric(lat);
    isNumeric(lon);
    isNumeric(length);
    isNumeric(width);
    isNumeric(weight);

    const [query, params] = toUnnamed(
      `UPDATE clam
         SET
         ${surveyId !== undefined ? 'survey_id = :surveyId, ' : ''}
         ${name !== undefined ? 'name = :name, ' : ''}
         ${color !== undefined ? 'color = :color, ' : ''}
         ${lat !== undefined ? 'lat = :lat, ' : ''}
         ${lon !== undefined ? 'lon = :lon, ' : ''}
         ${length !== undefined ? 'length = :length, ' : ''}
         ${width !== undefined ? 'width = :width, ' : ''}
         ${weight !== undefined ? 'weight = :weight, ' : ''}
         ${comments !== undefined ? 'comments = :comments, ' : ''}
         ${image !== undefined ? 'image = :image, ' : ''}
         id = :clamId
         WHERE id = :clamId;
      SELECT * FROM clam WHERE id = :clamId;`,
      {
        clamId,
        surveyId,
        name,
        color,
        lat,
        lon,
        length,
        width,
        weight,
        comments,
        image,
      },
    );

    const updatedClam = await pool.query(query, params);

    res.status(200).json(keysToCamel(updatedClam[1]));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete clam
router.delete('/:clamId', async (req, res) => {
  try {
    const { clamId } = req.params;
    isNumeric(clamId);

    const [query, params] = toUnnamed('DELETE FROM clam WHERE id = :clamId', { clamId });
    await pool.query(query, params);

    res.status(200).json(keysToCamel(`Deleted clam #${clamId}`));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
