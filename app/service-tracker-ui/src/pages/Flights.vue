<template>
  <section>
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
    <div v-bind:style="{ height: mapHeight + 'px'}">
        <div id='map'></div>
    </div>
  </section>
</template>
<script>

/* eslint-disable */
import mapboxgl from 'mapbox-gl'
//import { ObjectCard } from "@/components/index"

let map
let vm

export default {
  data () {
    return {
      mapHeight:'100'
    }
  },
  created() {
    this.mapHeight = (window.innerHeight - 240)
  },
  mounted() {
    this.$nextTick(function() {
      window.addEventListener('resize', this.getWindowHeight);
      //Init
      this.getWindowHeight()
    })


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

        var popUpHtml = '<div class="card border-primary mb-3"><div class="card-header">FLIGHT DETAILS</div>'
        var popUpTitle ='<div class="card border-primary"><div class="card-body"><h5 class="card-title">{{FLIGHTNUMBER}}</h5></div>'
        var popUpDetails = '<ul class="list-group">'
        popUpDetails = popUpDetails.concat('<li class="list-group-item pl-3"><small class="text-muted">ALTITUDE</small></br>{{ALTITUDE}}</li>')
        popUpDetails = popUpDetails.concat('<li class="list-group-item pl-3"><small class="text-muted">AIR SPEED</small></br>{{AIRSPEEDMPH}}</li>')
        popUpDetails = popUpDetails.concat('</ul>')
        var popUpEnd = '</div>'

        // FlightNumber":"SWA2926 ","Altitude":11277.6,"AirSpeed":265.44,"Heading":73.22
        var coordinates = e.features[0].geometry.coordinates.slice()
        var detail = e.features[0].properties
        // var header = '<h2>Flight ' + detail.FlightNumber + '</h2><ul>'
        // var alt = '<li>Altitude:<br/><strong>' + detail.Altitude + ' </strong>meters</li>'
        // var altFeet = '<li>Altitude:<br/><strong>' + detail.Altitude*3.2808 + ' </strong>feet</li>'
        // var speed = '<li>Air Speed:<br/><strong>' + detail.AirSpeed + ' </strong>meters/second</li>'
        // var speedMph = '<li>Air Speed:<br/><strong>' + Math.round(detail.AirSpeed * 3600 / 1610.3*1000)/1000  + ' </strong>MPH</li>'
        // var heading = '<li>Heading:<br/><strong>' + detail.Heading + ' </strong>degrees</li>'
        // var end = '<ul>'
        // var html = header.concat(alt, altFeet, speed, speedMph, heading, end)

        popUpTitle = popUpTitle.replace('{{FLIGHTNUMBER}}', detail.FlightNumber)
        popUpDetails = popUpDetails.replace('{{ALTITUDE}}', ((Math.round((detail.Altitude*3.2808))*10)/10).toString() + ' FEET')
        popUpDetails = popUpDetails.replace('{{AIRSPEEDMPH}}', Math.round(detail.AirSpeed * 3600 / 1610.3).toString() + ' MPH')
        var html =popUpTitle.concat(popUpDetails, popUpEnd)

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
       
    },
    getWindowHeight(event) {
        this.mapHeight = (window.innerHeight - 240)
      }
  }
}
</script>
<style lang='scss'>



#map {
  width: 100%;
  // min-height: 880px;
  min-height: 100%;
  height:auto !important; /* cross-browser */
  height: 100%; /* cross-browser */
}
.mapboxgl-popup-content{
  background: #06204d;
  box-shadow: none;
  padding: 8px 2px 0px 2px !important;
}
.mapboxgl-popup-content * .card {
  background: none !important;
}
.card {
  background: none !important;
  box-shadow: none !important;
  margin-bottom: 2px !important;
  color: #8bb837 !important;
}
h5.card-title{
  font-size: 22px!important;
  color:#8eb9ee !important;
  font-weight: 400 !important;
  padding: 10px 15px 0px 0px !important;
}
ul.list-group{
  background: #FFF !important;
}
li.list-group-item{
  padding: 4px 10px !important;
  background: none !important;
  border: none !important;
}
.mapboxgl-popup-tip {
  border-bottom-color: #06204d !important;
  border-top-color: #06204d !important;
}
.mapboxgl-popup-close-button {
    position: absolute;
    right: 0;
    top: 0;
    border: 0;
    border-radius: 0 0 0 0;
    color:#FFF;
    font-size: 18px;
    font-variant: small-caps;
    cursor: pointer;
    background-color: transparent;
}



</style>
