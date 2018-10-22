const express = require('express');
const router = express.Router();
const k8s = require('@kubernetes/client-node');
var k8sApi;

if (process.env.K8S_LOCALE != 'CLUSTER') {
  k8sApi = k8s.Config.defaultClient();
} else {
  let kc = new k8s.KubeConfig();
  kc.loadFromCluster();

  k8sApi = new k8s.Core_v1Api(kc.getCurrentCluster()['server']);
  k8sApi.setDefaultAuthentication(kc);
}

/* GET ALL NODES */
router.get('/', function(req, res, next) {
  var nodes = [];
  k8sApi.listNode().then(out => {
    out.response.body.items.forEach(function(node, index) {
      nodes.push({
        name: node.metadata.name,
        machineAType: node.metadata.labels['beta.kubernetes.io/instance-type'],
        addresses: node.status.addresses
      });
      if (index === out.response.body.items.length - 1) {
        res.json(nodes).status(200);
      }
    });
  });
});

module.exports = router;
