import { SchemaSettings } from '@orbit/data';
import { ModelDefinition } from '@orbit/data';

export const location: ModelDefinition = {
  attributes: {
    name: { type: 'string' },
    city: { type: 'string' },
    coordinates: { type: 'string' },
    country: { type: 'string' },
    identifier: { type: 'string' },
    lastUpdated: { type: 'string' }
  },
  relationships: {
    measurements: { type: 'hasMany', model: 'measurement' }
  }
};

export const measurement: ModelDefinition = {
  attributes: {
    parameter: { type: 'string' },
    measuredAt: { type: 'string' },
    unit: { type: 'string' },
    value: { type: 'number' }
  }
};

export const schema: SchemaSettings = {
  models: {
    location,
    measurement
  }
};
