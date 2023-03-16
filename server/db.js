const mysql = require('mysql');
const util = require('util');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.AWS_HOST,
  user: process.env.AWS_USER,
  password: process.env.AWS_PASSWORD,
  multipleStatements: true,
  database: process.env.AWS_DB_NAME,
});

pool.getConnection((e, connection) => {
  if (e) {
    const codes = {
      PROTOCOL_CONNECTION_LOST: 'Database connection was closed.',
      ER_CON_COUNT_ERROR: 'Database has too many connections.',
      ECONNREFUSED: 'Database connection was refused.',
    };
    // eslint-disable-line
    console.error(codes[e.code]);
  }
  if (connection) {
    // eslint-disable-line
    console.log('Connected to mysql successfully');
  }
});

pool.query = util.promisify(pool.query);

module.exports = { pool };
