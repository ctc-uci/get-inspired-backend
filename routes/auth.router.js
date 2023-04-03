// File for routes/function restricting access

// imports
const express = require('express');
const admin = require('../firebase');

// This method makes a call to Firebase to verfiy the access token attached to the request's cookies,
// thus ensuring that only users with an appropriate access token can access backend routes.
const verifyToken = async (req, res, next) => {
  try {
    const {
      cookies: { accessToken },
    } = req;

    // send status 4400 response if no access token in cookies
    if (!accessToken) {
      return res.status(400).send('@verifyToken no access token');
    }

    // verifies a user's access token, sending 400 response if couldn't decode
    const decodedToken = await admin.auth().verifyIdToken(accessToken);
    if (!decodedToken) {
      return res.status(400).send('Empty token from firebase');
    }

    // else return
    return next();
  } catch (err) {
    return res.status(400).send('@verifyToken no access token');
  }
};

// setup auth router
const authRouter = express();
authRouter.use(express.json());

// This method makes a call to Firebase to verfiy the access token attached to the request's cookies,
// thus ensuring that only users with an appropriate access token can access frontend routes.
authRouter.get('/verifyToken/:accessToken', async (req, res) => {
  try {
    const { accessToken } = req.params;
    const decodedToken = await admin.auth().verifyIdToken(accessToken);
    return res.status(200).send(decodedToken.uid);
  } catch (err) {
    return res.status(200).send('@verifyToken no access token');
  }
});

// exports
module.exports = { verifyToken, authRouter };
