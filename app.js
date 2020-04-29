const express = require('express')
const app = express();
const services = require('./services/addusers');

app.get('/', (req, res) => {
  res.send('Hello World!')
});

services(app);

app.listen(8000, () => {
  console.log('App listening on port 8000!')
});