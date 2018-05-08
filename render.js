const GlimmerRenderer = require('./dist/ssr-app.js');

async function render() {
  let renderer = new GlimmerRenderer();
  try {
    let output = await renderer.render();
    console.log('RESULT');
    console.log(output);
  } catch(e) {
    console.error(e);
  }
}
debugger;
render();
