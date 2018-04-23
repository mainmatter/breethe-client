import Component, { tracked } from '@glimmer/component';
import { assert } from '@orbit/utils';

export default class Home extends Component {

  @tracked
  locations = [];

  @tracked
  searchTerm = '';

  @tracked('locations', 'searchTerm')
  get showSearchResults() {
    return this.locations.length > 0 && this.searchTerm.length > 0;
  }

  constructor(options) {
    super(options);
    assert('Argument \'store\' must be supplied to this component.', this.args.store);
    this.searchTerm = this.args.param;
    this.loadLocations(this.args.param);
  }

  async loadLocations(searchTerm) {
    this.locations = await this.args.store.query((q) =>
      q.findRecords('location')
       .filter({ attribute: 'city', value: searchTerm })
    );
  }

  goToRoute(search) {
    this.loadLocations(search);
    this.searchTerm = search;
    /**
     * This 'transition' doesn't trigger any update
     * in the component. We use it here to update
     * the URL parameter.
     */
    this.args.transitionTo(`/search/${search}`);
  }
}
