'use strict';

const express = require('express');
const { PORT } = require('./config');
const morgan = require('morgan');
const notesRouter = require('./router/notes.router');

// Create an Express application
const app = express();

// Log all requests
app.use(morgan('dev'));

// Create a static webserver
app.use(express.static('public'));

// Parse response body
app.use(express.json());

app.use('/api', notesRouter);

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

// Listen for incoming connections
if (require.main === module) {
  app.listen(PORT, function() {
    // eslint-disable-next-line no-console
    console.info(`Server listening on ${this.address().port}`);
  }).on('error', err => {
    // eslint-disable-next-line no-console
    console.error(err);
  });
}

module.exports = app; // Export for testing