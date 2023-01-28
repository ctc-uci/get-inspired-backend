const express = require('express');
const cors = require('cors');
const rakersRouter = require('./routes/rakers');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: `${process.env.REACT_APP_HOST}:${process.env.REACT_APP_PORT}`,
  }),
);

app.use(express.json());
app.use('/rakers', rakersRouter);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
