import Component, { tracked } from '@glimmer/component';

export default class SearchForm extends Component {
  @tracked
  search: string = this.args.term || '';

  updateSearch(event) {
    this.search = event.target.value;
  }

  submitSearch(event) {
    event.preventDefault();
    let { search } = this;
    this.args.onSearch(this.search);
  }
}
