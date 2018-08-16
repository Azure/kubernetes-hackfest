var applicationInsights = require('applicationinsights'),
    async = require('async'),
    express = require('express'),
    jsonResponse = require('../models/jsonResponse'),
    moment = require('moment'),
    mongoose = require('mongoose'),
    redis = require('redis'),
    redisHost = process.env.REDIS_HOST,
    redisPort = process.env.REDIS_PORT,
    router = express.Router(),
    rp = require('request-promise')

/* Redis Client */    
var client = redis.createClient(redisPort, redisHost)

/* Models and Telemetry event info */
var countryFlight = mongoose.model('CountryFlight'),
    allFlight = mongoose.model('AllFlight'),
    telemetry = applicationInsights.defaultClient,
    COSMOS_ALL_FLIGHT_SAVE = 'CosmosDBSaveAllFlight',
    COSMOS_COUNTRY_FLIGHT_SAVE = 'CosmosDBSaveCountryFlight'

/* DateTime Info */
var current = new Date(),
    timeStamp = moment.utc(current).format('YYYYMMDDHHmm'),
    year = moment.utc(current).format('YYYY'),
    month = moment.utc(current).format('MM'),
    day = moment.utc(current).format('DD'),
    hour = moment.utc(current).format('HH'),
    minute = moment.utc(current).format('mm')


/* HTTP GET :: Seed or refresh current worldwide flight data */
router.get('/flights/populate', (req, res, next) => {
  
  var options = {
    uri: 'https://opensky-network.org/api/states/all',
    headers: { 'User-Agent': 'Request-Promise' },
    json: true
  }

  rp(options)
    .then(data => {
      
      buildGeoJson(data, (err, status) => {
        if(!status) console.log(err)
        var result = new jsonResponse('OK', 200, { detail : 'complete' } )
        res.json(result).status(result.status)
      })

    })
    .catch(err => {
      telemetry.trackException({exception: err})
      var result = new jsonResponse('SERVER ERROR', 500, { detail : err } )
      res.json(result).status(result.status)
    })

});

router.get('/flights/current/:country', function(req, res, next){
  var country = req.params.country;
  console.log(country);
    var client = redis.createClient(); // redis.createClient(host, port)
    client.get(country, function(error, flights){
      var output = JSON.parse(flights);
      res.json(output).status(200);
    });

});

router.get('/stats/flights/inair', function(req, res, next){

    var client = redis.createClient(); // redis.createClient(host, port)
    client.get('inair', function(error, inair){
      var output = JSON.parse(inair);
      console.log(output.length, ' Countries')
      res.json(output).status(200);
    });

});


function buildGeoJson(data, cb) {

  var raw = data.states,
  flights = {},
  allFlights = []

  async.each(raw, (flight, callback) => {
    
  /* ignore flights on the ground */
    if ( flight[8] || flight[5] === null ) {  
      callback();
    } else {
      var country = flight[2].toString().replace(/ /g, '').toLowerCase()
      
      /* add the property with the empty array if it does not exist */
      if (!flights.hasOwnProperty(country)) flights[country] = []
        
      /* create the GeoJSON feature for this flight */
      // console.log('processing: ', flight[1].toString().replace(/ /g, ''))
        var feature = { 
          type: 'Feature',
          properties: {
            FlightNumber:flight[1].toString().replace(/ /g, ''),
            Country: flight[2],
            Altitude:flight[7], 
            AirSpeed:flight[9],
            Heading:flight[10]
          },
          geometry: { 
            type: 'Point',
            coordinates:[ flight[5], flight[6] ]
          }
        }

        /* Add this flights GeoJSON to the country array */
        flights[country].push(feature)
        allFlights.push(feature)        
        
        callback()

    }
  }, (err) => {

    /* oh snap, guess what I saw */
    if (err) {
      
      /* a truly informative error would help here, but, ehh.. */
      console.log('Error processing flight data: ', err)
      telemetry.trackException({exception: err})
      cb(err, false)

    } else {

      console.log('Processed all active flights')

      var allFlghtObj = new allFlight({
        Timestamp: timeStamp,
        Year: year,
        Month: month,
        Day: day,
        Hour: hour,
        Minute: minute,
        FeatureCollection: allFlights
      })

      saveAllFlights(allFlghtObj, COSMOS_ALL_FLIGHT_SAVE, () => {
         /* We're done here, right? */
         cb(null, true)
      })



      
      
      // var airborne = []
      // console.log(timeStamp)
      // var countryFlights = []

      // Object.keys(flights).map(locale => {
      //   airborne.push({'country':flights[locale][0].properties.Country, 'total' : flights[locale].length})

      //   var featureCollection = {type: 'FeatureCollection', 'features':flights[locale]}

      //   var cFlight = new countryFlight({
      //     Country: locale,
      //     Timestamp: current,
      //     Year: year,
      //     Month: month,
      //     Day: day,
      //     Hour: hour,
      //     Minute: minute,
      //     FeatureCollection: featureCollection
      //   })

      //   countryFlights.push(cFlight)

      // });




      // saveDBCountryFlights(countryFlights, COSMOS_COUNTRY_FLIGHT_SAVE, () => {

      //   /* Sort by countries with the most airborne flights and then stringify */
      //   airborne.sort( (a,b) => { return ( a.total < b.total ) ? 1 : ( ( b.total < a.total ) ? -1 : 0 ) } )
      //   var inair = JSON.stringify(airborne)
      //   saveToRedis('inair', inair, 'RedisFlightInAirSet', ()=>{

      //     /* We're done here, right? */
      //     cb(null, true)

      //   })

      // })





    }
  })
 
}

function saveDBCountryFlights(countryFlights, event, cb){
  async.each(countryFlights, (country, fin) => {
    country.save()
    .then( (doc) => { 
      telemetry.trackEvent({name: event})
      fin() } )
    .catch()

  }, (error)=> {
    console.log('finishing the country save to db')
    cb()
  })
}

function saveAllFlights(data, event, cb){
  data.save()
    .then( (doc)=> { 
      telemetry.trackEvent({name: event})
      cb() } )
    .catch()
}

function saveToRedis(key, data, event, cb){
  client.set(key, data, event, (err, reply)=>{
    telemetry.trackEvent({name: event})
    cb()
  })
  
}


module.exports = router;
