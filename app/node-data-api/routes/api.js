var applicationInsights = require('applicationinsights'),
    async = require('async'),
    express = require('express'),
    jsonResponse = require('../models/express/jsonResponse'),
    moment = require('moment'),
    mongoose = require('mongoose'),
    path = require('path'),
    router = express.Router(),
    st = require('../models/util/status'),
    site = require('../models/util/site')

/* Models and Telemetry event info */
var Flights = mongoose.model('Flights'),
    Latest = mongoose.model('Latest')

var telemetry = applicationInsights.defaultClient

    const routename = path.basename(__filename).replace('.js', ' default endpoint for ' + site.name)

/* GET JSON :: Route Base Endpoint */
router.get('/', (req, res, next) => {
    jsonResponse.json( res, routename, st.OK.code, {} )
})

router.get('/get/flights/:timestamp', (req, res, next) => {
    getFlightsFromDb(req.params.timestamp, (err, result) => {
        jsonResponse.json( res, 'success', st.OK.code, result )
    })
})

router.get('/get/latest', (req, res, next) => {
    getLatestFromDb((err, data) => {
        console.log(err)
        jsonResponse.json( res, 'success', st.OK.code, data )
    })
})

router.post('/save/flights/:timestamp', (req, res, next) => {
    var latest = new Latest({Timestamp: req.params.timestamp})
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

function getLatestFromDb(cb) {
    Latest
        .find()
        .sort({ Timestamp: -1 })
        .limit(1)
        .exec( (err, doc) => {
          cb(err, doc)
        })
}

module.exports = router