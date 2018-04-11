import Component, { tracked } from '@glimmer/component';

export default class SearchForm extends Component {
  @tracked
  search: string = '';

  updateSearch(event) {
    this.search = event.target.value;
  }

  submitSearch(event) {
    event.preventDefault();
    let { search } = this;
    if (search.length > 1) {
      this.args.onSearch(this.search);
    }
  }
}
