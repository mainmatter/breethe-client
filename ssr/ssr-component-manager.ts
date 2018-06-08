// tslint:disable:no-empty
import { ComponentManager } from '@glimmer/component';

export default class SSRComponentManager extends ComponentManager {
  static create(options: any) {
    return new this(options);
  }

  didCreate() {}
  didCreateElement() {}
  didRenderLayout() {}
}
