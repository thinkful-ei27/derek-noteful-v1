'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;

const expectedKeys = ['id', 'title', 'content'];
function missingTitleExpects(res) {
  expect(res).to.have.status(400);
  expect(res).to.be.an('object');
  expect(res.body).to.have.property('message');
  expect(res.body.message).to.equal('Missing `title` in request body');
}

chai.use(chaiHttp);

describe('Reality check', function () {
  it('true should be true', function () {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4', function () {
    expect(2 + 2).to.equal(4);
  });
});

describe('Express static', function () {
  it('GET request "/" should return the index page', function () {
    return chai.request(app)
      .get('/')
      .then(function (res) {
        expect(res).to.exist;
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });
});

describe('404 handler', function () {
  it('should respond with 404 when given a bad path', function () {
    return chai.request(app)
      .get('/DOES/NOT/EXIST')
      .then(res => {
        expect(res).to.have.status(404);
      });
  });
});

describe('GET /api/ notes', function () {
  it('should return the default of 10 Notes as an array', function () {
    return chai.request(app)
      .get('/api/notes')
      .then(function(res) {
        expect(res).to.exist;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.equal(10);
      });
  });

  it('should return an array of objects with the id, title and content', function () {
    return chai.request(app)
      .get('/api/notes')
      .then(function (res) {
        res.body.forEach(function (note) {
          expect(note).to.be.an('object');
          expect(note).to.have.keys(expectedKeys);
        });
      });
  });

  it('should return correct search results for a valid query', function () {
    const searchTerm = 'lady';
    return chai.request(app)
      .get(`/api/notes?searchTerm=${searchTerm}`)
      .then(function (res) {
        expect(res.body.length).to.equal(1);
        res.body.forEach(function (note) {
          expect(note.title).to.include(searchTerm);
        });
      });
  });

  it('should return an empty array for an incorrect query', function () {
    const searchTerm = 'n0t @ r3@l !nqu!ry';
    return chai.request(app)
      .get(`/api/notes?searchTerm=${searchTerm}`)
      .then(function (res) {
        expect(res.body.length).to.equal(0);
      });
  });
});

describe('GET /api/notes/:id', function () {
  it('should return correct note object with id, title and content for a given id', function () {
    return chai.request(app)
      .get('/api/notes')
      .then(function (res) {
        return chai.request(app)
          .get(`/api/notes/${res.body[0].id}`);
      })
      .then(function (res) {
        expect(res).to.exist;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.keys(expectedKeys);
        expect(res.body.id).to.equal(1000);
        expect(res.body.title).to.equal('5 life lessons learned from cats');
        expect(res.body.content).to.equal('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.');
      });
  });

  it('should respond with a 404 for an invalid id', function () {
    return chai.request(app)
      .get('/api/notes/9999')
      .then(function (res) {
        expect(res).to.have.status(404);
      });
  });
});

describe('POST /api/notes', function () {
  it('should create and return a new item with location header when provided valid data', function () {
    const newNote = {title: 'Test note', content: 'Lorem ipsum something something'};
    return chai.request(app)
      .post('/api/notes')
      .send(newNote)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.have.header('location');
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body.title).to.equal(newNote.title);
        expect(res.body.content).to.equal(newNote.content);
        expect(res.body.id).to.not.equal(null);
      });
  });

  it('should return an object with a message property "Missing title in request body" when missing "title" field', function () {
    const newNote = { content: 'I\'m a note without a title.'};
    return chai.request(app)
      .post('/api/notes')
      .send(newNote)
      .then(function (res) {
        missingTitleExpects(res);
      });
  });
});

describe('PUT /api/notes/:id', function () {
  const updateData = {title: 'Test note with updated title', content: 'Test note with updated content'};
  it('should update and return a note object when given valid data', function () {
    return chai.request(app)
      .get('/api/notes')
      .then(function (res) {
        const id = res.body[0].id;
        updateData.id = id;
        return chai.request(app)
          .put(`/api/notes/${id}`)
          .send(updateData);
      })
      .then(function (res) {
        expect(res).to.exist;
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.keys(expectedKeys);
        expect(res.body).to.deep.equal(updateData);
      });
  });

  it('should respond with a 404 for an invalid id', function () {
    return chai.request(app)
      .put('/api/notes/9999')
      .send(updateData)
      .then(function (res) {
        expect(res).to.have.status(404);
      });
  });

  it('should return an object with a message property "Missing title in request body" when missing the "title" field', function () {
    const noTitle = {content: 'Test note with no title'}; 
    return chai.request(app)
      .get('/api/notes/')
      .then(function (res) {
        const id = res.body[0].id;
        noTitle.id = id;
        return chai.request(app)
          .put(`/api/notes/${id}`)
          .send(noTitle);
      })
      .then(function (res) {
        missingTitleExpects(res);
      });
  });
});

describe('DELETE /api/notes/:id', function () {
  it('should delete an item by id', function () {
    return chai.request(app)
      .get('/api/notes/')
      .then(function (res) {
        return chai.request(app)
          .delete(`/api/notes/${res.body[0].id}`);
      })
      .then(function (res) {
        expect(res).to.have.status(204);
      });
  });
});