'use strict';

const express = require('express');

// Simple In-Memory Database
const data = require('../db/notes');
const simDB = require('../db/simDB');
const notes = simDB.initialize(data);

const notesRouter = express.Router();

//Post (insert) an item
notesRouter.post('/notes', (req, res, next) => {
  const { title, content } = req.body;

  const newItem = { title, content };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  notes.create(newItem, (err, item) => {
    if (err) {
      return next(err);
    }
    if (item) {
      res.location(`http://${req.headers.host}/api/notes/${item.id}`).status(201).json(item);
    } else {
      next();
    }
  });
});

notesRouter.get('/notes', (req, res, next) => {
  const { searchTerm } = req.query;

  notes.filter(searchTerm, (err, list) => {
    if (err) {
      return next(err); // goes to error handler
    }
    res.json(list);
  });
});

notesRouter.get('/notes/:id', (req, res, next) => {
  const { id } = req.params;

  notes.find(id, (err, item) => {
    if (err) {
      return next(err);
    }
    if (item) {
      res.json(item);
    } else {
      next();
    }
  });
});

notesRouter.put('/notes/:id', (req, res, next) => {
  const id = req.params.id;

  /***** Never trust users - validate input  *****/
  const updateObj = {};
  const updateFields = ['title', 'content'];

  updateFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  notes.update(id, updateObj, (err, item) => {
    if (err) {
      return next(err);
    }
    if (item) {
      res.json(item);
    } else {
      next();
    }
  });
});

notesRouter.delete('/notes/:id', (req, res, next) => {
  const id = req.params.id;
  notes.delete(id, err => {
    if (err) {
      err.status = 500;
      return next(err);
    }
    res.status(204).end();
  });
});

module.exports = notesRouter;