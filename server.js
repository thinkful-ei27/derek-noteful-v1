'use strict';

const express = require('express');

const data = require('./db/notes');

const app = express();

app.use(express.static('public'));

app.get('/api/notes', (req, res) => {
  console.log(req.query);

  if (req.query.searchTerm) {
    const searchTerm = req.query.searchTerm;
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

app.listen(8080, function() {
  // eslint-disable-next-line no-console
  console.info(`Server listening on ${this.address().port}`);
}).on('error', err => {
  // eslint-disable-next-line no-console
  console.error(err);
});