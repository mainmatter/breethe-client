import Component, { tracked } from '@glimmer/component';

const SUP_PARAMS = ['SO2', 'O3', 'NO2'];

export default class SearchForm extends Component {
  args: {
    unit: string;
    parameter: string;
    value: string | null;
  };

  @tracked('args')
  get isPPM(): boolean {
    return this.args.unit === 'ppm';
  }

  @tracked('args')
  get paramName(): { base: string, sup?: string } {
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
  get valuePresent(): boolean {
    let value = this.args.value;
    let numericValue = parseFloat(value);
    return !isNaN(numericValue);
  }

  @tracked('args')
  get value(): string {
    let { value } = this.args;
    let numericValue = parseFloat(value);
    return `${(this.valuePresent) ? this.precisionRound(numericValue, 2) : ''}`;
  }

  @tracked('args')
  get measurementLabelledId(): string {
    return `measurement-${this.args.parameter}`;
  }

  precisionRound(value: number, precision: number): number {
    let factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
  }
}
