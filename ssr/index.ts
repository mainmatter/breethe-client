import { ComponentManager, setPropertyDidChange } from '@glimmer/component';
import App from './ssr-application';
const SimpleDOM = require('simple-dom');
const Document = SimpleDOM.Document;

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
