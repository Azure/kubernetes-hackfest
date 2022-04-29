const bodyParser = require('body-parser');
const createError = require('http-errors');
const dayjs = require('dayjs');
const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const relativeTime = require('dayjs/plugin/relativeTime');

dayjs.extend(relativeTime);

global.start = dayjs().valueOf();

if (process.env.NODE_ENV != 'container') {
  require('dotenv').config({ path: path.join(__dirname, '.env.local') });
}

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

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

require('./models/mongo/flights');
require('./models/mongo/latestFlight');
require('./models/mongo/quakes');
require('./models/mongo/latestQuake');
require('./models/mongo/weather');
require('./models/mongo/latestWeather');

mongoose.Promise = global.Promise;

const app = express();

var mongoPrefix = "mongodb://"
var user = process.env.MONGODB_USER
var password = process.env.MONGODB_PASSWORD
var mongoUri = process.env.MONGODB_URI
var mongoPort = process.env.MONGODB_PORT

var mongoConnectString = mongoPrefix.concat(user,`:`,password,`@`,mongoUri,`:`,mongoPort)

if (process.env.NODE_ENV != 'local') {
  mongoose.connect(
    mongoConnectString
    );
} else {
  mongoose.connect(
    'mongodb://localhost/demo:27017',
    { useNewUrlParser: true }
  );
}

const apiRouter = require('./routes/api');

var db = mongoose.connection;

db.on('error', err => {
  appInsights.defaultClient.trackEvent({ name: 'MongoConnError' });
  console.log(err);
});

db.once('open', () => {
  appInsights.defaultClient.trackEvent({ name: 'MongoConnSuccess' });
  console.log('connection success with Mongo');
});

app.set('etag', 'strong');
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '2mb' }));
app.use('/', apiRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(req, res, next) {
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

  res.append('Last-Modified', new Date().toUTCString());

  next();
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err);
});

module.exports = app;
