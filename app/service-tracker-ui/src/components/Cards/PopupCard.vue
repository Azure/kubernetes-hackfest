<template>
    <section card>
        <div class="card border-primary">
            <div class="card-body">
                <h5 class="card-title">{{title}}</h5><i class="fas fa-times closePop"></i>
            </div>
            <ul class="list-group">
                <li class="list-group-item pl-3" v-for="detail in details" :key="detail.name"><small class="text-muted">{{detail.name}}</small>{{detail.value}}</li>
            </ul>
        </div>
    </section>
</template>
<script>
export default {
  name: "popup-card",
  props: {
      title: String,
      details: []
  },
  data: function () {
  }
};
</script>
<style>
</style>