const express = require('express');

// eslint-disable-next-line
const { Utils, CoreConfig } = require('@react-awesome-query-builder/core');
const { pool } = require('../server/db');
// const toUnnamed = require('named-placeholders')();

const queryRouter = express.Router();

const TABLE_NAMES = ['survey', 'raker', 'clam'];

// Advanced Search: given a series of checkedFields, generate the associated SELECT clause
const checkedFieldsToSQLSelect = (checkedFields) => {
  let out = '';
  Object.keys(checkedFields).forEach((table) => {
    checkedFields[table].forEach((field) => {
      out += `${pool.escapeId(`${table}.${field}`)} AS "${field} (${table})", `;
    });
  });
  return out.substring(0, out.length - 2);
};

// Advanced Search: from a series of checked fields, generate the necesary joins
const checkedFieldsToSQLJoin = (checkedFields) => {
  const isArray = Array.isArray(checkedFields);
  const surveySelected = (isArray && checkedFields.includes('survey')) || 'survey' in checkedFields;
  const rakerSelected = (isArray && checkedFields.includes('raker')) || 'raker' in checkedFields;
  const clamSelected = (isArray && checkedFields.includes('clam')) || 'clam' in checkedFields;

  let res = '';
  // All 3 tables selected
  if (surveySelected && rakerSelected && clamSelected) {
    res = `survey
      LEFT JOIN raker ON survey.id = raker.survey_id
      LEFT JOIN clam ON survey.id = clam.survey_id`;
    // Survey and raker selected
  } else if (surveySelected && rakerSelected) {
    res = `survey LEFT JOIN raker ON survey.id = raker.survey_id`;
    // Survey and clam selected
  } else if (surveySelected && clamSelected) {
    res = `survey LEFT JOIN clam ON survey.id = clam.survey_id`;
    // Raker and clam selected
  } else if (rakerSelected && clamSelected) {
    res = 'clam LEFT JOIN raker ON clam.survey_id = raker.survey_id';
    // Survey selected
  } else if (surveySelected) {
    res = 'survey';
    // Clam selected
  } else if (clamSelected) {
    res = 'clam';
    // Raker selected
  } else if (rakerSelected) {
    res = 'raker';
    // Should never happen
  } else {
    res = 'survey';
  }
  return res;
};

// Generic search - user only passes in 1 string & searches the entire database for matches
queryRouter.post('/generic', async (req, res) => {
  try {
    // get tree, config, and checkedFields from post request
    const { checkedTables, query: queryStr } = req.body;

    // validate checkedTables
    // if (!queryStr) {
    //   res.status(400).send('Must send a query');
    //   return;
    // }
    if (checkedTables.some((table) => !TABLE_NAMES.includes(table))) {
      res.status(400).send('Invalid table name');
      return;
    }

    // get lowercase query and join
    const query = queryStr.toLowerCase();
    const queryJoin = checkedFieldsToSQLJoin(checkedTables);

    // get all rows, then call filter
    // note: highly inefficient! replace!
    const rawResults = await pool.query(`SELECT * FROM ${queryJoin}`);
    const results = rawResults.filter((entry) =>
      Object.values(entry).some((val) => `${val}`.toLowerCase().includes(query)),
    );
    res.status(200).json(results);
  } catch (err) {
    // send 500 on any other errors
    res.status(500).send(err.message);
  }
});

// Advanced search - user passes in a tree object & config object from reat-awesome-query-builder
queryRouter.post('/advanced', async (req, res) => {
  try {
    // get tree, config, and checkedFields from post request
    const { config: configIn, jsonLogic, checkedFields } = req.body;

    // Convert checkedFields to sqlCols
    const querySelect = checkedFieldsToSQLSelect(checkedFields);

    const queryJoin = checkedFieldsToSQLJoin(checkedFields);

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
      `SELECT DISTINCT ${querySelect}
      FROM ${queryJoin}
      ${queryWhere ? `WHERE ${queryWhere}` : ''};`,
    );
    res.status(200).json(results);
  } catch (err) {
    // send 500 on any other errors
    res.status(500).send(err.message);
  }
});

module.exports = queryRouter;
