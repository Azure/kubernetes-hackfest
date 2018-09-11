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
    var event = 'no_cache'
    getQuakesData( event, (err, data) => {
        if (err) { 
            jsonResponse.json( res, st.ERR.msg, st.ERR.code, err)
            next()
        }
        jsonResponse.json( res, st.OK.msg, st.OK.code, data)
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
            getFromDataApi('get/latest/quakes', (e, d) => {
                cb(null, d.payload[0].Timestamp)
            })
        },
        (timestamp, cb) => {
            getFromDataApi('get/quakes/' + timestamp, (e, d) => {
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
 * API CALL TO USGS FOR FLIGHTS
 * SAVE TO DATABASE
 * NO CACHE
 * 
 **/
router.get('/refresh', (req, res, next) => {
    
    async.waterfall([
        (cb) => {
            getQuakesData('refreshquakesdata', (err, data) => {
                cb(null, data)
            })
        },
        (data, cb) => {
            cb(null, data, moment(data.metadata.generated).format('YYYYMMDDHHmm').toString())
        },
        (data, timestamp, cb) => {
            cb(null, data.features, timestamp)
        },
        (data, key, cb) => {
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
    
    async.waterfall([
        (cb) => {
            getFromDataApi('get/latest/quakes', (e, d) => {
                cb(null, d.payload[0].Timestamp)
            })
        }
    ],(e,r) => {
        jsonResponse.json( res, routename, st.OK.code, {
            uptime: moment.duration(Math.floor(process.uptime())*1000).format('h [hrs], m [min]'), 
            latest:moment(r.substr(0, 8) + 'T' + r.substr(8)).format('MM/DD/YYYY HH:mm a')
        })
    })

})

/* USGS API */
function getQuakesData(event, cb) {
    console.log('rp to usgs:')

    // telemetry.trackEvent({name: event})
    var opt = { uri: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson',
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
    var url = dataServiceUri + 'save/quakes/' + timestamp
    
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

module.exports = router