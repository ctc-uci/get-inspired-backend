const express = require('express');

// eslint-disable-next-line
const { Utils, CoreConfig } = require('@react-awesome-query-builder/core');
const { pool } = require('../server/db');
// const toUnnamed = require('named-placeholders')();

const queryRouter = express.Router();

const TABLE_NAMES = ['survey', 'raker', 'clam', 'computation'];

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
const checkedFieldsToSQLJoin = (checkedFields, whereClause) => {
  const tableNames = Array.isArray(checkedFields)
    ? checkedFields // Generic search
    : Object.keys(checkedFields)
        .filter((field) => TABLE_NAMES.includes(field))
        .concat(
          TABLE_NAMES.filter((table) => !(table in checkedFields) && whereClause.includes(table)),
        ); // Advanced search
  const res = tableNames.reduce((acc, curr, index) => {
    if (index === 0) return curr;
    const prev = tableNames.at(index - 1);
    const isCurrSurveyTable = curr === 'survey';
    const isPrevSurveyTable = prev === 'survey';
    const prevAttribute = isPrevSurveyTable ? 'id' : 'survey_id';
    const currAttribute = isCurrSurveyTable ? 'id' : 'survey_id';
    return `${acc} LEFT JOIN ${curr} ON ${prev}.${prevAttribute} = ${curr}.${currAttribute}`;
  }, '');
  return res;
};

// Generic search - user only passes in 1 string & searches the entire database for matches
queryRouter.post('/generic', async (req, res) => {
  try {
    // get tree, config, and checkedFields from post request
    const { checkedTables, query: queryStr } = req.body;

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

    // Convert tree from JSON object to an SQL where clause
    // (NOTE andrew): probably could do some validation on each of the fields, should investigate
    const config = {
      ...configIn,
      conjunctions: CoreConfig.conjunctions,
      settings: CoreConfig.settings,
    };
    const value = Utils.checkTree(Utils.loadFromJsonLogic(jsonLogic, config), config);
    const queryWhere = Utils.sqlFormat(value, config);

    const queryJoin = checkedFieldsToSQLJoin(checkedFields, queryWhere);

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
