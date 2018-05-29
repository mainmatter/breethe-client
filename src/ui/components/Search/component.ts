import Component, { tracked } from '@glimmer/component';
import { assert } from '@orbit/utils';

declare const __ENV_API_HOST__: string;

const LOCATION_PERMISSION_DENIED: number = 1;

export default class Home extends Component {
  @tracked
  coordinates;

  @tracked
  error;

  @tracked
  locations = [];

  @tracked
  searchTerm = '';

  @tracked
  loading = false;

  @tracked('args')
  get isSearchDisabled() {
    return this.args.isSSR || !this.args.isOnline;
  }

  @tracked('locations', 'searchTerm', 'coordinates')
  get showRecent() {
    return this.locations.length > 0 && !this.searchTerm && !this.coordinates;
  }

  constructor(options) {
    super(options);
    assert('Argument \'store\' must be supplied to this component.', this.args.store);
    this.searchTerm = this.args.searchTerm;
    this.coordinates = this.args.coordinates;
    if ((this.searchTerm && this.searchTerm.length > 0) || (this.coordinates && this.coordinates.length > 0)) {
      this.findLocations(this.searchTerm, this.coordinates, this.args.searchResults);
    } else if (!this.args.isSSR) {
      this.loadRecent();
    }
    this.args.updateFogEffect(0);
  }

  async findLocations(searchTerm, coordinates, searchResults = []) {
    this.error = null;
    let { store } = this.args;
    if (searchResults.length > 0) {
      let locations = searchResults.map((id) => {
        try {
          return store.cache.query((q) => q.findRecord({ type: 'location', id }));
        } catch (e) {
          return;
        }
      });
      this.locations = locations;
    } else {
      this.loading = true;
      try {
        let url;
        if (searchTerm) {
          url = `${__ENV_API_HOST__}/api/locations?filter[name]=${searchTerm}`;
        } else {
          url = `${__ENV_API_HOST__}/api/locations?filter[coordinates]=${location}`;
        }
        let locationsResponse = await fetch(url);
        let locationsPayload: { data: any[] } = await locationsResponse.json();
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
    let locations = store.cache.query(
      (q) => q.findRecords('location')
    );
    locations = locations.filter((location) => {
      return !!location.attributes.visitedAt;
    });
    locations.sort((locationL, locationR) => {
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

  searchByLocation(event) {
    if (event) {
      event.preventDefault();
    }

    let onSuccess = (position) => {
      let { latitude, longitude } = position.coords;
      this.goToRoute(null, [latitude, longitude]);
      this.loading = false;
    };
    let onError = (e) => {
      this.loading = false;
      this.coordinates = [];
      if (e.code !== LOCATION_PERMISSION_DENIED) {
        this.error = 'An error occured while trying to access your location.';
      }
    };

    this.searchTerm = '';
    this.loading = true;
    navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 5 * 1000 });
  }

  goToRoute(search, coordinates, event = null) {
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
      console.log('navigating to', coordinates);
      this.args.router.navigate(`/search/${coordinates}`);
    } else {
      this.searchTerm = '';
      this.coordinates = null;
      this.loadRecent();
      this.args.router.navigate(`/`);
    }

    if (event) {
      event.preventDefault();
    }
  }
}
