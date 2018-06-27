import Component, { tracked } from '@glimmer/component';
import Store from '@orbit/store';
import { assert } from '@orbit/utils';
import Navigo from 'navigo';

declare const __ENV_API_HOST__: string;

const LOCATION_PERMISSION_DENIED: number = 1;

export default class Home extends Component {
  args: {
    isSSR: boolean;
    isOnline: boolean;
    store: Store;
    searchTerm: string;
    coordinates: number[];
    searchResults: string[];
    updateFogEffect: (index: number) => void;
    pullIndexedDB: () => void;
    router: Navigo;
  };

  @tracked
  coordinates: number[] | null;

  @tracked
  locations: Location[] = [];

  @tracked
  searchTerm: string = '';

  @tracked
  loading: boolean = false;

  @tracked
  error: null | string;

  @tracked('args')
  get isSearchDisabled(): boolean {
    return this.args.isSSR || !this.args.isOnline;
  }

  @tracked('locations', 'searchTerm', 'coordinates')
  get showRecent(): boolean {
    return this.locations.length > 0 && !this.searchTerm && !this.coordinates;
  }

  constructor(options) {
    super(options);
    assert(
      'Argument \'store\' must be supplied to this component.',
      !!this.args.store
    );

    let {
      searchTerm,
      coordinates,
      searchResults,
      isSSR,
      updateFogEffect
    } = this.args;

    this.searchTerm = searchTerm;
    this.coordinates = coordinates;

    if (
      (searchTerm && searchTerm.length > 0) ||
      (coordinates && coordinates.length > 0)
    ) {
      this.findLocations(searchTerm, coordinates, searchResults);
    } else if (!isSSR) {
      this.loadRecent();
    }
    updateFogEffect(0);
  }

  async findLocations(searchTerm: string, coordinates: number[], searchResults: string[] = []) {
    this.error = null;
    let { store } = this.args;

    if (searchResults.length > 0) {
      this.locations = searchResults.map((id) => {
        try {
          return store.cache.query((q) => q.findRecord({ type: 'location', id }));
        } catch (e) {
          return;
        }
      });
    } else {
      this.loading = true;
      try {
        let url: string;
        if (searchTerm) {
          url = `${__ENV_API_HOST__}/api/locations?filter[name]=${searchTerm}`;
        } else {
          url = `${__ENV_API_HOST__}/api/locations?filter[coordinates]=${coordinates}`;
        }
        let locationsResponse = await fetch(url);
        let locationsPayload: { data: Location[] } = await locationsResponse.json();
        this.locations = locationsPayload.data;
      } catch (e) {
        this.locations = [];
      }
      this.loading = false;
    }
  }

  async loadRecent() {
    this.error = null;
    let { pullIndexedDB, store } = this.args;

    await pullIndexedDB();

    let locations: Location[] = store.cache.query((q) => q.findRecords('location'));
    locations = locations
      .filter((location) => {
        return !!location.attributes.visitedAt;
      })
      .sort((locationL, locationR) => {
        let dateLeft = new Date(locationL.attributes.visitedAt);
        let dateRight = new Date(locationR.attributes.visitedAt);
        if (dateLeft > dateRight) {
          return -1;
        } else if (dateLeft < dateRight) {
          return 1;
        }
        return 0;
      });
    this.locations = locations.slice(0, 3);
  }

  searchByLocation = async (coordinatesPromise: Promise<number[]>) => {
    this.loading = true;
    this.searchTerm = '';

    try {
      let coordinates = await coordinatesPromise;
      this.goToRoute(null, coordinates);
    } catch (e) {
      this.coordinates = [];
      if (e.code !== LOCATION_PERMISSION_DENIED) {
        this.error = 'An error occured while trying to access your location.';
      }
    } finally {
      this.loading = false;
    }
  }

  searchByTerm(term: string, event = null) {
    if (event) {
      event.preventDefault();
    }
    this.goToRoute(term);
  }

  goToRoute(search: string, coordinates?: number[]) {
    if (search && search.length > 0) {
      this.searchTerm = search;
      this.coordinates = null;
      this.findLocations(search, null);
      /**
       * This 'transition' doesn't trigger any update
       * in the component. We use it here to update
       * the URL parameter.
       */
      this.args.router.navigate(`/search/${search}`);
    } else if (coordinates && coordinates.length > 0) {
      this.searchTerm = '';
      this.coordinates = coordinates;
      this.findLocations(null, coordinates);
      this.args.router.navigate(`/search/${coordinates}`);
    } else {
      this.searchTerm = '';
      this.coordinates = null;
      this.loadRecent();
      this.args.router.navigate(`/`);
    }
  }
}
