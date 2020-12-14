// for web framework
const express = require('express');
const app = express();
const Firestore = require('@google-cloud/firestore');

app.set('view engine', 'html');

// nunjucks for template rendering
// https://mozilla.github.io/nunjucks/getting-started.html
const nunjucks = require('nunjucks');
nunjucks.configure('views', {
  express: app,
  autoescape: true,
  noCache: true
});

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.use(express.urlencoded({
  extended: false
}));

// init our file-based session storage
const session = require('express-session');

const { FirestoreStore } = require('@google-cloud/connect-firestore');

app.use(
  session({
    cookie: { maxAge: 86400000 },
    store: new FirestoreStore({
      dataset: new Firestore(),
      kind: 'express-sessions'
    }),
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_STORE_SECRET || 'dev'
  })
);

module.exports = {
  app
};
