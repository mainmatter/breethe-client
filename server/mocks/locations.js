/* eslint-env node */
'use strict';

module.exports = function(app) {
  const express = require('express');
  let locationsRouter = express.Router();

  locationsRouter.get('/', function(req, res) {
    res.type('application/vnd.api+json');
    res.json({
      data: [
      {
        type: 'location',
        id: 1,
        attributes: {
          city: 'København',
          country: 'Denmark',
          'last-updated': '2017-03-06',
          coordinates: '55.676098, 12.568337'
        }
      },
      {
        type: 'location',
        id: 2,
        attributes: {
          city: 'Salzburg',
          country: 'Austria',
          'last-updated': '2017-03-07',
          coordinates: '47.811195, 13.033229'
        }
      }]
    });
  });

  locationsRouter.post('/', function(req, res) {
    res.status(201).end();
  });

  locationsRouter.get('/:id', function(req, res) {
    res.send({
      'locations': {
        id: req.params.id
      }
    });
  });

  locationsRouter.put('/:id', function(req, res) {
    res.send({
      'locations': {
        id: req.params.id
      }
    });
  });

  locationsRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  // The POST and PUT call will not contain a request body
  // because the body-parser is not included by default.
  // To use req.body, run:

  //    npm install --save-dev body-parser

  // After installing, you need to `use` the body-parser for
  // this mock uncommenting the following line:
  //
  //app.use('/api/locations', require('body-parser').json());
  app.use('/api/locations', locationsRouter);
};
