const express = require('express');
const cors = require('cors');
const surveysRouter = require('./routes/surveys.router');
const rakersRouter = require('./routes/rakers.router');
const clamsRouter = require('./routes/clams.router');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
  }),
);

const PORT = process.env.PORT || 3001;

app.use('/surveys', surveysRouter);
app.use('/clams', clamsRouter);
app.use('/rakers', rakersRouter);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
