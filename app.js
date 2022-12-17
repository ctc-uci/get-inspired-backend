const express = require('express');
const cors = require('cors');
const surveyRouter = require('./routes/survey.router');

require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
  }),
);

app.use('/surveys', surveyRouter);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
