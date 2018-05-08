const express = require('express');
const fs = require('fs');
const vm = require('vm');
const morgan = require('morgan');
const GlimmerRenderer = require('./dist/ssr-app.js');

const app = express();

const html = fs.readFileSync('dist/index.html').toString();

app.use(morgan('common'));
app.use(express.static('dist', { index: false }));

async function preprender(req, res, next) {
  try {
    //const sandbox = { require };
    //const context = vm.createContext(sandbox);
    //let script = new vm.Script(`const GlimmerRenderer = require('./dist/ssr-app.js'); new GlimmerRenderer().render(, ${req.url}');`);
    //let app = await script.runInContext(context);
    let renderer = new GlimmerRenderer();
    let app = await renderer.render('http://localhost:3000', req.url);
    let body = html.replace('<div id="app"></div>', `<div id="app">${app}</div>`);
    res.send(body);
  } catch(e) {
    next(e);
  }
}

app.get('/', preprender);
app.get('/search/:searchTerm', preprender);
app.get('/location/:location', preprender);

app.listen(3000, () => console.log('Server listening on port 3000!'))
