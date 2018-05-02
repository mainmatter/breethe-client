/* eslint-env node */
'use strict';

module.exports = function(app) {
  const express = require('express');
  let measurementsRouter = express.Router();

  measurementsRouter.get('/', function(req, res) {
    res.type('application/vnd.api+json');
    res.json({
      data: [
        {
          type: 'measurement',
          id: 1,
          attributes: {
            value: 12,
            unit: 'ppm',
            parameter: 'pm10',
            'measured-at': '2016-10-28T16:00:00.000Z'
          }
        },
        {
          type: 'measurement',
          id: 2,
          attributes: {
            value: 19,
            unit: 'ppm',
            parameter: 'pm25',
            'measured-at': '2016-10-28T16:00:00.000Z'
          }
        },
        {
          type: 'measurement',
          id: 3,
          attributes: {
            value: 39,
            unit: 'micro_grams_m3',
            parameter: 'so2',
            'measured-at': '2016-10-28T16:00:00.000Z'
          }
        },
        {
          type: 'measurement',
          id: 4,
          attributes: {
            value: 39,
            unit: 'micro_grams_m3',
            parameter: 'o3',
            'measured-at': '2016-10-28T16:00:00.000Z'
          }
        },
        {
          type: 'measurement',
          id: 5,
          attributes: {
            value: 49,
            unit: 'micro_grams_m3',
            parameter: 'no2',
            'measured-at': '2016-10-28T16:00:00.000Z'
          }
        },
        {
          type: 'measurement',
          id: 6,
          attributes: {
            value: 35,
            unit: 'micro_grams_m3',
            parameter: 'co',
            'measured-at': '2016-10-28T16:00:00.000Z'
          }
        }
      ]
    });
  });

  measurementsRouter.post('/', function(req, res) {
    res.status(201).end();
  });

  measurementsRouter.get('/:id', function(req, res) {
    res.send({
      measurements: {
        id: req.params.id
      }
    });
  });

  measurementsRouter.put('/:id', function(req, res) {
    res.send({
      measurements: {
        id: req.params.id
      }
    });
  });

  measurementsRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  // The POST and PUT call will not contain a request body
  // because the body-parser is not included by default.
  // To use req.body, run:

  //    npm install --save-dev body-parser

  // After installing, you need to `use` the body-parser for
  // this mock uncommenting the following line:
  //
  //app.use('/api/measurements', require('body-parser').json());
  app.use('/api/measurements', measurementsRouter);
};
