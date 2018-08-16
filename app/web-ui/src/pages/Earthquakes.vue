<template>
  <div>
    <div class="row">
          <div class="col-md-6 col-xl-3">
            <h6>EARTHQUAKE INFO</h6>
          </div>
    </div>

    <!--stat flight cards-->
    <div class="row">
      <div class="col-md-6 col-xl-3" v-for="fstat in quakeCards" :key="fstat.objName">
        <object-card 
          :obj-name="fstat.objName"
          :obj-type="fstat.objType"
          :obj-sub-title="fstat.objSubTitle"
          :obj-sub-title-icon="fstat.objSubTitleIcon"
          :obj-info-array="fstat.objInfoArray"
          :obj-status-icon="fstat.objStatusIcon"
          :obj-status="fstat.objStatus"/>
      </div>
    </div>

  </div>
</template>
<script>
import { ObjectCard } from "@/components/index";
export default {
  components: {
    ObjectCard
  },
  data() {
    return {
      flightCards:[]
    };
  },
  created() {

    // flight stats

    const flightOverview = new Request('/api/quakes/stats')

    fetch(flightOverview)
    .then((response) => { 
      return response.json()
    })
    .then((data) => {
      var info = []
      for(var i=0; i<5; i++){
        info.push({name: data[i].country, value: data[i].total})
      }
      this.flightCards.push({
        objName: 'Biggest Earthquakes',
        objSubTitle: 'Last 30 days',
        objSubTitleIcon: 'fa fa-plane ',
        objInfoArray: info,
        objStatusIcon : 'fa fa-globe-americas fa-lg text-success',
        objStatus: 'Worldwide'
        })
    })


  },
  mounted(){
    
  }
};
</script>
<style>
</style>
