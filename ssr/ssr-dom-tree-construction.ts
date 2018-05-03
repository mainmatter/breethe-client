import {Simple} from '@glimmer/interfaces';
import {DOMTreeConstruction} from '@glimmer/runtime';

export default class SSRDOMTreeConstruction extends DOMTreeConstruction {
  static create(options: {document: Document}) {
    return new SSRDOMTreeConstruction(options.document);
  }

  constructor(document: Document) {
    super(document);
  }

  createElement(tag: string, context?: Simple.Element): Simple.Element {
    return this.document.createElement(tag);
  }

  setAttribute(element: Simple.Element, name: string, value: string): void {
    element.setAttribute(name, value);
  }
}
