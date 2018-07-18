var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require("mongoose");

// var URI = process.env.MONGODB_URI;
var URI = "mongodb://k8shackfest:WhxPzSaZBmSyRiwoBGF1VY7ByWAjp8xxHtboecw0zdivcYLK2VdaERoUgDLtC2y8FZU2jRmkwcyydw1mzwsDQA==@k8shackfest.documents.azure.com:10255/users?ssl=true";
var authRouter = require('./routes/auth');

var app = express();

app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  next();
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');



var connectOptions = {
  autoIndex: false,
  useNewUrlParser: true
};

mongoose.Promise = require("bluebird");

const reconnectTimeout = 10000; // ms.

function connect() {
  mongoose.connect(URI, connectOptions).catch(() => {});
}

// make sure your connected
// the writings on the wall

const db = mongoose.connection;

db.on("connecting", () => {
  console.info(`connecting to DB @ `, URI);
});

db.on("error", error => {
  console.error(`connection error: ${error}`);
  mongoose.disconnect();
});

db.on("connected", () => {
  console.info(`connected`);
});

db.once("open", () => {
  console.info(`connection opened!`);
});

db.on("reconnected", () => {
  console.info(`db reconnected!`);
});

db.on("disconnected", () => {
  console.error(
    `db disconnected! reconnecting in ${reconnectTimeout / 1000}s...`
  );
  setTimeout(() => connect(), reconnectTimeout);
});

connect();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', authRouter);





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
