/* eslint-env node */
'use strict';

const ALL_LOCATIONS = [
  {
    type: 'location',
    id: '1',
    attributes: {
      name: 'Teglholmsgade',
      city: 'København',
      label: 'Teglholmsgade - København',
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
      label: 'Ulrich Scheier Straße - Salzburg',
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
      label: 'Calle San Bernabé - Madrid',
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
      qualityIndex: 'very_high',
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
      value: 51,
      unit: 'micro_grams_m3',
      parameter: 'no2',
      measuredAt: '2017-10-28T16:00:00.000Z'
    }
  },
  {
    type: 'measurement',
    id: '6',
    attributes: {
      value: 37,
      unit: 'micro_grams_m3',
      parameter: 'co',
      measuredAt: '2017-10-28T16:00:00.000Z'
    }
  }
];

module.exports = function(app) {
  const express = require('express');
  let locationsRouter = express.Router();

  locationsRouter.get('/', function(req, res) {
    res.type('application/vnd.api+json');
    let queryName = req.query.filter.name;
    let queryCoordinates = req.query.filter.coordinates;
    if (queryName === 'error') { // this special query can be used for tests to force an error response
      res.sendStatus(500);
    } else if (queryCoordinates) {
      res.json({
        data: ALL_LOCATIONS
      });
    } else if (queryName) {
      let filteredData = ALL_LOCATIONS.filter((record) => {
        return record.attributes.city.toUpperCase() === queryName.toUpperCase();
      });
      res.json({
        data: filteredData
      });
    } else {
      res.sendStatus(404);
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
        let id = `${Date.now()}-${measurement.id}`;
        return {
          ...measurement,
          id,
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
