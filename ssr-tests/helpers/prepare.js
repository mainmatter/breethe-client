const path = require('path');
const execa = require('execa');

let apiServer;
let ssrServer;

before(() => {
  apiServer = execa('node', [path.normalize(`${__dirname}/api-server.js`)]);
  ssrServer = execa('node', [path.normalize(`${__dirname}/../../ssr-server.js`)], { env: { API_HOST: 'http://localhost:3001' } });

  return new Promise(resolve => {
    setTimeout(resolve, 3000); // wait until the servers are ready
  });
});

after(() => {
  ssrServer.kill();
  apiServer.kill();
});
