# Lab: Istio

Istio is an open platform for providing a uniform way to integrate microservices, manage traffic flow across microservices, enforce policies and aggregate telemetry data. Istio's control plane provides an abstraction layer over the underlying cluster management platform, such as Kubernetes, Mesos, etc.

## Prerequisites

* Complete previous labs:
    * [Azure Kubernetes Service](../../create-aks-cluster/README.md)
    * [Build Application Components in Azure Container Registry](../../build-application/README.md)
    * [Helm Setup and Deploy Application](../../helm-setup-deploy/README.md)

## Instructions

1. Install istio

    * Follow this guide: https://docs.microsoft.com/en-us/azure/aks/istio-install 

2. Label namespace for istio injection


3. Re-deploy application with istio sidecar enabled


## Troubleshooting / Debugging



## Docs / References

* [Use intelligent routing and canary releases with Istio in Azure Kubernetes Service (AKS)](https://docs.microsoft.com/en-us/azure/aks/istio-scenario-routing)