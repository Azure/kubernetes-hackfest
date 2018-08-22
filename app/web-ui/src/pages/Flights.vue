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
      //vm.loadFlights()
      console.log('map is loaded')
    })

    //** show current map center lat lng on page **//
    map.on('moveend', function(e) {
      vm.latitude = map.getCenter().lat
      vm.longitude = map.getCenter().lng
      // console.log (map.getCenter())
    })

  },
  created() {

    // flight stats

    // const flightOverview = new Request('/api/stats/inair')

    // fetch(flightOverview)
    // .then((response) => { 
    //   return response.json()
    // })
    // .then((data) => {
    //   var info = []
    //   for(var i=0; i<5; i++){
    //     info.push({name: data[i].country, value: data[i].total})
    //   }
    //   this.flightCards.push({
    //     objName: 'Top 5 Countries',
    //     objSubTitle: 'Flights in-air',
    //     objSubTitleIcon: 'fa fa-plane ',
    //     objInfoArray: info,
    //     objStatusIcon : 'fa fa-globe-americas fa-lg text-success',
    //     objStatus: 'Worldwide'
    //     })
    // })


  }
};
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
