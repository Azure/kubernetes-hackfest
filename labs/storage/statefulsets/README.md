# Lab: Stateful Sets

Coming soon.

## Prerequisites

* Complete previous labs:
    * [Azure Kubernetes Service](../create-aks-cluster/README.md)
    * [Build Application Components in Azure Container Registry](../build-application/README.md)
    * [Helm Setup and Deploy Application](../helm-setup-deploy/README.md)

## Instructions

1. Install MongoDB Statefulset with Helm

   Helm helps you manage Kubernetes applications — Helm Charts helps you define, install, and upgrade even the most complex Kubernetes application. Helm has a CLI component and a server side component called Tiller.

    * Helm should already be installed in the cluster from previous exercise, so we will just need to deploy the MongoDB Chart:

    ```bash
    cd ~/kubernetes-hackfest
    helm install stable/mongodb --name mongodb
    ```

    * Validate the install of mongodb:

    ```bash
    kubectl get pods //TODO
    ```
2. Connect to MongoDB Cluster
   

## Troubleshooting / Debugging

* 

## Docs / References

* 