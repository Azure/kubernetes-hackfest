# Lab: Scaling Cluster and Applications

In this lab we will scale our application in various ways including scaling our deployment and the AKS cluster.

## Prerequisites

* Complete previous labs:
    * [Azure Kubernetes Service](../create-aks-cluster/README.md)
    * [Build Application Components in Azure Container Registry](../build-application/README.md)
    * [Helm Setup and Deploy Application](../helm-setup-deploy/README.md)

## Instructions

### Scale application manually

1. In this step, we will scale our deployment manually

    ```bash
    kubectl scale deployment service-tracker-ui -n hackfest --replicas=3
    ```

    > Note: the `replicas` parameter could be a part of the Helm chart and updated with a `helm upgrade` command. Based on our deployment method, this is more appropriate.

2. Validate the number of pods is now 3

### Horizontal Pod Autoscaler

The Kubernetes Horizontal Pod Autoscaler (HPA) automatically scales the number of pods in a replication controller, deployment or replica set based on observed CPU utilization (or, with custom metrics support, on some other application-provided metrics)

1. Review [hpa.yaml](./hpa.yaml)

2. Deploy the hpa resource

    ```bash
    kubectl apply -f labs/scaling/hpa.yaml -n hackfest
    ```

3. Validate the number of pods is now 5 which is our `minReplicas` set with the HPA

4. We could generate traffic to our front end enough to drive CPU utilization up and the HPA would auto-scale up to 10 max


### Cluster Scaling Manual 

1. Scaling is super simple and can be performed in the portal or via the CLI: 
   
    ```bash
    az aks scale --name $CLUSTERNAME --resource-group $RGNAME --node-count 5
    ```

2. Validate that 5 nodes are now available in the cluster


### Cluster Autoscaler (PREVIEW)

As resource demands increase, the cluster autoscaler allows your cluster to grow to meet that demand based on constraints you set. The cluster autoscaler (CA) does this by scaling your agent nodes based on pending pods.

> Note: The AKS Cluster Autoscaler is currently in preview. 

1. Follow the steps in this article to configure autoscaling. * [Cluster Autoscaler on Azure Kubernetes Service](https://docs.microsoft.com/en-us/azure/aks/autoscaler)


## Troubleshooting / Debugging



## Docs / References

* [Horizontal Pod Autoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale)
