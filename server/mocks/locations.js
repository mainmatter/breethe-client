/* eslint-env node */
'use strict';

const ALL_LOCATIONS = [
  {
    type: 'location',
    id: '1',
    attributes: {
      name: 'Teglholmsgade',
      city: 'København',
      country: 'Denmark',
      lastUpdated: '2017-03-06',
      coordinates: '55.676098, 12.568337'
    }
  },
  {
    type: 'location',
    id: '2',
    attributes: {
      name: 'Ulrich Scheier Straße',
      city: 'Salzburg',
      country: 'Austria',
      lastUpdated: '2017-03-07',
      coordinates: '47.811195, 13.033229'
    }
  },
  {
    type: 'location',
    id: '3',
    attributes: {
      name: 'Calle San Bernabé',
      city: 'Madrid',
      country: 'Spain',
      lastUpdated: '2017-03-07',
      coordinates: '45.811195, 13.033229'
    }
  }
];

const ALL_MEASUREMENTS = [
  {
    type: 'measurement',
    id: '1',
    attributes: {
      value: 15,
      unit: 'ppm',
      parameter: 'pm10',
      qualityIndex: 'very_high',
      measuredAt: '2018-10-28T16:00:00.000Z'
    },
    relationships: {
      location: {
        data: { type: 'location', id: '2' }
      }
    }
  },
  {
    type: 'measurement',
    id: '2',
    attributes: {
      value: 19,
      unit: 'ppm',
      parameter: 'pm25',
      qualityIndex: 'medium',
      measuredAt: '2017-11-28T16:00:00.000Z'
    }
  },
  {
    type: 'measurement',
    id: '3',
    attributes: {
      value: 39,
      unit: 'micro_grams_m3',
      parameter: 'so2',
      measuredAt: '2016-12-28T16:00:00.000Z'
    }
  },
  {
    type: 'measurement',
    id: '4',
    attributes: {
      value: 39,
      unit: 'micro_grams_m3',
      parameter: 'o3',
      measuredAt: '2016-10-28T16:00:00.000Z'
    }
  },
  {
    type: 'measurement',
    id: '5',
    attributes: {
      value: 49,
      unit: 'micro_grams_m3',
      parameter: 'no2',
      measuredAt: '2016-10-28T16:00:00.000Z'
    }
  },
  {
    type: 'measurement',
    id: '6',
    attributes: {
      value: 35,
      unit: 'micro_grams_m3',
      parameter: 'co',
      measuredAt: '2016-10-28T16:00:00.000Z'
    }
  }
];

module.exports = function(app) {
  const express = require('express');
  let locationsRouter = express.Router();

  locationsRouter.get('/', function(req, res) {
    res.type('application/vnd.api+json');
    let queryName = req.query.filter.name;
    if (queryName === 'error') { // this special query can be used for tests to force an error response
      res.sendStatus(500);
    } else if (queryName) {
      let filteredData = ALL_LOCATIONS.filter((record) => {
        return record.attributes.city.toUpperCase() === queryName.toUpperCase();
      });
      res.json({
        data: filteredData
      });
    } else {
      res.json({
        data: ALL_LOCATIONS
      });
    }
  });

  locationsRouter.get('/:id', function(req, res) {
    let locationId = req.params.id;
    if (locationId === 'error') { // this special query can be used for tests to force an error response
      res.sendStatus(500);
    } else if (locationId <= ALL_LOCATIONS.length) {
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
      let data = ALL_MEASUREMENTS.map((measurement) => {
        return {
          ...measurement,
          relationships: {
            location: {
              data: { type: 'location', id: locationId }
            }
          }
        };
      });
      res.type('application/vnd.api+json');
      res.json({
        data
      });
    } else {
      res.status(404).send('Not found');
    }
  });

  app.use('/api/locations', locationsRouter);
};
