var applicationInsights = require('applicationinsights'),
    async = require('async'),
    cacheServiceUri = process.env.CACHE_SERVICE_URI,
    dataServiceUri = process.env.DATA_SERVICE_URI,
    express = require('express'),
    fs = require('fs'),
    jsonResponse = require('../models/express/jsonResponse'),
    moment = require('moment'),
    momentDuration = require('moment-duration-format'),
    path = require('path'),
    router = express.Router(),
    rp = require('request-promise'),
    st = require('../models/util/status'),
    site = require('../models/util/site'),
    weatherCities1000 = require('../resources/accuweather_top_1000_cities_us'),
    weatherTop1000US = require('../resources/aw_top1000_cities_pk'),
    weatherCities25 = require('../resources/aw_top25_cities_us'),
    
    styleExample = require('../resources/styleExample')
    


var telemetry = applicationInsights.defaultClient

const routename = path.basename(__filename).replace('.js', ' default endpoint for ' + site.name)

const weatherIconBaseUrl = 'https://developer.accuweather.com/sites/default/files/'

/* GET JSON :: Route Base Endpoint */
router.get('/', (req, res, next) => {
    jsonResponse.json( res, routename, st.OK.code, {} )
})

router.get('/status', (req, res, next) => {

    async.waterfall([
        (cb) => {
            getFromDataApi('get/latest/weather', (e, d) => {
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


/* GET JSON :: Current weather, top 100 cities worldwide */
router.get('/current', (req, res, next) => {
    // var event = 'no_cache'
    var Top1000
    console.log(path.join(__dirname,'../resources') + '/aw_top1000_geojson.txt')
    fs.readFileSync(path.join(__dirname,'../resources') + '/aw_top1000_geojson.txt', 'utf8', (err, data)=>{
        //Top1000 = data
        console.log(err)
        console.log(data)
    })
    var layers = []
    var layerBlue = {id: 'mapblue', textColor:'#37EEFF', features:[]}
    var layerYellow = {id: 'mapyellow', textColor:'#ffee38', features:[]}
    var layerYellowOrange = {id: 'mapyelloworange', textColor:'#ffc038', features:[]}
    var layerOrange = {id: 'maporange', textColor:'#ff8138', features:[]}
    var layerRed = {id: 'mapred', textColor:'#ff6338', features:[]}
    var layerBrightRed = {id: 'mapbrightred', textColor:'#ff0000', features:[]}


    // getWeatherCities((err,data) => {
        async.each(Top1000, (feature, callback) => {

            console.log('Temp is ', feature.properties.Temperature)
            var f = {}
            
                if (feature.properties.Temperature <= 65){
                    f = feature
                    f.properties['Temperature'] = f.properties.Temperature.toString() + '°'
                    layerBlue.features.push(f)
                    console.log('adding to blue')
                }
                if (feature.properties.Temperature > 65 && feature.properties.Temperature <= 72) {
                    f = feature
                    f.properties['Temperature'] = f.properties.Temperature.toString() + '°'
                    layerYellow.features.push(f)
                    console.log('adding to yellow')
                }
                if (feature.properties.Temperature > 72 && feature.properties.Temperature <= 79) {
                    f = feature
                    f.properties['Temperature'] = f.properties.Temperature.toString() + '°'
                    layerYellowOrange.features.push(f)
                    console.log('adding to yelloworange')
                }
                if (feature.properties.Temperature > 79 && feature.properties.Temperature <= 88) {
                    f = feature
                    f.properties['Temperature'] = f.properties.Temperature.toString() + '°'
                    layerOrange.features.push(f)
                    console.log('adding to orange')
                }
                if (feature.properties.Temperature > 88 && feature.properties.Temperature <= 97) {
                    f = feature
                    f.properties['Temperature'] = f.properties.Temperature.toString() + '°'
                    layerRed.features.push(f)
                    console.log('adding to red')
                }
                if (feature.properties.Temperature > 97){
                    f = feature
                    f.properties['Temperature'] = f.properties.Temperature.toString() + '°'
                    layerBrightRed.features.push(f)
                    console.log('adding to bright red')
                }
            

            callback()


        }, (err) => {
            if(!err){
                layers.push(layerBlue, layerYellow, layerYellowOrange, layerOrange, layerRed, layerBrightRed)
                jsonResponse.json( res, st.OK.msg, st.OK.code, layers)
            }
            
        })
        
    // })


    // getQuakesData( event, (err, data) => {
    //     if (err) { 
    //         jsonResponse.json( res, st.ERR.msg, st.ERR.code, err)
    //         next()
    //     }
    //     jsonResponse.json( res, st.OK.msg, st.OK.code, data)
    // })
})

router.get('/cityPositions', (req, res, next) => {
    var weatherLocales = []
    getWeatherCities((err, data) =>{
        async.each(data, (locale, callback) => {
            var lat = locale.geometry.coordinates[1]
            var long = locale.geometry.coordinates[0]
            getGeoPositionKey(lat, long, (e, d) => {
                locale.properties['AWPositionKey'] = d.Key
                weatherLocales.push(locale)
                callback()
            })
        }, (err) => {
            if(err){
                console.log(err)
                jsonResponse.json( res, st.ERR.msg, st.ERR.code, err)
            }else{
                console.log('all locales processed successfully')
                jsonResponse.json( res, st.OK.msg, st.OK.code, weatherLocales)
            }
        })
    })
})

/* GET JSON :: All Weather - db version */
router.get('/latest', (req, res, next) => {

    async.waterfall([
        (cb) => {
            getFromDataApi('get/latest/weather', (e, d) => {
                cb(null, d.payload[0].Timestamp)
            })
        },
        (timestamp, cb) => {
            getFromDataApi('get/weather/' + timestamp, (e, d) => {
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
            getWeatherTopCities(150, (e,d) => {
                cb(null, d)
            })
        },
        (data, cb) => {
            var currenttime = moment().format('YYYYMMDDHHmm').toString()
            buildGeoJson(data, (e,d) => {
                cb(null, d, currenttime)
            })
        },
        (data, key, cb) => {
            saveToDataApi(key, data, (e,r) => { 
                cb(null, r)
            } )
        }
    ],(e,r) => {
        console.log(r)
        jsonResponse.json( res, st.OK.msg, st.OK.code, r)
    })

})

function getWeatherCities(cb) {
    console.log(weatherCities1000.length)

    // top 50 us cities by population
    var nationalWeatherCities = []
    async.each(weatherCities1000, (city, callback) => {

        /* create the GeoJSON feature for this city */
          nationalWeatherCities.push({ 
            type: 'Feature',
            properties: {
              Name:city.city,
              Population: city.population,
              Icon:'https://developer.accuweather.com/sites/default/files/01-s.png',
              Condition:'',
              Temperature:0
            },
            geometry: { 
              type: 'Point',
              coordinates:[ city.longitude, city.latitude ]
            }
          })
          callback()

    }, (err) => {
        if(err){
            console.log(err)
            cb(err, null)
        }else{
            console.log('all cities processed successfully')
            cb(null, nationalWeatherCities)
        }
    })
}

function getWeatherTopCities(count, cb){
    console.log('rp to accuweather:')

    // telemetry.trackEvent({name: event})
    var opt = { uri: 'http://dataservice.accuweather.com/currentconditions/v1/topcities/' + count + '?apikey=lfl6t1f1pQQ87ZMA8FdjRTemDJtgeiYe',
        headers: { 'User-Agent': 'Request-Promise' },
        json: true
    }
    
    try {
        rp(opt)
    .then(data => {
        cb(null, data)
    })
    .catch(err => {
        console.log(err)
        cb(err, null)
    })
        
    } catch (error) {
        console.log(error)
        cb(error, null)
    }
    
}

function buildGeoJson(data, cb){

    var geoJsonArray = []

    var layerBlue = {id: 'mapblue', textColor:'#37EEFF', features:[]},
        layerYellow = {id: 'mapyellow', textColor:'#ffee38', features:[]},
        layerYellowOrange = {id: 'mapyelloworange', textColor:'#ffc038', features:[]},
        layerOrange = {id: 'maporange', textColor:'#ff8138', features:[]},
        layerRed = {id: 'mapred', textColor:'#ff6338', features:[]},
        layerBrightRed = {id: 'mapbrightred', textColor:'#ff0000', features:[]}


    async.each(data, (city, callback) => {
        var weatherIcon = weatherIconBaseUrl.concat(city.WeatherIcon, '-s.png')
        if (city.WeatherIcon < 10) weatherIcon = weatherIconBaseUrl.concat('0', city.WeatherIcon, '-s.png')
        
        var feature = { 
            type: 'Feature',
            properties: {
              Name: city.EnglishName,
              Country: city.Country.EnglishName,
              Icon: weatherIcon,
              Condition: city.WeatherText,
              Temperature: city.Temperature.Imperial.Value
            },
            geometry: { 
              type: 'Point',
              coordinates:[ city.GeoPosition.Longitude, city.GeoPosition.Latitude ]
            }
        }
        
        feature.properties["Temperature"] = feature.properties["Temperature"].toString() + '°'

        if (city.Temperature.Imperial.Value  <= 65){
            layerBlue.features.push(feature)
            console.log('adding to blue')
        }
        if (city.Temperature.Imperial.Value > 65 && city.Temperature.Imperial.Value <= 72) {
            layerYellow.features.push(feature)
            console.log('adding to yellow')
        }
        if (city.Temperature.Imperial.Value > 72 && city.Temperature.Imperial.Value <= 79) {
            layerYellowOrange.features.push(feature)
            console.log('adding to yelloworange')
        }
        if (city.Temperature.Imperial.Value > 79 && city.Temperature.Imperial.Value <= 88) {
            layerOrange.features.push(feature)
            console.log('adding to orange')
        }
        if (city.Temperature.Imperial.Value > 88 && city.Temperature.Imperial.Value <= 97) {
            layerRed.features.push(feature)
            console.log('adding to red')
        }
        if (city.Temperature.Imperial.Value > 97){
            layerBrightRed.features.push(feature)
            console.log('adding to bright red')
        }
        
        callback()

    }, (err) => {
        if(err){
            cb(err, null)
        }else{
            console.log('all locales processed successfully')
            geoJsonArray.push(layerBlue, layerYellow, layerYellowOrange, layerOrange, layerRed, layerBrightRed)
            cb(null, geoJsonArray)
        }
    })
}

function getGeoPositionKey(lat,long, cb){

    // &q=40.7127837%2C-74.0059413&toplevel=true
    var query = "&q=" + lat + "%2C" + long + "&toplevel=true"

    var url = accuweatherBaseUrl.concat(positionSearchPath, accuweatherApiKey, query)
    console.log(url)
    var opt = { 
        uri: url,
        headers: { 'User-Agent': 'Request-Promise' },
        json: true
    }

    rp(opt)
      .then(out => {
          console.log(out)
        cb(null, out)
    })
    .catch(err => {
        console.log(err)
        cb(err, null)
    })


    //http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=V7jqpMmCwAZMLQfrEGmMKz5oSepCeeh8&q=40.7127837%2C-74.0059413&toplevel=true
}

function getConditionsForKey(key, cb){
    //http://dataservice.accuweather.com/currentconditions/v1/347625?apikey=lfl6t1f1pQQ87ZMA8FdjRTemDJtgeiYe
    // &q=40.7127837%2C-74.0059413&toplevel=true
    var query = key +'?' + accuweatherApiKey

    var url = accuweatherBaseUrl.concat(conditionSearchPath, query)
    console.log(url)
    var opt = { 
        uri: url,
        headers: { 'User-Agent': 'Request-Promise' },
        json: true
    }

    rp(opt)
      .then(out => {
        //console.log(out)
        cb(null, out)
    })
    .catch(err => {
        //console.log(err)
        cb(err, null)
    })


    //http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=V7jqpMmCwAZMLQfrEGmMKz5oSepCeeh8&q=40.7127837%2C-74.0059413&toplevel=true
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
    var url = dataServiceUri + 'save/weather/' + timestamp
    
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



module.exports = router