<template>
  <div>
    <div class="row">
          <div class="col-md-6 col-xl-3">
            <h6>FLIGHT INFO</h6>
          </div>
    </div>

    <!--stat flight cards-->
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
    </div>

  </div>
</template>
<script>
import { ObjectCard } from "@/components/index";
export default {
  components: {
    ObjectCard
  },
  /**
   * Chart data used to render stats, charts. Should be replaced with server data
   */
  data() {
    return {
      flightCards:[]
    };
  },
  created() {

    // flight stats

    const flightOverview = new Request('/api/stats/inair')

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
        objName: 'Top 5 Countries',
        objSubTitle: 'Flights in-air',
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
