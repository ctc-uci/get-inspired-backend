const express = require('express');
// const toUnnamed = require('named-placeholders')();

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
      out += `${pool.escapeId(`${table}.${field}`)}, `;
    });
  });
  return out.substring(0, out.length - 2);
};

// Advanced search - user passes in a tree object & config object from reat-awesome-query-builder
queryRouter.post('/advanced', async (req, res) => {
  try {
    // get tree, config, and checkedFields from post request
    const { config: configIn, tree: jsTree, checkedFields } = req.body;

    const config = { ...configIn, settings: CoreConfig.settings };

    // Convert checkedFields to sqlCols
    const querySelect = checkedFieldsToSQLSelect(checkedFields);

    // Convert tree from JSON object to an SQL where clause
    // (NOTE andrew): loading from json logic tree currently broken: investigate
    const value = Utils.checkTree(Utils.loadFromJsonLogic(jsTree, configIn), configIn);
    const queryWhere = Utils.sqlFormat(value, config);

    // console.log({ querySelect, queryWhere });

    const results = await pool.query(
      `SELECT ${querySelect}
      FROM survey
      LEFT JOIN raker ON survey.id = raker.survey_id
      LEFT JOIN clam ON survey.id = clam.survey_id
      ${queryWhere ? `WHERE ${queryWhere}` : ''};`,
    );
    res.status(200).json(results);
  } catch (err) {
    // console.log(err);

    // send 500 on any other errors
    res.status(500).send(err.message);
  }
});

module.exports = queryRouter;
