const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.AWS_HOST,
  user: process.env.AWS_USER,
  password: process.env.AWS_PASSWORD,
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
