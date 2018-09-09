var applicationInsights = require('applicationinsights'),
    async = require('async'),
    express = require('express'),
    jsonResponse = require('../models/express/jsonResponse'),
    moment = require('moment'),
    momentDuration = require('moment-duration-format'),
    mongoose = require('mongoose'),
    path = require('path'),
    router = express.Router(),
    st = require('../models/util/status'),
    site = require('../models/util/site')

/* Models and Telemetry event info */
var Flights = mongoose.model('Flights'),
    LatestFlight = mongoose.model('LatestFlight'),
    Quakes = mongoose.model('Quakes'),
    LatestQuake = mongoose.model('LatestQuake'),
    Weather = mongoose.model('Weather'),
    LatestWeather = mongoose.model('LatestWeather')

var telemetry = applicationInsights.defaultClient

const routename = path.basename(__filename).replace('.js', ' default endpoint for ' + site.name)

/* GET JSON :: Route Base Endpoint */
router.get('/', (req, res, next) => {
    jsonResponse.json( res, routename, st.OK.code, {} )
})

router.get('/status', (req, res, next) => {

    jsonResponse.json( res, routename, st.OK.code, {
        uptime: moment.duration(Math.floor(process.uptime())*1000).format('h [hrs], m [min]')
    })
    
})

router.get('/get/flights/:timestamp', (req, res, next) => {
    getFlightsFromDb(req.params.timestamp, (err, result) => {
        jsonResponse.json( res, 'success', st.OK.code, result )
    })
})

router.get('/get/quakes/:timestamp', (req, res, next) => {
    getQuakesFromDb(req.params.timestamp, (err, result) => {
        jsonResponse.json( res, 'success', st.OK.code, result )
    })
})

router.get('/get/weather/:timestamp', (req, res, next) => {
    getWeatherFromDb(req.params.timestamp, (err, result) => {
        jsonResponse.json( res, 'success', st.OK.code, result )
    })
})

router.get('/get/latest/flights', (req, res, next) => {
    getLatestFromDb(LatestFlight, (err, data) => {
        jsonResponse.json( res, 'success', st.OK.code, data )
    })
})

router.get('/get/latest/quakes', (req, res, next) => {
    getLatestFromDb(LatestQuake, (err, data) => {
        jsonResponse.json( res, 'success', st.OK.code, data )
    })
})
router.get('/get/latest/weather', (req, res, next) => {
    getLatestFromDb(LatestWeather, (err, data) => {
        jsonResponse.json( res, 'success', st.OK.code, data )
    })
})

router.post('/save/flights/:timestamp', (req, res, next) => {
    var latest = new LatestFlight({Timestamp: req.params.timestamp})
    var flights = new Flights({Timestamp: req.params.timestamp, FeatureCollection: req.body})

    async.waterfall([
        (cb) => {
            saveToDb(flights, (e,r) => {
                if (r) {
                    cb(null, {FlightCount:flights.FeatureCollection.length, Timestamp: flights.Timestamp})
                } 
            })
        },
        (flightDetail, cb) => {
            saveToDb(latest, (e,r) => {
                cb(e, flightDetail)
            })
        },
    ],(err,result) => {
        jsonResponse.json( res, 'success', st.OK.code, result )
    } )

} )

router.post('/save/quakes/:timestamp', (req, res, next) => {
    var latest = new LatestQuake({Timestamp: req.params.timestamp})
    var quakes = new Quakes({Timestamp: req.params.timestamp, FeatureCollection: req.body})

    async.waterfall([
        (cb) => {
            saveToDb(quakes, (e,r) => {
                if (r) {
                    cb(null, {QuakeCount:quakes.FeatureCollection.length, Timestamp: quakes.Timestamp})
                } 
            })
        },
        (quakeDetail, cb) => {
            saveToDb(latest, (e,r) => {
                cb(e, quakeDetail)
            })
        },
    ],(err,result) => {
        jsonResponse.json( res, 'success', st.OK.code, result )
    } )

} )

router.post('/save/weather/:timestamp', (req, res, next) => {
    var latest = new LatestWeather({Timestamp: req.params.timestamp})
    var weather = new Weather({Timestamp: req.params.timestamp, FeatureCollection: req.body})

    async.waterfall([
        (cb) => {
            saveToDb(weather, (e,r) => {
                if (r) {
                    cb(null, {WeatherLayerCount:weather.FeatureCollection.length, Timestamp: weather.Timestamp})
                } 
            })
        },
        (weatherDetail, cb) => {
            saveToDb(latest, (e,r) => {
                cb(e, weatherDetail)
            })
        },
    ],(err,result) => {
        jsonResponse.json( res, 'success', st.OK.code, result )
    } )

} )


function saveToDb(data, cb) {
    data.save()
        .then( (doc) => {
            cb(null, true) 
        } )
        .catch( (err) => {
            console.log(err)
            cb(err, false)
        } )
}

function getFromDb(obj, query, cb) {
    obj.find(query)
    .then( (doc) => {
        cb(null, doc)
    } )
    .catch( (err) => {
        console.log(err)
        cb(err, false)
    } )
}

function getFlightsFromDb(timestamp, cb){
    Flights
        .findOne({Timestamp: timestamp})
        .limit(1)
        .exec( (err, doc) => {
            cb(err, doc)
        })
}

function getQuakesFromDb(timestamp, cb){
    Quakes
        .findOne({Timestamp: timestamp})
        .limit(1)
        .exec( (err, doc) => {
            cb(err, doc)
        })
}

function getWeatherFromDb(timestamp, cb){
    Weather
        .findOne({Timestamp: timestamp})
        .limit(1)
        .exec( (err, doc) => {
            cb(err, doc)
        })
}

function getLatestFromDb(obj, cb) {
    obj
        .find()
        .sort({ Timestamp: -1 })
        .limit(1)
        .exec( (err, doc) => {
          cb(err, doc)
        })
}

module.exports = router