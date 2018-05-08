const express = require('express');
const GlimmerRenderer = require('./dist/ssr-app.js');
const fs = require('fs');
const vm = require('vm');
const morgan = require('morgan')

const app = express();

const html = fs.readFileSync('dist/index.html').toString();

const renderer = new GlimmerRenderer();
const sandbox = { renderer };
const script = new vm.Script('renderer.render();');

app.use(morgan('common'));
app.use(express.static('dist', { index: false }));

app.get('*', async function(req, res, next) {
  try {
    let app = await script.runInNewContext(sandbox);
    let body = html.replace('<div id="app"></div>', `<div id="app">${app}</div>`);
    res.send(body);
  } catch(e) {
    next(e);
  }
});

app.listen(3000, () => console.log('Server listening on port 3000!'))
