const redis = require('redis');
const redisClient = redis.createClient();

redisClient.subscribe('/flights/states/all');

redisClient.on("error", function (err) {
  console.log("Error " + err);
});

redisClient.on('subscribe', function(channel, count){
  console.log('subscribed to channel: ' + channel);
});

redisClient.on('message', function(channel, message){
  console.log(message);
});