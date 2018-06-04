import Component, { tracked } from '@glimmer/component';

export default class SearchForm extends Component {
  args: {
    term: string,
    onSearchByTerm: (param: string) => void,
    onSearchByLocation: (event: any) => void
  };

  @tracked
  search: string = this.args.term || '';

  cacheArgTerm: string;

  updateSearch(event) {
    this.search = event.target.value;
  }

  submitSearch(event) {
    event.preventDefault();
    let { search } = this;
    this.args.onSearchByTerm(this.search);
  }

  searchByLocation(event) {
    this.args.onSearchByLocation(event);
  }

  didUpdate() {
    /**
     * There's not didReceiveAttrs hook in Glimmer
     * so we have to manually check if the args are updated.
     */
    if (this.cacheArgTerm !== this.args.term) {
      this.cacheArgTerm = this.args.term;
      this.search = this.args.term;
    }
  }
}
