import Application, { RehydratingBuilder, DOMBuilder, RuntimeCompilerLoader, SyncRenderer } from '@glimmer/application';
import Resolver, { BasicModuleRegistry } from '@glimmer/resolver';
import moduleMap from '../config/module-map';
import resolverConfiguration from '../config/resolver-configuration';

export default class App extends Application {
  constructor({ hasSSRBody = false }) {
    let moduleRegistry = new BasicModuleRegistry(moduleMap);
    let resolver = new Resolver(resolverConfiguration, moduleRegistry);
    const element = document.body;

    const BuilderType = hasSSRBody ? RehydratingBuilder : DOMBuilder;

    super({
      builder: new BuilderType({ element, nextSibling: null }),
      loader: new RuntimeCompilerLoader(resolver),
      renderer: new SyncRenderer(),
      resolver,
      rootName: resolverConfiguration.app.rootName
    });
  }
}
