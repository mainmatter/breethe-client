/* eslint-env node */
'use strict';

const ALL_LOCATIONS = [{
  type: 'location',
  id: 1,
  attributes: {
    city: 'København',
    country: 'Denmark',
    'last-updated': '2017-03-06',
    coordinates: '55.676098, 12.568337'
  },
  relationships: {
    data: [
      {
        id: 1,
        type: 'measurement'
      },
      {
        id: 2,
        type: 'measurement'
      }
    ]
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
}];

module.exports = function(app) {
  const express = require('express');
  let locationsRouter = express.Router();

  locationsRouter.get('/', function(req, res) {
    res.type('application/vnd.api+json');
    res.json({
      data: ALL_LOCATIONS
    });
  });

  locationsRouter.post('/', function(req, res) {
    res.status(201).end();
  });

  locationsRouter.get('/:id', function(req, res) {
    let locationId = req.params.id;
    if (locationId <= ALL_LOCATIONS.length) {
      res.type('application/vnd.api+json');
      res.json({
        data: ALL_LOCATIONS[locationId - 1]
      });
    } else {
      res.status(404).send('Not found');
    }
  });

  locationsRouter.get('/:id/measurements', function(req, res) {
    let locationId = req.params.id;
    if (locationId <= ALL_LOCATIONS.length) {
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
          }
        ]
      });
    } else {
      res.status(404).send('Not found');
    }
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
