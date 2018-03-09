/* eslint-env node */
'use strict';

module.exports = function(app) {
  const express = require('express');
  let positionsRouter = express.Router();

  positionsRouter.get('/', function(req, res) {
    res.send({
      data: [
      {
        type: 'positions',
        id: 1,
        attributes: {
          city: 'København',
          country: 'Denmark',
          'last-updated': '2017-03-06',
          coordinates: '55.676098, 12.568337'
        }
      },
      {
        type: 'positions',
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

  positionsRouter.post('/', function(req, res) {
    res.status(201).end();
  });

  positionsRouter.get('/:id', function(req, res) {
    res.send({
      'positions': {
        id: req.params.id
      }
    });
  });

  positionsRouter.put('/:id', function(req, res) {
    res.send({
      'positions': {
        id: req.params.id
      }
    });
  });

  positionsRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  // The POST and PUT call will not contain a request body
  // because the body-parser is not included by default.
  // To use req.body, run:

  //    npm install --save-dev body-parser

  // After installing, you need to `use` the body-parser for
  // this mock uncommenting the following line:
  //
  //app.use('/api/positions', require('body-parser').json());
  app.use('/api/positions', positionsRouter);
};
