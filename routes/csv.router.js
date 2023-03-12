const express = require('express');
// eslint-disable-next-line import/no-unresolved
const { parse } = require('csv-parse/sync');

const router = express.Router();

router.post('/upload', async (req, res) => {
  const { data } = req.body;
  const records = await parse(data, { columns: true });
  res.status(200).send(records);
});

module.exports = router;
