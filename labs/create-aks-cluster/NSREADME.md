# Lab: Create AKS Cluster Namespaces

This lab creates namespaces that reflect a representative example of an organization's environments. In this case DEV, UAT and PROD. We will also apply the appopriate permissions, limits and resource quotas to each of the namespaces.

## Prerequisites

1. Built AKS Cluster

## Instructions

1. Create Three Namespaces

    ```bash
    # Create Namespaces
    kubectl apply -f create-namespaces.yaml

    # Look at Namespaces
    kubectl get ns
    ```

2. Assign CPU, Memory and Storage Limits to Namespaces

    ```bash
    # Create Namespace Limits
    kubectl apply -f namespace-limitranges.yaml

    # Get List of Namespaces and Drill into One
    kubectl get ns
    kubectl describe ns <INSERT-NAMESPACE-NAME-HERE>
    ```

3. Assign CPU, Memory and Storage Quotas to Namespaces

    ```bash
    # Create Namespace Quotas
    kubectl apply -f namespace-quotas.yaml

    # Get List of Namespaces and Drill into One
    kubectl get ns
    kubectl describe ns <INSERT-NAMESPACE-NAME-HERE>
    ```

4. Test out Limits and Quotas in **dev** Namespace

    ```bash
    # Test Limits - Forbidden due to assignment of CPU too low
    kubectl run nginx-limittest --image=nginx --restart=Never --replicas=1 --port=80 --requests='cpu=100m,memory=256Mi' -n dev
    # Test Limits - Pass due to automatic assignment within limits via defaults
    kubectl run nginx-limittest --image=nginx --restart=Never --replicas=1 --port=80 -n dev
    # Check running pod and dev Namespace Allocations
    kubectl get po -n dev
    kubectl describe ns dev
    # Test Quotas - Forbidden due to memory quota exceeded
    kubectl run nginx-quotatest --image=nginx --restart=Never --replicas=1 --port=80 --requests='cpu=500m,memory=1Gi' -n dev
    # Test Quotas - Pass due to memory within quota
    kubectl run nginx-quotatest --image=nginx --restart=Never --replicas=1 --port=80 --requests='cpu=500m,memory=512Mi' -n dev
    # Check running pod and dev Namespace Allocations
    kubectl get po -n dev
    kubectl describe ns dev
    ```

## Troubleshooting / Debugging

* The limits and quotas of a namespace can be found via the **kubectl describe ns <...>** command. You will also be able to see current allocations.
* If pods are not deploying then check to make sure that CPU, Memory and Storage amounts are within the limits and do not exceed the overall quota of the namespace.

## Docs / References

* [Kubernetes Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)
* [Default CPU Requests and Limits for a Namespace](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/cpu-default-namespace/)
* [Configure Min and Max CPU Constraints for a Namespace](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/cpu-constraint-namespace/)
* [Configure Memory and CPU Quotas for a Namespace](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/)