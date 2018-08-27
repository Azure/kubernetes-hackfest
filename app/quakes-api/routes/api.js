var applicationInsights = require('applicationinsights'),
    async = require('async'),
    cacheServiceUri = process.env.CACHE_SERVICE_URI,
    dataServiceUri = process.env.DATA_SERVICE_URI,
    express = require('express'),
    jsonResponse = require('../models/express/jsonResponse'),
    moment = require('moment'),
    path = require('path'),
    router = express.Router(),
    rp = require('request-promise'),
    st = require('../models/util/status'),
    site = require('../models/util/site')

var telemetry = applicationInsights.defaultClient
const routename = path.basename(__filename).replace('.js', ' default endpoint for ' + site.name)

/* GET JSON :: Route Base Endpoint */
router.get('/', (req, res, next) => {
    jsonResponse.json( res, routename, st.OK.code, {} )
})

/* GET JSON :: All quakes in Air - No cache - No db version */
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


/* GET JSON :: All Flights in Air - db version */
router.get('/latest', (req, res, next) => {

    async.waterfall([
        (cb) => {
            // get latest timestamp from DB
            console.log('getting latest timestamp of quakes')
            var path = 'get/latest/quakes'
            getFromDataApi(path, (e, d) => {
                cb(null, d.payload[0].Timestamp)
            })
        },
        (timestamp, cb) => {
            // use latest timestamp for flights from DB
            console.log('getting latest quakes based on timestamp')
            var path = 'get/quakes/' + timestamp
            getFromDataApi(path, (e, d) => {
                cb(null, d.payload.FeatureCollection)
            })

        }
    ],(e,r) => {
        jsonResponse.json( res, st.OK.msg, st.OK.code, r)
    })

})

router.get('/refresh', (req, res, next) => {
    
    async.waterfall([
        (cb) => {
            console.log('getting quakes data')
            getQuakesData('refreshquakesdata', (err, data) => {
                cb(null, data)
            })
        },
        (data, cb) => {
            console.log('got quakes data with ', data.metadata.count, ' quakes')
            var currenttime = moment.unix(data.metadata.generated).format('YYYYMMDDHHmm').toString()
            cb(null, data, currenttime)
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
            console.log('posted data item - quakes')
            jsonResponse.json( res, st.OK.msg, st.OK.code, r)
    })

})


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



module.exports = router