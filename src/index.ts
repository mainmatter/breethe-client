import { ComponentManager, setPropertyDidChange } from '@glimmer/component';
import App from './main';

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

let current = containerElement.firstChild;
if (current) {
  let parent = current.parentElement;
  let nextNode;
  do {
    nextNode = current.nextSibling;
    parent.removeChild(current);
    current = nextNode;
  } while (current);
}

app.renderComponent('PpmClient', containerElement, null);

app.boot();
