import { ComponentManager, setPropertyDidChange } from '@glimmer/component';
import App from './main';

let wrapper = (callback) => callback();
if (typeof Raven !== 'undefined') {
  wrapper = Raven.context.bind(Raven);
}

wrapper(() => {
  const app = new App();
  const containerElement = document.getElementById('app');

  setPropertyDidChange(() => {
    app.scheduleRerender();
  });

  app.registerInitializer({
    initialize(registry) {
      registry.register(`component-manager:/${app.rootName}/component-managers/main`, ComponentManager);
    }
  });

  app.renderComponent('PpmClient', containerElement, null);

  app.boot();
});
