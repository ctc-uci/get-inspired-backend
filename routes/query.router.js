const express = require('express');

// eslint-disable-next-line
const { Utils, CoreConfig } = require('@react-awesome-query-builder/core');
const { pool } = require('../server/db');

const queryRouter = express.Router();

// Generic search - user only passes in 1 string & searches the entire database for matches
// queryRouter.get('/', async (req, res) => {});
const checkedFieldsToSQLSelect = (checkedFields) => {
  let out = '';
  Object.keys(checkedFields).forEach((table) => {
    checkedFields[table].forEach((field) => {
      out += `${pool.escapeId(`${table}.${field}`)} AS "${field} (${table})", `;
    });
  });
  return out.substring(0, out.length - 2);
};

// Advanced search - user passes in a tree object & config object from reat-awesome-query-builder
queryRouter.post('/advanced', async (req, res) => {
  try {
    // get tree, config, and checkedFields from post request
    const { config: configIn, jsonLogic, checkedFields } = req.body;

    // Convert checkedFields to sqlCols
    const querySelect = checkedFieldsToSQLSelect(checkedFields);

    // Convert tree from JSON object to an SQL where clause
    // (NOTE andrew): probably could do some validation on each of the fields, should investigate
    const config = {
      ...configIn,
      conjunctions: CoreConfig.conjunctions,
      settings: CoreConfig.settings,
    };
    const value = Utils.checkTree(Utils.loadFromJsonLogic(jsonLogic, config), config);
    const queryWhere = Utils.sqlFormat(value, config);

    const results = await pool.query(
      `SELECT survey.id AS sid, raker.id AS rid, clam.id AS cid, ${querySelect}
      FROM survey
      LEFT JOIN raker ON survey.id = raker.survey_id
      LEFT JOIN clam ON survey.id = clam.survey_id
      ${queryWhere ? `WHERE ${queryWhere}` : ''};`,
    );
    res.status(200).json(results);
  } catch (err) {
    console.log(err);

    // send 500 on any other errors
    res.status(500).send(err.message);
  }
});

module.exports = queryRouter;
