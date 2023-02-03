// imports
const express = require('express');
const toUnnamed = require('named-placeholders')();
const admin = require('../firebase');
const { pool } = require('../server/db');
const { isAlphaNumeric, keysToCamel } = require('../common/utils');

// init userRouter
const userRouter = express();

// userRouter: create a user
userRouter.post('/', async (req, res) => {
  try {
    const { email, firstName, lastName, role, id } = req.body;
    const [query, params] = toUnnamed(
      `
      INSERT INTO user (
        email,
        first_name,
        last_name,
        role,
        id
        )
      VALUES (
        :email,
        :firstName,
        :lastName,
        :role,
        :id
      );
      SELECT * FROM user WHERE id = :id`,
      {
        email,
        firstName,
        lastName,
        role,
        id,
      },
    );

    const user = await pool.query(query, params);
    res.status(200).json(keysToCamel(user));
  } catch (err) {
    res.status(400).send(err.mesage);
  }
});

// userRouter: read DB for all users
userRouter.get('/', async (req, res) => {
  try {
    const users = await pool.query('SELECT * FROM user;');
    res.status(200).json(keysToCamel(users));
  } catch (err) {
    res.status(400).send(err.mesage);
  }
});

// userRouter: read DB for a specific user by their ID
userRouter.get('/:id', async (req, res) => {
  try {
    // get the user id and double check that it's alphanumeric
    const { id } = req.params;
    isAlphaNumeric(id, '@userRouter id is not alphanumeric');

    const [query, params] = toUnnamed('SELECT * FROM user WHERE id = :id', {
      id,
    });
    const user = await pool.query(query, params);
    res.status(200).json(keysToCamel(user));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// userRouter: update a user
userRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, role } = req.body;
    const [query, params] = toUnnamed(
      `UPDATE user
         SET
         ${email ? 'email = :email, ' : ''}
         ${firstName ? 'first_name = :firstName, ' : ''}
         ${lastName ? 'last_name = :lastName, ' : ''}
         ${role ? 'role = :role, ' : ''}
         id = :id
        WHERE id = :id;
      SELECT * FROM user WHERE id = :id`,
      {
        email,
        firstName,
        lastName,
        role,
        id,
      },
    );
    const updatedUser = await pool.query(query, params);
    res.status(200).json(keysToCamel(updatedUser));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// userRouter: delete a user both in FIrebase and NPO DB
userRouter.delete('/:id', async (req, res) => {
  try {
    // get the user id and double check that it's alphanumeric
    const { id } = req.params;
    isAlphaNumeric(id, '@userRouter userID is not alphanumeric');

    // delete from Firebase, then NPO database
    await admin.auth().deleteUser(id);
    const [query, params] = toUnnamed(`DELETE from user WHERE id = :id;`, {
      id,
    });
    await pool.query(query, params);

    // send response
    res.status(200).send(`Deleted user with ID: ${id}`);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// export userRouter
module.exports = userRouter;
