var createError = require('http-errors'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    logger = require('morgan'),
    express = require('express'),
    mongoose = require('mongoose');



require('./models/mongo/CountryFlights');
require('./models/mongo/AllFlights');

mongoose.Promise = global.Promise;


const appInsights = require('applicationinsights');
appInsights.setup()
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setUseDiskRetryCaching(true)
    .start();

var app = express();


mongoose.connect(process.env.MONGODB_URI, {
  user: process.env.MONGODB_USER,
  pass: process.env.MONGODB_PASSWORD,
  useNewUrlParser: true
});

var db = mongoose.connection;

db.on('error', (err) => {
  appInsights.defaultClient.trackEvent({name: 'MongoConnError'})
  console.log(err)
});

db.once('open', () => {
  appInsights.defaultClient.trackEvent({name: 'MongoConnSuccess'})
  console.log('connection success with Mongo')
});

var index = require('./routes/index'),
    flights = require('./routes/flights');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/api', flights);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


app.use(function(req, res, next) {
  
  /* AppInsights request tracking for GET and POST */
  if ( req.method === 'GET' || req.method === 'POST' ) {
    appInsights.defaultClient.trackNodeHttpRequest({request: req, response: res});
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
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
