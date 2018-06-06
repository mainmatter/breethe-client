interface Location {
  id: string;
  attributes: {
    name: string;
    city: string;
    label: string;
    coordinates: string;
    country: string;
    identifier: string;
    visitedAt: string;
  };
}

interface Measurement {
  id: string;
  attributes: {
    parameter: string;
    measuredAt: string;
    unit: string;
    value: string;
    qualityIndex: string;
  };
}
