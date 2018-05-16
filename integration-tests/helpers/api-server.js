const express = require('express');
const endpoints = require('../../server/index');

const app = express();
endpoints(app);

app.listen(3001)
