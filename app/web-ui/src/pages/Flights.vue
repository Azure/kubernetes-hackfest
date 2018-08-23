<template>
  <div>
    <div class="row">
      <div class="col-md-6 col-xl-3">
        <h6>FLIGHT MAP</h6>
      </div>
    </div>

    <!-- stat flight cards
    <div class="row">
      <div class="col-md-6 col-xl-3" v-for="fstat in flightCards" :key="fstat.objName">
        <object-card 
          :obj-name="fstat.objName"
          :obj-type="fstat.objType"
          :obj-sub-title="fstat.objSubTitle"
          :obj-sub-title-icon="fstat.objSubTitleIcon"
          :obj-info-array="fstat.objInfoArray"
          :obj-status-icon="fstat.objStatusIcon"
          :obj-status="fstat.objStatus"/>
      </div>
    </div> -->


    <div id='map'></div>
  </div>
</template>
<script>

/* eslint-disable */
import mapboxgl from 'mapbox-gl'
//import { ObjectCard } from "@/components/index"

let map
let vm

export default {
  data () {
    return {}
  },
  mounted() {
    vm = this
    mapboxgl.accessToken =
      'pk.eyJ1Ijoic29ub2pvcmVsIiwiYSI6ImNqaDl1Z25udzAybGMzNnBmbzl4NDBsam0ifQ.itgTNw7IhsoPTwkxiPz7Vw';
    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/sonojorel/cjhw8422i15g72snx2zsof3s1',
      center: [-79.995888, 40.440624],
      zoom: 2
    })

    map.on('load', function() {
      vm.loadFlights()
    })

    //** show current map center lat lng on page **//
    map.on('moveend', function(e) {
      vm.latitude = map.getCenter().lat
      vm.longitude = map.getCenter().lng
      // console.log (map.getCenter())
    })

  },
  methods: {
    addLayer(obj){
      map.addLayer(
          {
            'id': 'flights',
            'type': 'symbol',
            'source': {
              'type': 'geojson',
              'data': {
                  'type': 'FeatureCollection',
                  'features': obj
              }
            },
            'layout': {
              'icon-image': 'green-plane',
              'icon-size': .65,
              //'text-field': '{mag}',
              'icon-allow-overlap': true,
              'text-allow-overlap':true,
              // 'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
              //'text-size': 10,
              //'text-offset': [0, 0.6],
              //'text-anchor': 'top'
            },
            'paint':{
              // 'text-color':'#555',
              // 'text-halo-color':'rgba(255, 255, 255, .50)',
              // 'text-halo-width':1
            }
            })

      map.on('click', 'flights', function (e) {

        // FlightNumber":"SWA2926 ","Altitude":11277.6,"AirSpeed":265.44,"Heading":73.22
        var coordinates = e.features[0].geometry.coordinates.slice()
        var detail = e.features[0].properties
        var header = '<h2>Flight ' + detail.FlightNumber + '</h2><ul>'
        var alt = '<li>Altitude:&nbsp;<strong>' + detail.Altitude + ' </strong>meters</li>'
        var speed = '<li>Air Speed:&nbsp;<strong>' + detail.AirSpeed + ' </strong>meters/second</li>'
        var heading = '<li>Heading:&nbsp;<strong>' + detail.Heading + ' </strong>degrees</li>'
        var end = '<ul>'
        var html = header.concat(alt, speed, heading, end)

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(html)
            .addTo(map)
    })

    },
    loadFlights() {
      let payload

      // local proxy to middleware (see /config/index.js proxyTable)
      const myRequest = new Request('/api/flights/current')

      fetch(myRequest)
      .then((response) => { 
        return response.json() })
      .then((data) => {
        console.log(data)
        payload = data.payload
        vm.addLayer(payload)
      })
       
    }
  }
}
</script>
<style lang='scss'>
@import url('https://api.tiles.mapbox.com/mapbox-gl-js/v0.45.0/mapbox-gl.css');


html {
    height: 100%;
}
#map {
  width: 100%;
  height: 100%;
  min-height: 480px;
}
.maxheight{
  height: 100%;
 }

.mapboxgl-popup-close-button{
  font-size: 20px;
  position: absolute;
  right: 5px;
  top: 1px;
  color:#1de9b6;
  border: 0;
  cursor: pointer;
  background-color: transparent;
}

.mapboxgl-popup-content{
    background-color: rgba(0, 0, 0, 0.9);
    border-radius: 5px;
    border: 1px solid rgba(115, 167, 160, 1);
    color: #FFF;
    font-size: 14px;
    padding: 18px;
    position: relative;
    width: 300px;
    -webkit-box-shadow: 0 4px 4px rgba(0, 0, 0, 0.3);
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.3);
    padding: 15px;
    pointer-events: auto;
}

.mapboxgl-popup-content li{
  padding:3px;
  list-style:none;
}

.mapboxgl-popup-content h2{
  padding-bottom:18px;
}

.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
    -webkit-align-self: center;
    align-self: center;
    border-bottom: none;
    border-top-color: #777;
}

</style>
