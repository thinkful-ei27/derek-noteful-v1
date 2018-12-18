'use strict';

const express = require('express');

// Simple In-Memory Database
const data = require('./db/notes');
const simDB = require('./db/simDB');
const notes = simDB.initialize(data);

const { PORT } = require('./config');
const { requestLogger } = require('./middleware/logger');

const app = express();

app.use(requestLogger);

app.use(express.static('public'));

app.get('/boom', (req, res, next) => {
  throw new Error('Boom!!');
});

app.get('/api/notes', (req, res) => {

  const { searchTerm } = req.query;
  if (searchTerm) {
    const filteredResults = data.filter(note => note.title.includes(searchTerm) || note.content.includes(searchTerm));
    res.json(filteredResults);
  } else {
    res.json(data);
  }
});

app.get('/api/notes/:id', (req, res) => {
  const item = data.find(item => item.id === Number(req.params.id));
  res.json(item);
});

app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  res.status(404).json({ message: 'Not Found' });
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

app.listen(PORT, function() {
  // eslint-disable-next-line no-console
  console.info(`Server listening on ${this.address().port}`);
}).on('error', err => {
  // eslint-disable-next-line no-console
  console.error(err);
});