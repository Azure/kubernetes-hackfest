const bodyParser = require('body-parser');
const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');

const apiRouter = require('./routes/api');

const appInsights = require('applicationinsights');
appInsights
  .setup()
  .setAutoDependencyCorrelation(true)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true)
  .setAutoCollectExceptions(true)
  .setAutoCollectDependencies(true)
  .setAutoCollectConsole(true)
  .setUseDiskRetryCaching(true)
  .start();

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json({ limit: '2mb' }));
app.use('/', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(req, res, next) {
  /* AppInsights request tracking for GET and POST */
  if (req.method === 'GET' || req.method === 'POST') {
    appInsights.defaultClient.trackNodeHttpRequest({
      request: req,
      response: res
    });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type'
  );
  next();
});

// error handler
app.use(function(err, req, res, next) {
  console.log('there is an error: ', err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err);
});

module.exports = app;
