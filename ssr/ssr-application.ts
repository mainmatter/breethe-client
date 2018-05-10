import SSRDOMTreeConstruction from './ssr-dom-tree-construction';
import SSRComponentManager from './ssr-component-manager';
import DynamicScope from './dynamic-scope';
import { TemplateIterator } from '@glimmer/runtime';
import { UpdatableReference } from '@glimmer/component';
// tslint:disable-next-line:no-var-requires
const SimpleDOM = require('simple-dom');

import Application, { ApplicationOptions } from '@glimmer/application';

export interface SSROptions extends ApplicationOptions {
  element: any;
  route: string;
  origin: string;
  apiHost: string;
}

export default class SSRApplication extends Application {
  serializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);
  mainLayout: any;
  element: any;

  constructor(options: SSROptions) {
    super(options);

    class AppState {
      isSSR: boolean;
      route: string;
      origin: string;
      apiHost: string;

      static create() {
        return new AppState();
      }

      constructor() {
        this.route = options.route;
        this.origin = options.origin;
        this.isSSR = true;
        this.apiHost = options.apiHost;
      }
    }

    let rootName = 'ppm-client';
    this.element = options.element;
    this.registerInitializer({
      initialize(registry) {
        // inject appendOperations into environment in order to get working createElement and setAttribute.
        registry.register(`domTreeConstruction:/${rootName}/main/main`, SSRDOMTreeConstruction);
        registry.registerInjection('domTreeConstruction', 'document', `document:/${rootName}/main/main`);
        registry.registerInjection('environment', 'appendOperations', `domTreeConstruction:/${rootName}/main/main`);
        registry.register(`app-state:/${rootName}/main/main`, AppState);
        registry.registerInjection(`component:/${rootName}/components/PpmClient`, 'appState', `app-state:/${rootName}/main/main`);
        registry.register(`component-manager:/${rootName}/component-managers/main`, SSRComponentManager);
      },
    });
    this.initialize();
    this.env = this.lookup(`environment:/${this.rootName}/main/main`);
  }

  scheduleRerender() {}

  async renderToString(): Promise<string> {
    let { env } = this;

    let builder = this.builder.getBuilder(env);
    let dynamicScope = new DynamicScope();
    let templateIterator: TemplateIterator;
    let self = new UpdatableReference({ roots: [{id: 1, component: 'PpmClient', parent: this.element, nextSibling: null}] });

    try {
      templateIterator = await this.loader.getTemplateIterator(this, env, builder, dynamicScope as any, self);
    } catch (err) {
      this._didError(err);
      throw err;
    }

    try {
      this.boot();
      // Begin a new transaction. The transaction stores things like component
      // lifecycle events so they can be flushed once rendering has completed.
      env.begin();
      await this.renderer.render(templateIterator);
      // commit the transaction and flush component lifecycle hooks.
      env.commit();
    } catch (err) {
      this._didError(err);
      throw err;
    }

    return this.serializer.serializeChildren(this.element);
  }
}
