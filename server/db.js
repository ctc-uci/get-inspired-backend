const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.REACT_APP_DATABASE_HOST,
  user: process.env.REACT_APP_DATABASE_USER,
  password: process.env.REACT_APP_DATABASE_PASSWORD,
});

connection.connect((e) => {
  if (e) {
    // eslint-disable-line
    console.log('Error connecting to mysql');
  } else {
    // eslint-disable-line
    console.log('Connected to mysql successfully');
  }
});

module.exports = { connection };
