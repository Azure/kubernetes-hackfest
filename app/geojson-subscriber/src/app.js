const redis = require('redis');
const sub = redis.createClient();
const pub = redis.createClient();
const async = require('async');

sub.subscribe('/flights/states/all');

sub.on("error", function (err) {
  console.log("Error " + err);
});

sub.on('subscribe', function(channel, count){
  console.log('subscribed to channel: ' + channel);
});

sub.on('message', function(channel, message){
  console.log('New flight data received at ' + Date.now());

  buildGeoJson(message, function(geoJSON){
    console.log('publishing geoJSON to channel');
    pub.publish('/flights/currentFlights', JSON.stringify(geoJSON));
  });
});


function buildGeoJson(rawFlights, cb) {
  console.log('Processing files for ', rawFlights.length);

  let outputFlights = [];

  async.each(rawFlights, function (flight, callback) {

    if (flight[8] || flight[5] === null) {
      console.log('Flight on ground, ignoring');
      callback();
    } else {
      // Do work to process file here
      let feature = { 
        type: 'Feature',
        properties: {
          FlightNumber:flight[1], 
          Altitude:flight[7], 
          AirSpeed:flight[9],
          Heading:flight[10]
        },
        geometry: { 
          type: 'Point',
          coordinates:[ flight[5], flight[6] ]
        }
      };

      outputFlights.push(feature);
      callback();
    }
  }, function (err) {
    // if any of the file processing produced an error, err would equal that error
    if (err) {
      // One of the iterations produced an error.
      // All processing will now stop.
      console.log('A file failed to process');
    } else {
      console.log('All files have been processed successfully');
      console.log(outputFlights.length);
      cb(outputFlights);
    }
  });
}