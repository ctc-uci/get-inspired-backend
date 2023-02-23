const express = require('express');
const toUnnamed = require('named-placeholders')();

// eslint-disable-next-line
const { Utils } = require('@react-awesome-query-builder/antd');
const { pool } = require('../server/db');

const queryRouter = express.Router();

// Generic search - user only passes in 1 string & searches the entire database for matches
// queryRouter.get('/', async (req, res) => {});

// function that converts each of the
const checkedFieldsToSQLSelect = (checkedFields) => {
  let out = '';
  Object.keys(checkedFields).forEach((table) => {
    checkedFields[table].forEach((field) => {
      out += `${table}.${field} AS ${table}_${field}, `;
    });
  });
  return out.substring(0, out.length - 2);
};

// Advanced search - user passes in a tree object & config object from reat-awesome-query-builder
queryRouter.post('/advanced', async (req, res) => {
  try {
    // get tree, config, and checkedFields from post request
    const { config, tree: jsTree, checkedFields } = req.body;

    // Convert checkedFields to sqlCols
    const querySelect = checkedFieldsToSQLSelect(checkedFields);

    // Convert tree from JSON object back into an immutable value
    // and then to an SQL where clause
    const value = Utils.checkTree(Utils.loadTree(jsTree, config), config);
    // console.log('here!');
    const queryWhere = Utils.sqlFormat(value, config);

    // console.log({ querySelect, queryWhere });

    const [query, params] = toUnnamed(
      `
				SELECT survey.id, clam.lat AS clam_lat, clam.lon AS clam_lon
				FROM survey
				LEFT JOIN raker ON survey.id = raker.survey_id
				LEFT JOIN clam ON survey.id = clam.survey_id
        WHERE :queryWhere
			`,
      { querySelect, queryWhere },
    );
    const results = await pool.query(query, params);
    // console.log(results);
    res.status(200).json(results);
  } catch (err) {
    // console.log(err);
    // send 500 on any other errors
    res.status(500).send(err.message);
  }
});

module.exports = queryRouter;
