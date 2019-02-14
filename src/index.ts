import { ComponentManager, setPropertyDidChange } from '@glimmer/component';
import App from './main';

let wrapper = (callback) => callback();
let Raven = (window as any).Raven;
if (typeof Raven !== 'undefined') {
  wrapper = Raven.context.bind(Raven);
}

wrapper(() => {
  const containerElement = document.getElementById('app');
  const hasSSRBody = document.querySelector('[data-has-ssr-response]');
  const app = new App({ hasSSRBody });

  setPropertyDidChange(() => {
    app.scheduleRerender();
  });

  app.registerInitializer({
    initialize(registry) {
      registry.register(`component-manager:/${app.rootName}/component-managers/main`, ComponentManager);
    }
  });

  app.renderComponent('Breethe', containerElement, null);

  app.boot();
});
