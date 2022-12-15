const express = require('express');
const { pool } = require('../server/db');
const { keysToCamel } = require('../common/utils');

const router = express.Router();

// Get data for all clams
router.get('/', async (req, res) => {
  try {
    const clams = await pool.query('SELECT * FROM clams;');
    res.status(200).json(keysToCamel(clams));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get data for specific clam based on clamId
router.get('/:clamId', async (req, res) => {
  try {
    const clam = await pool.query('SELECT * FROM clams WHERE clamId = $(clamId);');
    res.status(200).json(keysToCamel(clam.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Get data for clams based on rakerId
router.get('/rakers/:rakerId/clams', async (req, res) => {
  try {
    const clam = await pool.query('SELECT * FROM clams WHERE rakerId = $(rakerId)');
    res.status(200).json(keysToCamel(clam.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Create clam
router.post('/', async (req, res) => {
  try {
    const { clamId, rakerId, lat, long, length, width, weight, comments, image } = req.body;
    const clam = await pool.query(
      `INSERT INTO clams (
      ${clamId ? 'clamId, ' : ''}
      ${rakerId ? 'rakerId, ' : ''}
      ${lat ? 'lat, ' : ''}
      ${long ? 'long, ' : ''}
      ${length ? 'length, ' : ''}
      ${width ? 'width, ' : ''}
      ${weight ? 'weight, ' : ''}
      ${comments ? 'comments, ' : ''}
      ${image ? 'image, ' : ''}
      status
      )
    VALUES (
      ${clamId ? 'clamId, ' : ''}
      ${rakerId ? 'rakerId, ' : ''}
      ${lat ? 'lat, ' : ''}
      ${long ? 'long, ' : ''}
      ${length ? 'length, ' : ''}
      ${width ? 'width, ' : ''}
      ${weight ? 'weight, ' : ''}
      ${comments ? 'comments, ' : ''}
      ${image ? 'image, ' : ''}
      $(status)
    )
    RETURNING *;`,
      {
        clamId,
        rakerId,
        lat,
        long,
        length,
        width,
        weight,
        comments,
        image,
      },
    );
    res.status(200).json(keysToCamel(clam.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Delete clam
router.delete('/:clamId', async (req, res) => {
  try {
    const { clamId } = req.params;
    const deletedClam = await pool.query(
      `DELETE from clams WHERE clamId = $(clamId) RETURNING *;`,
      {
        clamId,
      },
    );
    res.status(200).json(keysToCamel(deletedClam.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Update clam
router.put('/', async (req, res) => {
  try {
    const { clamId } = req.params;
    const { rakerId, lat, long, length, width, weight, comments, image } = req.body;
    const updatedClam = await pool.query(
      `UPDATE clam
         SET
         ${clamId ? 'clamId, ' : ''}
         ${rakerId ? 'rakerId, ' : ''}
         ${lat ? 'lat, ' : ''}
         ${long ? 'long, ' : ''}
         ${length ? 'length, ' : ''}
         ${width ? 'width, ' : ''}
         ${weight ? 'weight, ' : ''}
         ${comments ? 'comments, ' : ''}
         ${image ? 'image, ' : ''}
        WHERE clamId = $(clamId)
        RETURNING *`,
      {
        rakerId,
        lat,
        long,
        length,
        width,
        weight,
        comments,
        image,
      },
    );
    res.status(200).json(keysToCamel(updatedClam.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});
module.exports = router;
