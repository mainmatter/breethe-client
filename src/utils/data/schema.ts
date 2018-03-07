import { SchemaSettings } from '@orbit/data';
import { ModelDefinition } from '@orbit/data';

export const location: ModelDefinition = {
  attributes: {
    identifier: { type: 'string' },
    city: { type: 'string' },
    country: { type: 'string' },
    lastUpdated: { type: 'string' },
    coordinates: { type: 'string' }
  }
};

export const measurement: ModelDefinition = {
  attributes: {
    identifier: { type: 'string' },
    city: { type: 'string' },
    country: { type: 'string' },
    lastUpdated: { type: 'string' },
    coordinates: { type: 'string' }
  },
  relationships: {
    location: { type: 'hasOne', model: 'location' }
  }
};

export const schemaDefinition: SchemaSettings = {
  models: {
    location,
    measurement
  }
};
