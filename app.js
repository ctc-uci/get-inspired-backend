const express = require('express');
const cors = require('cors');

require('dotenv').config();

const clams = require('./routes/clams');

const app = express();

const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
  }),
);

app.use('/clams', clams);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
