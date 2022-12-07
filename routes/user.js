// imports
const express = require('express');
const admin = require('../firebase');
const pool = require('../server/db');
const { isAlphaNumeric } = require('../common/utils');

// init userRouter
const userRouter = express();

// userRouter: create a user
userRouter.post('/create', async (req, res) => {
  try {
    const { userId, email, role, firstName, lastName } = req.body;
    isAlphaNumeric(userId, '@userRouter Attemped to create user with nonalphanumeric id');

    // (NOTE andrew): the ctc-uci/auth-frontend code handles
    // adding the user to the Firebase DB, so we only add to the NPO DB here
    const newUser = await pool.query(
      'INSERT INTO users (user_id, email, user_role, first_name, last_name) VALUES ($(userId), $(email), $(role), $(firstName), $(lastName)) RETURNING *',
      { userId, email, role, firstName, lastName },
    );
    res.send(200).send({
      newUser: newUser.rows[0],
    });
  } catch (err) {
    res.status(400).send(err.mesage);
  }
});

// userRouter: read DB for all users
userRouter.get('/', async (req, res) => {
  try {
    const users = await pool.query('SELECT * FROM users');
    res.send({
      users: users.rows,
    });
  } catch (err) {
    res.status(400).send(err.mesage);
  }
});

// userRouter: read DB for a specific user by their ID
userRouter.get('/:userId', async (req, res) => {
  try {
    // get the user id and double check that it's alphanumeric
    const { userId } = req.params;
    isAlphaNumeric(userId, '@userRouter userID is not alphanumeric');

    // if so, query and send
    const user = await pool.query('SELECT * FROM users WHERE user_id = $(userId)', { userId });
    res.send({ user: user.rows[0] });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// userRouter: update a user
userRouter.put('/update/:userId', async (req, res) => {
  try {
    // get and sanity check params
    const { userId } = req.params;
    isAlphaNumeric(userId, '@userRouter userID is not alphanumeric');
    const { email, firstName, lastName } = req.body;

    // if so, update role
    const user = await pool.query(
      'UPDATE users SET email=$(email), first_name=$(firstName), last_name=$(lastName) WHERE user_id = $(userId)',
      { userId, email, firstName, lastName },
    );
    res.send({ user: user.rows[0] });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// userRouter: delete a user both in FIrebase and NPO DB
userRouter.delete('/update/role/:userId', async (req, res) => {
  try {
    // get the user id and double check that it's alphanumeric
    const { userId } = req.params;
    isAlphaNumeric(userId, '@userRouter userID is not alphanumeric');

    // delete from Firebase, then NPO database
    await admin.auth().deleteUser(userId);
    await pool.query('DELETE FROM users WHERE user_id=$(userId)', { userId });

    // send response
    res.status(200).send(`Deleted user with ID: ${userId}`);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// export userRouter
module.exports = userRouter;
