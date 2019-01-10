# Lab: Best Practices for Cluster Operators

This lab walks through some basic best practices for operators using AKS. In many cases, the operations and developer best practices overlap. 

## Prerequisites

* Complete previous labs:
    * [Azure Kubernetes Service](../create-aks-cluster/README.md)
    * [Build Application Components in Azure Container Registry](../build-application/README.md)
    * [Helm Setup and Deploy Application](../helm-setup-deploy/README.md)

## Instructions

This lab has a number of exercises in no particular order:

- [Image Vulnerability Scanning](#image-vulnerability-scanning)
- [Upgrade Kubernetes Regularly](#Upgrade-Kubernetes-Regularly)
- [Process Node Updates and Reboots Using kured](#Process-Node-Updates-and-Reboots-Using-kured)
- [Enforce Resource Quotas](#Enforce-Resource-Quotas)
- [Pod Disruption Budgets](#Pod-Disruption-Budgets)
- [Network Security](#Network-Security)
- [Provide Dedicated Nodes using Taints and Tolerations](#Provide-Dedicated-Nodes-using-Taints-and-Tolerations)
- [Using Role Based Access Control (RBAC)](#Using-Role-Based-Access-Control-(RBAC))
- [Pod Identities](#Pod-Identities)
- [Backup and Business Continuity](#Backup-and-Business-Continuity)
- [App Armor and seccomp Filtering](#App-Armor-and-seccomp-Filtering)
- [Use kube-advisor to check for issues](#Use-kube-advisor-to-check-for-issues)


### Image Vulnerability Scanning
- - -

* It is critical to scan images for vulnerabilities in your environment. We recommending using a Enterprise grade tool such as [Aqua Security](https://www.aquasec.com/products/aqua-container-security-platform) or [Twistlock](https://www.twistlock.com/why-twistlock)

* There are also numerous open source tools that provide basic image scanning for CVE's. https://opensource.com/article/18/8/tools-container-security 

* These tools should be integrated into the CI/CD pipeline, Container Regsitry, and container runtimes to provide end-to-end protection. Review full guidance here: https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-container-image-management 

* In our lab, we will use Anchore for some quick testing. https://anchore.com/opensource 

    > Note: This lab will require working from your local machine and NOT the Azure Cloud Shell.

    * Install anchore with helm

        ```bash
        helm install --name anchore-demo stable/anchore-engine
        ```
    
    * 




### Upgrade Kubernetes Regularly
- - -

* To stay current on new features and bug fixes, regularly upgrade to the Kubernetes version in your AKS cluster.

    ```bash
    az aks get-upgrades --resource-group $RGNAME --name $CLUSTERNAME
    ```

    ```bash
    # change the image version below based on your cluster (if upgrade is available)
    KUBERNETES_VERSION=1.11.5
    az aks upgrade --resource-group $RGNAME --name $CLUSTERNAME --kubernetes-version $KUBERNETES_VERSION
    ```

### Process Node Updates and Reboots Using kured
- - -


### Enforce Resource Quotas
- - -


### Pod Disruption Budgets
- - -


### Network Security
- - -


### Provide Dedicated Nodes using Taints and Tolerations
- - -


### Using Role Based Access Control (RBAC)
- - -


### Pod Identities
- - -


### Backup and Business Continuity
- - -


### App Armor and seccomp Filtering
- - -


### Use kube-advisor to check for issues
- - -





## Troubleshooting / Debugging


## Docs / References

* [Full AKS Best Practices Documentation](https://docs.microsoft.com/en-us/azure/aks/best-practices)
* [Install Anchore using Helm](https://anchore.freshdesk.com/support/solutions/articles/36000060726-installing-anchore-using-helm)