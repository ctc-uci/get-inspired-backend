const express = require('express');
const toUnnamed = require('named-placeholders')();
const { Utils } = require('@react-awesome-query-builder/core');
const { pool } = require('../server/db');

const queryRouter = express.Router();

// Generic search - user only passes in 1 string & searches the entire database for matches
// queryRouter.get('/', async (req, res) => {});

// Advanced search - user passes in a tree object & config object from reat-awesome-query-builder
queryRouter.post('/advanced', async (req, res) => {
  try {
    // get tree and config from post request
    const { config, tree: jsTree } = req.body;

    // Convert tree from JSON object back into an immutable value
    const value = Utils.checkTree(Utils.loadTree(jsTree, config), config);

    // try to make query to database
    const queryWhere = Utils.sqlFormat(value, config);
    const [query, params] = toUnnamed(
      `
				SELECT raker.id AS raker_id, survey.id AS survey_id, clam.id AS clam_id
				FROM survey
				LEFT JOIN raker ON survey.id = raker.survey_id
				LEFT JOIN clam ON survey.id = clam.survey_id
			`,
      { queryWhere },
    );
    const results = await pool.query(query, params);
    res.status(200).json(results);
  } catch (err) {
    // send 500 on any other errors
    res.status(500).send(err.message);
  }
});

module.exports = queryRouter;
