const async = require('async');
const express = require('express');
const router = express.Router();
const k8s = require('@kubernetes/client-node');

if (process.env.K8S_LOCALE != 'CLUSTER') {
  k8sApi = k8s.Config.defaultClient();
} else {
  let kc = new k8s.KubeConfig();
  kc.loadFromCluster();

  k8sApi = new k8s.Core_v1Api(kc.getCurrentCluster()['server']);
  k8sApi.setDefaultAuthentication(kc);
}

/* GET ALL PODS */
router.get('/', function(req, res, next) {
  var pods = [];
  k8sApi;
  k8sApi.listNamespacedPod('default').then(out => {
    out.response.body.items.forEach(function(pod, index) {
      pods.push({
        name: pod.metadata.name,
        containerImage: pod.spec.containers[0].image,
        ports:
          pod.spec.containers[0].ports[0].protocol +
          ' : ' +
          pod.spec.containers[0].ports[0].containerPort.toString(),
        status: pod.status.phase,
        podIP: pod.status.podIP,
        hostIP: pod.status.hostIP,
        env: pod.spec.containers[0].env
      });
      if (index === out.response.body.items.length - 1) {
        res.json(pods).status(200);
      }
    });
  });
});

module.exports = router;
