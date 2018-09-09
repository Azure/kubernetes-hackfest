var applicationInsights = require('applicationinsights'),
    async = require('async'),
    cacheServiceUri = process.env.CACHE_SERVICE_URI,
    dataServiceUri = process.env.DATA_SERVICE_URI,
    express = require('express'),
    jsonResponse = require('../models/express/jsonResponse'),
    moment = require('moment'),
    momentDuration = require('moment-duration-format'),
    path = require('path'),
    router = express.Router(),
    rp = require('request-promise'),
    st = require('../models/util/status'),
    site = require('../models/util/site')

var telemetry = applicationInsights.defaultClient
const routename = path.basename(__filename).replace('.js', ' default endpoint for ' + site.name)

/**
 * 
 * HTTP GET /
 * default endpoint
 * 
 **/
router.get('/', (req, res, next) => {
    jsonResponse.json( res, routename, st.OK.code, {} )
})

/**
 * 
 * HTTP GET /current
 * JSON
 * NO CACHE
 * NO DATABASE
 * 
 **/
router.get('/current', (req, res, next) => {
    var querypath = 'all'
    var event = 'no_cache'
    getFlightData(querypath, event, (err, data) => {

        if (err) { 
            jsonResponse.json( res, st.ERR.msg, st.ERR.code, err)
            next()
        }

        buildGeoJson(data.states, (fmtError, flights) => {
            jsonResponse.json( res, st.OK.msg, st.OK.code, flights)
        })

    })
})

/**
 * 
 * HTTP GET /latest
 * JSON
 * USES DATABASE
 * NO CACHE
 * 
 **/
router.get('/latest', (req, res, next) => {

    async.waterfall([
        (cb) => {
            getFromDataApi('get/latest/flights', (e, d) => {
                cb(null, d.payload[0].Timestamp)
            })
        },
        (timestamp, cb) => {
            getFromDataApi('get/flights/' + timestamp, (e, d) => {
                cb(null, d.payload.FeatureCollection)
            })

        }
    ],(e,r) => {
        jsonResponse.json( res, st.OK.msg, st.OK.code, r)
    })

})

/**
 * 
 * HTTP GET /refresh
 * JSON
 * API CALL TO OPENSKY FOR FLIGHTS
 * SAVE TO DATABASE
 * NO CACHE
 * 
 **/
router.get('/refresh', (req, res, next) => {
    var querypath = 'all'
    
    async.waterfall([
        (cb) => {
            getFlightData(querypath, 'refreshflightdata', (err, data) => {
                cb(null, data)
            })
        },
        (data, cb) => {
            cb(null, data, moment.unix(data.time).format('YYYYMMDDHHmm').toString())
        },
        (data, timestamp, cb) => {
            buildGeoJson(data.states, (err, result) => { 
                cb(null, result, timestamp)
            })
        },
        (data, key, cb) => {
            // console.log('posted cache item - time ', key)
            //var flights = JSON.stringify(data.states)
            // var out = data.toString()

            saveToDataApi(key, data, (e,r) => { 
                cb(null, r)
            } )

        }], 
        (e, r) => {
            jsonResponse.json( res, st.OK.msg, st.OK.code, r)
    })

})

/** 
 * 
 * HTTP GET /status
 * JSON
 * ENDPOINT FOR DASHBOARD SERVICE STATUS
 * 
 **/
router.get('/status', (req, res, next) => {
var start;
var end;
    async.waterfall([
        (cb) => {
            getFromDataApi('get/latest/flights', (e, d) => {
                cb(null, d.payload[0].Timestamp)
            })
        }
    ],(e,r) => {

        // var dd = d.substring(0,8) + 'T'
        // var hh = r.substring(8,4)
        // console.log(dd)
        // console.log(hh)
        jsonResponse.json( res, routename, st.OK.code, {
            uptime: moment.duration(Math.floor(process.uptime())*1000).format('h [hrs], m [min]'), 
            latest:moment(r.substr(0, 8) + 'T' + r.substr(8)).format('MM/DD/YYYY HH:mm a')
        })
    })

})

/* OPENSKY API */
function getFlightData(querypath, event, cb) {
    console.log('rp to opensky:', querypath)

    // telemetry.trackEvent({name: event})
    var opt = { uri: 'https://opensky-network.org/api/states/' + querypath,
        headers: { 'User-Agent': 'Request-Promise' },
        json: true
    }
    
    rp(opt)
    .then(data => {
        cb(null, data)
    })
    .catch(err => {
        cb(err, null)
    })
    
}

/* CACHE API SET CALL */
function postCacheItem(key, data, event, cb){
    // telemetry.trackEvent({name: event})
    var url = cacheServiceUri + 'set/' + key
    var obj = JSON.stringify(data);
    console.log(url)
    console.log(obj)
    var opt = { method: 'POST',
        uri: url,
        headers: { 'User-Agent': 'Request-Promise' },
        body: obj,
        json: true
    }

    rp(opt)
      .then(out => {
        cb(null, out)
    })
    .catch(err => {
        cb(err, null)
    })
}

/* CACHE API GET CALL */
function getCacheItem(key, cb){
    var opt = { uri: cacheServiceUri + key,
        headers: { 'User-Agent': 'Request-Promise' },
        json: true
    }
    rp(opt)
    .then(data => {
      cb(null, data)
    })
    .catch(err => {
      cb(err, null)
    })
}

/* DB API SAVE CALL */
function saveToDataApi(timestamp, data, cb) {
    // telemetry.trackEvent({name: event})
    var url = dataServiceUri + 'save/flights/' + timestamp
    
    console.log(url)
    
    var opt = { method: 'POST',
        uri: url,
        headers: { 'User-Agent': 'Request-Promise' },
        body: data,
        json: true
    }

    rp(opt)
      .then(out => {
        cb(null, out)
    })
    .catch(err => {
        cb(err, null)
    })
}

/* DB API GET CALL */
function getFromDataApi(path, cb){
    var url = dataServiceUri + path
    
    console.log(url)
    
    var opt = { uri: url,
        headers: { 'User-Agent': 'Request-Promise' },
        json: true
    }

    rp(opt)
      .then(out => {
        cb(null, out)
    })
    .catch(err => {
        cb(err, null)
    })
}

/* BUILD THE GEOJSON ELEMENTS FROM FLIGHTS */
function buildGeoJson(flights, cb){
    var flightGeoJson = []
    var includedCountries = ['United States', 'Canada', 'Mexico']
    async.each(flights, (flight, callback) => {
        
        if ( flight[8] || flight[7] <= 0 || flight[5] === null  || flight[1].toString().replace(/ /g, '') === '' || flight[1].length <=6 || includedCountries.indexOf(flight[2]) === -1  ) {
            callback()
        } else {
      
      /* create the GeoJSON feature for this flight */
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

        /* Add this flights GeoJSON to the array */
        flightGeoJson.push(feature)
        callback()

    }

    }, (err) => {
        if(err){
            console.log(err)
            cb(err, null)
        }else{
            console.log('all flights processed successfully')
            cb(null, flightGeoJson)
        }
    })
}

module.exports = router