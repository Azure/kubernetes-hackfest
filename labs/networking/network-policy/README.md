# Lab: Configure Network Policy

Coming soon.

## Prerequisites

* Complete previous labs for [AKS](../../create-aks-cluster/README.md) and [ACR](../../build-application/README.md).

#### Kubernetes and Kube-Router Overview
Kubernetes networking has following security model:
* For every pod by default ingress is allowed, so a pod can receive traffic from any one
* Default allow behaviour can be changed to default deny on per namespace basis. When a namespace is configured with isolation tye of DefaultDeny no traffic is allowed to the pods in that namespace
* when a namespace is configured with DefaultDeny isolation type, network policies can be configured in the namespace to whitelist the traffic to the pods in that namespace

Kubernetes network policies are application centric compared to infrastructure/network centric standard firewalls. There are no explicit CIDR or IP used for matching source or destination IP’s. Network policies build up on labels and selectors which are key concepts of Kubernetes that are used to organize (for e.g all DB tier pods of app) and select subsets of objects.

In this lab we will use Kube-Router for Network Policy Management. Kube-Router will use ipsets with iptables to ensure your firewall rules have as little performance impact on your cluster as possible.

#### Install Kube-Router
1. Run the following commands to deploy kube-router on your cluster
   ```
   cd kubernetes-hackfest/labsnetworking/network-policy
   ```
   ```bash
   kubectl apply -f kube-router.yaml
   ```
2. Check to verify kube-router pods are running
   ```bash
   kubectl get daemonset -n kube-system -l k8s-app=kube-router
   ```

## Docs / References

* ?


#### Next Lab: [Monitoring and Logging](labs/monitoring-logging/README.md)