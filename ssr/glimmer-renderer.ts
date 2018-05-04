// tslint:disable-next-line:no-var-requires
const SimpleDOM = require('simple-dom');
const Document = SimpleDOM.Document;
import { SyncRenderer } from '@glimmer/application';
import { SerializingBuilder } from '@glimmer/ssr';
import dataSegment from 'glimmer/table';
import SailfishBytecodeLoader from 'glimmer/loader';
import Resolver, { BasicModuleRegistry } from '@glimmer/resolver';
import resolverConfiguration from 'glimmer/config/resolver-configuration';
import moduleMap from 'glimmer/config/module-map';

import {transform} from 'api/infra/transform';
import SSRApplication from './ssr-application';

import SSRRenderer from '../ssr-renderer';

const ROUTE_DATA_KEYS: {[key: string]: string} = {
  FeedUpdate: 'update',
  FeedHome: 'updates',
};

let moduleRegistry = new BasicModuleRegistry(moduleMap);
let resolver = new Resolver(resolverConfiguration, moduleRegistry);

export default class GlimmerRenderer implements SSRRenderer {
  constructor(private bytecode: ArrayBuffer) {}
  render(route: string, data: any): Promise<string> {
    let routeName: string;
    if (route.indexOf('update') !== -1) {
      routeName = 'FeedUpdate';
    } else if (route.indexOf('error') !== -1) {
      routeName = 'AppError';
    } else {
      routeName = 'FeedHome';
    }

    const dataKey = ROUTE_DATA_KEYS[routeName];

    const transformedData = dataKey && transform(JSON.parse(data[dataKey]), null);

    const document = new Document();
    let loader = new SailfishBytecodeLoader({
      bytecode: this.bytecode,
      data: dataSegment,
    });

    let self = loader.self as any;
    const mountEl = document.createElement('div');
    mountEl.setAttribute('id', 'app');
    let renderer = new SyncRenderer();
    let builder = new SerializingBuilder({ element: mountEl, nextSibling: null });

    const app = new SSRApplication({
      rootName: 'ppm-client',
      self,
      document,
      renderer,
      builder,
      loader,
      resolver,
      element: mountEl,
    });

    app.self.update({
      activeComponent: routeName,
      data: transformedData,
    });

    return app.renderToString();
  }
}
