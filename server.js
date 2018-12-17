'use strict';

const express = require('express');

const data = require('./db/notes');

const app = express();

app.use(express.static('public'));

app.get('/api/notes', (req, res) => {
  res.json(data);
});

app.get('/api/notes/:id', (req, res) => {
  const item = data.find(item => item.id === Number(req.params.id));
  res.json(item);
});

app.listen(8080, function() {
  // eslint-disable-next-line no-console
  console.info(`Server listening on ${this.address().port}`);
}).on('error', err => {
  // eslint-disable-next-line no-console
  console.error(err);
});