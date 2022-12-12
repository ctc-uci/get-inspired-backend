const express = require('express');
const { pool } = require('../server/db');
const { keysToCamel } = require('../common/utils');

const router = express.Router();

// get clams
router.get('/', async (req, res) => {
  try {
    const clams = await pool.query('SELECT * FROM clams;');
    res.status(200).json(keysToCamel(clams));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// get clamid
router.get('/:clamId', async (req, res) => {
  try {
    const clam = await pool.query('SELECT * FROM clams WHERE clamId = $(clamId);');
    res.status(200).json(keysToCamel(clams.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// get clams from rakerid
router.get('/rakers/:rakerid/clams', async (req, res) => {
  try {
    const clam = await pool.query('SELECT * FROM clams WHERE rakerid = $(rakerid)');
    res.status(200).json(keysToCamel(clams.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// create clam
router.post('/', async (req, res) => {
  try {
    const {
      clamId,
      rakerId,
      lat,
      long,
      length,
      width,
      weight,
      comments,
      image,
    } = req.body;
    const clam = await pool.query(
      `INSERT INTO survey (
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
    res.status(200).json(keysToCamel(clams.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// delete clam
router.delete('/clams/:clamid', async (req, res) => {
  try {
    const { clamId } = req.params;
    const raker = await pool.query(`DELETE from clams WHERE clamId = $(clamId) RETURNING *;`, {
      clamId,
    });
    res.status(200).json(keysToCamel(clams.rows));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// update clam
router.put('/clams', async (req, res) => {
  try {
    const { clamId } = req.params;
    const {
        rakerId,
        lat,
        long,
        length,
        width,
        weight,
        comments,
        image,
    } = req.body;
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
