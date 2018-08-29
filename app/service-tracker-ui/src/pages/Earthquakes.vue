<template>
  <section>
    <div class="row">
      <div class="col-md-6 col-xl-3">
        <h6>EARTHQUAKE MAP</h6>
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
      center: [-130.915, 9.15],
      zoom: 2
    })

    map.on('load', function() {
      vm.loadQuakes()
    })

    //** show current map center lat lng on page **//
    map.on('moveend', function(e) {
      vm.latitude = map.getCenter().lat
      vm.longitude = map.getCenter().lng
      // console.log (map.getCenter())
    })

  },
  methods: {
    filterItems(type, data, cb){
      var output = {}
      output['type'] = type
      switch(type) {
          case 'yellow':
              output['data'] = data.filter(quake => quake.properties.mag < 5)
              output['icon'] = 'eq-yellow'
              output['size'] = .35
              cb(output)
              break
          case 'orange':
              output['data'] = data.filter(quake => (quake.properties.mag >= 5 && quake.properties.mag <5.4))
              output['icon'] = 'eq-orange'
              output['size'] = .4
              cb(output)
              break
          case 'red':
              output['data'] = data.filter(quake => quake.properties.mag >= 5.4)
              output['icon'] = 'eq-red'
              output['size'] = .5
              cb(output)
              break
          default:
              break
      }

    },
    addLayer(obj){
      map.addLayer(
          {
            'id': obj.type,
            'type': 'symbol',
            'source': {
              'type': 'geojson',
              'data': {
                  'type': 'FeatureCollection',
                  'features': obj.data
              }
            },
            'layout': {
              'icon-image': obj.icon,
              'icon-size': obj.size,
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

      map.on('click', obj.type, function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice()
        var detail = e.features[0].properties
        var header = '<h3>Magnitude: ' + detail.mag + '</h3><ul>'
        var eventTime = new Date(detail.time)
        var place = '<li><strong>Location:</strong>&nbsp;' + detail.place + '</li>'
        var dated = '<li><strong>Date/Time:</strong>&nbsp;' + eventTime + '</li>'
        var end = '<ul>'
        var html = header.concat(place, dated, end)

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(html)
            .addTo(map)
    })
    },
    loadQuakes() {
      let payload
      const myRequest = new Request('/api/quakes/current')

      fetch(myRequest)
      .then((response) => { 
        return response.json() })
      .then((data) => {
        payload = data.payload
        vm.filterItems('red', payload, function(red){
          vm.addLayer(red)
        })
        vm.filterItems('orange', payload, function(orange){
          vm.addLayer(orange)
        })
        vm.filterItems('yellow', payload, function(yellow){
          vm.addLayer(yellow)
        })
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

// .mapboxgl-popup-close-button{
//   font-size: 25px;
//   position: absolute;
//   right: -3px;
//   top: -3px;
//   color: #1de9b6;
//   border: 0;
//   cursor: pointer;
//   background-color: transparent;
// }

// .mapboxgl-popup-content{
//   background-color: rgba(0, 0, 0, 0.9);
//   border-radius: 5px;
//   border: 1px solid rgba(115, 167, 160, 1);
//   color: #FFF;
//   font-size: 14px;
//   padding: 18px;
//   position: relative;
//   width: 300px;
//   -webkit-box-shadow: 0 4px 4px rgba(0, 0, 0, 0.3);
//   box-shadow: 0 4px 4px rgba(0, 0, 0, 0.3);
//   padding: 15px;
//   pointer-events: auto;
// }
// .mapboxgl-popup-content ul {
//   padding-left: 0px;
// }

// .mapboxgl-popup-content li{
//   padding:3px;
//   list-style:none;
// }

// .mapboxgl-popup-content h2{
//   padding-bottom:18px;
//   margin-top: 4px;
//   font-size: 28px;
// }
// .mapboxgl-popup-content ul li strong {
//   color: #1de9b6;
//   font-size: 16px;
// }

// .mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
//   -webkit-align-self: center;
//   align-self: center;
//   border-bottom: none;
//   border-top-color: #777;
// }

</style>
