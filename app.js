const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { authRouter } = require('./routes/auth.router');
const usersRouter = require('./routes/user.router');
const surveysRouter = require('./routes/surveys.router');
const rakersRouter = require('./routes/rakers.router');
const clamsRouter = require('./routes/clams.router');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: `${
      !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
        ? process.env.REACT_APP_HOST
        : process.env.REACT_APP_PROD_HOST
    }`,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

const PORT =
  !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
    ? 3001
    : process.env.REACT_APP_PROD_PORT;

// Routes
app.use('/users', usersRouter);
app.use('/auth', authRouter);
// TODO: Verify tokens after LOFI is done
app.use('/surveys', surveysRouter);
app.use('/clams', clamsRouter);
app.use('/rakers', rakersRouter);

app.use(express.json());
app.use('/rakers', rakersRouter);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
