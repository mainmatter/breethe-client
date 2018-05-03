import Application from '../src/main';
import SSRDOMTreeConstruction from './ssr-dom-tree-construction';
import SSRComponentManager from './ssr-component-manager';
import DynamicScope from './dynamic-scope';
import { TemplateIterator } from '@glimmer/runtime';
// tslint:disable-next-line:no-var-requires
const SimpleDOM = require('simple-dom');

export interface SSROptions {
  element: any;
}

export default class SSRApplication extends Application {
  serializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);
  mainLayout: any;
  element: any;

  constructor(options: SSROptions) {
    super();
    let rootName = 'ppm-client';
    this.element = options.element;
    this.registerInitializer({
      initialize(registry) {
        // inject appendOperations into environment in order to get working createElement and setAttribute.
        registry.register(`domTreeConstruction:/${rootName}/main/main`, SSRDOMTreeConstruction);
        registry.registerInjection('domTreeConstruction', 'document', `document:/${rootName}/main/main`);
        registry.registerInjection('environment', 'appendOperations', `domTreeConstruction:/${rootName}/main/main`);
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

    try {
      templateIterator = await this.loader.getTemplateIterator(this, env, builder, dynamicScope as any, null);
    } catch (err) {
      this._didError(err);
      throw err;
    }

    try {
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
