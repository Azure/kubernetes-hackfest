<template>
  <div>
    <div class="row">
          <div class="col-md-6 col-xl-3">
            <h6>SERVICE STATUS</h6>
          </div>
    </div>

    <!--Service Status-->
    <div class="row">
      <!-- Add various services here -->
      <div class="col-md-3 col-xl-3">
        <object-card
          obj-name="Flight Service"
          obj-type="Microservice"
          obj-status-icon="fa fa-adjust fa-lg text-warning"
          obj-status="WARNING"
        />
      </div>

      <div class="col-md-3 col-xl-3">
        <object-card
          obj-name="Earthquake Service"
          obj-type="Microservice"
          obj-status-icon="fa fa-adjust fa-lg text-warning"
          obj-status="WARNING"
        />
      </div>

      <div class="col-md-3 col-xl-3">
        <object-card
          obj-name="Weather Service"
          obj-type="Microservice"
          obj-status-icon="fa fa-adjust fa-lg text-warning"
          obj-status="WARNING"
        />
      </div>
    </div>

    <!--Pod cards-->
    <div class="row">
      <div class="col-md-6 col-xl-3" v-for="pod in podCards" :key="pod.objName">
        <object-card 
          :obj-name="pod.objName"
          :obj-type="pod.objType"
          :obj-info-array="pod.objInfoArray"
          :obj-status-icon="pod.objStatusIcon"
          :obj-status="pod.objStatus"/>
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

    <!-- Stats cards
    <div class="row">
      <div class="col-md-6 col-xl-3" v-for="stats in statsCards" :key="stats.title">
        <stats-card>
          <div class="icon-big text-center" :class="`icon-${stats.type}`" slot="header">
            <i :class="stats.icon"></i>
          </div>
          <div class="numbers" slot="content">
            <p>{{stats.title}}</p>
            {{stats.value}}
          </div>
          <div class="stats" slot="footer">
            <i :class="stats.footerIcon"></i> {{stats.footerText}}
          </div>
        </stats-card>
      </div>


    </div>

    Charts
    <div class="row">

      <div class="col-12">
        <chart-card title="Users behavior"
                    sub-title="24 Hours performance"
                    :chart-data="usersChart.data"
                    :chart-options="usersChart.options">
          <span slot="footer">
            <i class="ti-reload"></i> Updated 3 minutes ago
          </span>
          <div slot="legend">
            <i class="fa fa-circle text-info"></i> Open
            <i class="fa fa-circle text-danger"></i> Click
            <i class="fa fa-circle text-warning"></i> Click Second Time
          </div>
        </chart-card>
      </div>

      <div class="col-md-6 col-12">
        <chart-card title="Email Statistics"
                    sub-title="Last campaign performance"
                    :chart-data="preferencesChart.data"
                    chart-type="Pie">
          <span slot="footer">
            <i class="ti-timer"></i> Campaign set 2 days ago</span>
          <div slot="legend">
            <i class="fa fa-circle text-info"></i> Open
            <i class="fa fa-circle text-danger"></i> Bounce
            <i class="fa fa-circle text-warning"></i> Unsubscribe
          </div>
        </chart-card>
      </div>

      <div class="col-md-6 col-12">
        <chart-card title="2015 Sales"
                    sub-title="All products including Taxes"
                    :chart-data="activityChart.data"
                    :chart-options="activityChart.options">
          <span slot="footer">
            <i class="ti-check"></i> Data information certified
          </span>
          <div slot="legend">
            <i class="fa fa-circle text-info"></i> Tesla Model S
            <i class="fa fa-circle text-warning"></i> BMW 5 Series
          </div>
        </chart-card>
      </div>

    </div> -->

  </div>
</template>
<script>
import { ObjectCard } from "@/components/index";
// import { StatsCard, ChartCard, ObjectCard } from "@/components/index";
//import Chartist from 'chartist';
export default {
  components: {
    ObjectCard
    // StatsCard,
    // ChartCard
  },
  /**
   * Chart data used to render stats, charts. Should be replaced with server data
   */
  data() {
    return {
      podCards:[],
      flightCards:[],
      // statsCards: [
      //   {
      //     type: "warning",
      //     icon: "ti-server",
      //     title: "Capacity",
      //     value: "105GB",
      //     footerText: "Updated now",
      //     footerIcon: "ti-reload"
      //   },
      //   {
      //     type: "success",
      //     icon: "ti-wallet",
      //     title: "Revenue",
      //     value: "$1,345",
      //     footerText: "Last day",
      //     footerIcon: "ti-calendar"
      //   },
      //   {
      //     type: "danger",
      //     icon: "ti-pulse",
      //     title: "Errors",
      //     value: "23",
      //     footerText: "In the last hour",
      //     footerIcon: "ti-timer"
      //   },
      //   {
      //     type: "info",
      //     icon: "ti-twitter-alt",
      //     title: "Followers",
      //     value: "+45",
      //     footerText: "Updated now",
      //     footerIcon: "ti-reload"
      //   }
      // ],
      // usersChart: {
      //   data: {
      //     labels: [
      //       "9:00AM",
      //       "12:00AM",
      //       "3:00PM",
      //       "6:00PM",
      //       "9:00PM",
      //       "12:00PM",
      //       "3:00AM",
      //       "6:00AM"
      //     ],
      //     series: [
      //       [287, 385, 490, 562, 594, 626, 698, 895, 952],
      //       [67, 152, 193, 240, 387, 435, 535, 642, 744],
      //       [23, 113, 67, 108, 190, 239, 307, 410, 410]
      //     ]
      //   },
      //   options: {
      //     low: 0,
      //     high: 1000,
      //     showArea: true,
      //     height: "245px",
      //     axisX: {
      //       showGrid: false
      //     },
      //     lineSmooth: Chartist.Interpolation.simple({
      //       divisor: 3
      //     }),
      //     showLine: true,
      //     showPoint: false
      //   }
      // },
      // activityChart: {
      //   data: {
      //     labels: [
      //       "Jan",
      //       "Feb",
      //       "Mar",
      //       "Apr",
      //       "Mai",
      //       "Jun",
      //       "Jul",
      //       "Aug",
      //       "Sep",
      //       "Oct",
      //       "Nov",
      //       "Dec"
      //     ],
      //     series: [
      //       [542, 543, 520, 680, 653, 753, 326, 434, 568, 610, 756, 895],
      //       [230, 293, 380, 480, 503, 553, 600, 664, 698, 710, 736, 795]
      //     ]
      //   },
      //   options: {
      //     seriesBarDistance: 10,
      //     axisX: {
      //       showGrid: false
      //     },
      //     height: "245px"
      //   }
      // },
      // preferencesChart: {
      //   data: {
      //     labels: ["62%", "32%", "6%"],
      //     series: [62, 32, 6]
      //   },
      //   options: {}
      // }
    };
  },
  created() {
    //const myRequest = new Request('/api/pods')
    // fetch(myRequest)
    // .then((response) => { 
    //   return response.json()
    // })
    // .then((data) => {
    //   console.log(data)
    //   this.statsCards.length = 0
    //   var podIp = {name: "Pod IP", value: data[0].podIP + ":" + data[0].ports.substring(6)}
    //   var hostIp = {name: "Host IP", value: data[0].hostIP}
    //   var statusIcon = "fa fa-adjust fa-lg text-warning" // pending or other
    //   if (data[0].status.toUpperCase() === "RUNNING"){
    //     statusIcon = "fa fa-check-circle fa-lg text-success"
    //   }
    //   var pod = {
    //     objName: data[0].name,
    //     objType: "pod",
    //     objInfoArray: [podIp, hostIp],
    //     objStatusIcon : statusIcon,
    //     objStatus: data[0].status.toUpperCase()
    //   };
    //   this.podCards.push(pod)


    // })

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


  },
  mounted(){
    
  }
};
</script>
<style>
</style>
