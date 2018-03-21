import { SchemaSettings } from '@orbit/data';
import { ModelDefinition } from '@orbit/data';

export const location: ModelDefinition = {
  attributes: {
    city: { type: 'string' },
    coordinates: { type: 'string' },
    country: { type: 'string' },
    identifier: { type: 'string' },
    lastUpdated: { type: 'string' }
  },
  relationships: {
    measurements: { type: 'hasMany', model: 'measurement', inverse: 'location' }
  }
};

export const measurement: ModelDefinition = {
  attributes: {
    coordinates: { type: 'string' },
    measuredAt: { type: 'string' },
    unit: { type: 'string' },
    value: { type: 'number' }
  },
  relationships: {
    location: { type: 'hasOne', model: 'location', inverse: 'measurements' }
  }
};

export const schemaDefinition: SchemaSettings = {
  models: {
    location,
    measurement
  }
};
