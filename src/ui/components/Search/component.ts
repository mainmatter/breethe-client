import Component, { tracked } from '@glimmer/component';
import { assert } from '@orbit/utils';

declare const __ENV_API_HOST__: string;

export default class Home extends Component {

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

  constructor(options) {
    super(options);
    assert('Argument \'store\' must be supplied to this component.', this.args.store);
    this.searchTerm = this.args.searchTerm;
    if (this.searchTerm && this.searchTerm.length > 0) {
      this.findLocations(this.searchTerm, this.args.searchResults);
    } else if (!this.args.isSSR) {
      this.loadRecent();
    }
    this.args.updateFogEffect(0);
  }

  async findLocations(searchTerm, searchResults = []) {
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
        let locationsResponse = await fetch(`${__ENV_API_HOST__}/api/locations?filter[name]=${searchTerm}`);
        let locationsPayload: { data: any[] } = await locationsResponse.json();
        this.locations = locationsPayload.data;
      } catch (e) {
        this.locations = [];
      }
      this.loading = false;
    }
  }

  async loadRecent() {
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

  goToRoute(search, event) {
    if (search && search.length > 0) {
      this.searchTerm = search;
      this.findLocations(search);
      /**
       * This 'transition' doesn't trigger any update
       * in the component. We use it here to update
       * the URL parameter.
       */
      this.args.router.navigate(`/search/${search}`);
    } else {
      this.searchTerm = '';
      this.loadRecent();
      this.args.router.navigate(`/`);
    }

    if (event) {
      event.preventDefault();
    }
  }
}
