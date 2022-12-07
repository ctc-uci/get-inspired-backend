// imports
const admin = require('firebase-admin');
require('dotenv').config();
const credentials = require('./firebase-adminsdk.json');

// init firebase-admin
admin.initializeApp({ credential: admin.credential.cert(credentials) });

// exports
module.exports = admin;
