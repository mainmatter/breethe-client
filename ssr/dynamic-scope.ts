import { PathReference } from '@glimmer/reference';
import { DynamicScope as GlimmerDynamicScope } from '@glimmer/runtime';
import { assign, Opaque } from '@glimmer/util';

export default class DynamicScope implements GlimmerDynamicScope {
  private bucket: any;

  constructor(bucket?: any) {
    if (bucket) {
      this.bucket = assign({}, bucket);
    } else {
      this.bucket = {};
    }
  }

  get(key: string): PathReference<Opaque> {
    return this.bucket[key];
  }

  set(key: string, reference: PathReference<Opaque>) {
    return this.bucket[key] = reference;
  }

  child(): DynamicScope {
    return new DynamicScope(this.bucket);
  }
}
