var applicationInsights = require('applicationinsights'),
    async = require('async'),
    jsonResponse = require('../models/express/jsonResponse'),
    st = require('../models/util/status'),
    site = require('../models/util/site'),
    express = require('express'),
    moment = require('moment'),
    path = require('path'),
    redis = require('redis'),
    redisHost = process.env.REDIS_HOST,
    redisPort = process.env.REDIS_PORT,
    router = express.Router(),
    rp = require('request-promise')

var telemetry = applicationInsights.defaultClient

const routename = path.basename(__filename).replace('.js', ' default endpoint for ' + site.name)

/* Redis Client */    



/* GET JSON :: Route Base Endpoint */
router.get('/', (req, res, next) => {
    jsonResponse.json( res, routename, st.OK.code, {} )
})

router.post('/set/:key', (req, res, next) => {
    console.log('setting key ', req.params.key)
    console.log('data:', req.body)
    var inputKey = req.params.key.toString()
    var inputBody = JSON.stringify(req.body)
    var client = redis.createClient(redisPort, redisHost)
    client.set(inputKey, inputBody, (err, reply) => {
        if (!err) jsonResponse.json(res, st.OK.msg, st.OK.code, reply)
    })



    // cacheSet(inputKey, inputBody, site.CACHE_SET_EVENT, (err, reply) => {
    //     if (!err) jsonResponse.json(res, st.OK.msg, st.OK.code, reply)
    // })
})

router.get('/get/:key', (req, res, next) => {
    cacheGet(req.params.key, site.CACHE_GET_EVENT, (err, data) => {
        if (!err) jsonResponse.json(res, st.OK.msg, st.OK.code, data)
    })
})


function cacheSet(key, data, event, callback){ 
    console.log('trying to set ', key)
    var client = redis.createClient(redisPort, redisHost)
    client.set(key, data, (err, reply) => {
        // telemetry.trackEvent({name:event})
        console.log(err)
        console.log(reply)
        callback(err, reply)
    })
}

function cacheGet(key, event, callback){
    var client = redis.createClient(redisPort, redisHost)
    client.get(key, (err, data) => {
        // telemetry.trackEvent({name:event})
        callback(err, data)
    })
}


module.exports = router