# Lab: Install Secure Tiller in Single Namespace

This lab walksthrough how to secure tiller in a single namespace to restrict access from entire cluster.

## Prerequisites

* Clone this repo in Azure Cloud Shell.
* Complete previous labs for [AKS](../../create-aks-cluster/README.md) and [ACR](../../build-application/README.md).

## Instructions

1. Create Helm/Tiller for **dev** Namespace

    ```bash
    # Create kubeconfig file for tiller Service Account (Useful for DevOps)
    chmod a+x tiller-namespace-setup.sh
    ./tiller-namespace-setup.sh tiller dev

    # Create AKS ServiceAccount, Role and Bindings
    kubectl apply -f tiller-rbac-config.yaml

    # Get List of ServiceAccounts and Pods in dev Namespace
    kubectl get serviceaccounts,po -n dev

    # Deploy Tiller to dev Namespace
    helm init --tiller-namespace dev --tiller-service-account tiller

    # Get List of ServiceAccounts and Pods in dev Namespace
    kubectl get serviceaccounts,po -n dev

    # Test with Service Account (notice no namespace defined)
    KUBECONFIG=/tmp/kube/k8s-deploy-stg-conf kubectl get pods

    # Test Deployment to dev Namespace
    KUBECONFIG=/tmp/kube/k8s-tiller-stg-conf helm install --namespace dev stable/nginx --tiller-namespace dev
    ```

## Troubleshooting / Debugging

* Check to see that the name of the Service Account and name of Role are referenced correctly in the RoleBinding.

## Docs / References

* [Helm Docs](https://docs.helm.sh)