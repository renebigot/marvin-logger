var express = require('express'),
    app = express(),
    Marvin = require('../index.js'),
    logger = new Marvin(),
    httpPort = 4200;

app.use(logger.expressMiddleWare());

app.use((req, res) => {
  res.status(404).send('Not found');
});

logger.important('[Webserver]', 'Starting');
app.listen(httpPort);
logger.info('[Webserver]', 'Listening for incomming connexion on port', httpPort);

