import Component, { tracked } from '@glimmer/component';

export default class SearchForm extends Component {
  args: {
    onSearch: (coordinates: Promise<number[]>) => void;
  };

  searchByLocation(event) {
    if (event) {
      event.preventDefault();
    }

    let { onSearch } = this.args;

    let coordinatesPromise: Promise<number[]> = new Promise((resolve, reject) => {
      let onSuccess = (position) => {
        let { latitude, longitude } = position.coords;
        resolve([latitude, longitude]);
      };

      let onError = (e) => {
        reject(e.code);
      };

      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        timeout: 5 * 1000
      });
    });

    onSearch(coordinatesPromise);
  }
}
