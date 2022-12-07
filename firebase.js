// imports
const admin = require('firebase-admin');

// init firebase-admin
require('dotenv').config();
const credentials = require('./firebase-adminsdk.json');
admin.initializeApp({ credential: admin.credential.cert(credentials) });

// exports
module.exports = admin;
