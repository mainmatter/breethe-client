import Component, { tracked } from '@glimmer/component';

const SUP_PARAMS = ['SO2', 'O3', 'NO2'];

export default class SearchForm extends Component {
  @tracked('args')
  get isPPM() {
    return this.args.unit === 'ppm';
  }

  @tracked('args')
  get paramName() {
    let type = this.args.parameter.toUpperCase();
    if (SUP_PARAMS.indexOf(type) >= 0) {
      return {
        base: type.substring(0, type.length - 1),
        sup: type.substring(type.length - 1)
      };
    }
    return {
      base: type
    };
  }

  @tracked('args')
  get valuePresent() {
    let value = this.args.value;
    return value !== null && value !== undefined;
  }

  precisionRound(value, precision) {
    let factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
  }

  @tracked('args')
  get value() {
    let { value } = this.args;
    let isNumber = !isNaN(parseFloat(value));
    return `${(isNumber) ? this.precisionRound(value, 2) : ''}`;
  }
}
