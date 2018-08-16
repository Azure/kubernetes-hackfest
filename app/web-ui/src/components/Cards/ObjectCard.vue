<template>
    <section objectCard class="obj-card">
        <div class="obj-card-body">
            <div class="row obj-row-header">
                <div class="col-10 obj-name">
                    <h5>{{objName}}</h5>
                    <small class="obj-type"><i :class="objSubTitleIcon"></i>&nbsp;&nbsp;{{objSubTitle}}</small>
                </div>
            </div>
            <!-- <div class="row">
                <div class="col-12 text-right">
                    <h6><small>details</small></h6>
                </div>
            </div> -->
            <div class="row obj-row-content">
                <div class="col-12">
                    <div class="table-responsive">
                        <table class="table table-hover obj-info-table">
                            <tbody>
                                <tr v-for="info in objInfoArray" :key="info.name">
                                    <td>
                                        {{info.name}}
                                    </td>
                                    <td>
                                        {{info.value}}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <!-- <div class="row">
                <div class="col-12 text-right">
                    <h6><small>status</small></h6>
                </div>
            </div> -->
            <div class="row obj-row-footer">
                <div class="col-1">
                    <i :class="objStatusIcon"></i>
                </div>
                <div class="col-8">
                    <span class="obj-status text-left">
                        {{objStatus}}
                    </span>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
export default {
  name: "object-card",
  props: {
    objName: String, // NAME OF THE OBJECT
    objSubTitle: String, // TYPE or SUBTITLE OF THE OBJECT (POD, NODE, ETC)
    objSubTitleIcon: String, // SMALL ICON (fa fa-xxxx) OF THE OBJECT
    objInfoArray: Array, // DETAIL NAME OF THE OBJECT (IP, HOSTIP, ETC)
    objStatusIcon: String, // ICON OF THE STATUS
    objStatusIconClass: String, // COLOR CLASS OF THE ICON OF THE STATUS
    objStatus: String, // ACTUAL STATUS NAME
    statusColor: "#28a745"
  }
};
</script>
<style>
</style>


