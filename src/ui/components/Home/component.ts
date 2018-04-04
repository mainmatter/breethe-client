import Component, { tracked } from '@glimmer/component';

export default class PpmClient extends Component {

  @tracked
  locations = null;

  constructor(options) {
    super(options);
    this.loadLocations();
  }

  async loadLocations() {
    this.locations = await this.args.store.query((q) => q.findRecords('location'));
  }
}
