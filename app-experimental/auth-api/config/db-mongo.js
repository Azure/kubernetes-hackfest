const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const authTypes = require('./options');
require('dotenv').config();

const connectOptions = { autoIndex: false, useNewUrlParser: true };

const URI = process.env.MONGODB_URI;

const reconnectTimeout = 10000; // ms.

const db = mongoose.connection;

db.on('connecting', () => {
  console.info(`connecting to DB @ `, URI);
});

db.on('error', error => {
  console.error(`connection error: ${error}`);
  mongoose.disconnect();
});

db.on('connected', () => {
  console.info(`connected`);
});

db.once('open', () => {
  console.info(`connection opened!`);
});

db.on('reconnected', () => {
  console.info(`db reconnected!`);
});

db.on('disconnected', () => {
  console.error(
    `db disconnected! reconnecting in ${reconnectTimeout / 1000}s...`
  );
  setTimeout(() => connect(), reconnectTimeout);
});

function connect() {
  mongoose
    .connect(
      URI,
      connectOptions
    )
    .catch(() => {});
}

exports.connectToDatabase = function(authType) {
  if (authType == authTypes.COSMOSDB || authType == authTypes.MONGODB) {
    connect();
  }
};
