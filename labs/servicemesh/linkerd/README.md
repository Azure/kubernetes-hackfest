# Lab: Linkerd

Linkerd is a service sidecar designed to give service owners automatic observability, reliability, and runtime diagnostics for their service without requiring configuration or code changes. Linkerd is also a service mesh, running across an entire cluster to provide platform-wide telemetry, security, and reliability.

Linkerd is a Cloud Native Computing Foundation (CNCF) project.

**This lab will focus on the v2 release of Linkerd**

## Prerequisites

* Complete previous labs:
    * [Azure Kubernetes Service](../../create-aks-cluster/README.md)
    * [Build Application Components in Azure Container Registry](../../build-application/README.md)
    * [Helm Setup and Deploy Application](../../helm-setup-deploy/README.md)

## Instructions

1. Install linkerd in AKS cluster

    * Follow this guide: https://linkerd.io/2/getting-started 

2. Use `helm template` to create manifest for injection

3. Re-deploy application using `linkerd inject`


## Troubleshooting / Debugging



## Docs / References

* [Linkerd on Github](https://github.com/linkerd/linkerd2)