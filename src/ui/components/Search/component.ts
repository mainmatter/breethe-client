import Component, { tracked } from '@glimmer/component';
import { assert } from '@orbit/utils';

export default class Home extends Component {

  @tracked
  locations = [];

  @tracked
  searchTerm = '';

  @tracked('locations')
  get showResults() {
    return this.locations.length > 0;
  }

  constructor(options) {
    super(options);
    assert('Argument \'store\' must be supplied to this component.', this.args.store);
    this.searchTerm = this.args.searchTerm;
    if (this.searchTerm && this.searchTerm.length > 0) {
      this.loadLocations(this.searchTerm);
    } else {
      this.loadRecent();
    }
  }

  async loadLocations(searchTerm) {
    let { store } = this.args;
    let locationsResponse = await fetch(`/api/locations?filter[name]=${searchTerm}`);
    let locationsPayload: { data: any[] } = await locationsResponse.json();
    let locations = locationsPayload.data;

    this.locations = locations;

    store.update((t) => {
      return locations.map((location) => {
        let signature = { type: 'location', id: location.id };
        try {
          store.cache.query((q) => q.findRecord(signature));
          return t.replaceRecord(location);
        } catch (e) {
          return t.addRecord(location);
        }
      });
    });
  }

  async loadRecent() {
    let store = await this.args.store;
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

  goToRoute(search) {
    if (search) {
      this.loadLocations(search);
    } else {
      this.loadRecent();
    }
    this.searchTerm = search;

    /**
     * This 'transition' doesn't trigger any update
     * in the component. We use it here to update
     * the URL parameter.
     */
    this.args.router.navigate(`/search/${search}`);
  }
}
