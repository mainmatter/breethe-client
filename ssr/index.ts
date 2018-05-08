// tslint:disable-next-line:no-var-requires
const SimpleDOM = require('simple-dom');
const Document = SimpleDOM.Document;
import { SyncRenderer, RuntimeCompilerLoader, DOMBuilder } from '@glimmer/application';
import Resolver, { BasicModuleRegistry } from '@glimmer/resolver';
import { SerializingBuilder } from '@glimmer/ssr';
import resolverConfiguration from '../config/resolver-configuration';
import moduleMap from '../config/module-map';

import SSRApplication from './ssr-application';

const ROUTE_DATA_KEYS: {[key: string]: string} = {
  FeedUpdate: 'update',
  FeedHome: 'updates',
};

let moduleRegistry = new BasicModuleRegistry(moduleMap);
let resolver = new Resolver(resolverConfiguration, moduleRegistry);
let loader = new RuntimeCompilerLoader(resolver);

export default class GlimmerRenderer {
  constructor() {}
  render(): Promise<string> {
    const document = new Document();

    const mountEl = document.createElement('div');
    mountEl.setAttribute('id', 'app');
    let renderer = new SyncRenderer();
    let builder = new SerializingBuilder({ element: document.body as any as Element, nextSibling: null });

    const app = new SSRApplication({
      rootName: 'ppm-client',
      loader,
      builder,
      document,
      renderer,
      resolver,
      element: mountEl,
    });

    return app.renderToString();
  }
}
