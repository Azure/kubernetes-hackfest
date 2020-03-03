# Troubleshooting Guide
This guide covers the most common issues you may encounter running through these labs. 

## Lab 1: Create AKS Cluster

### *"The credentials in ServicePrincipalProfile were invalid":* 
When you're using the Azure CLI to create AKS clusters, a file is created at .azure/aksServicePrincipal.json containing the details about your servcie principlal. If this is invalid you will hit errors. Check this file contains the right Service Principal for the target subscription. If not, backup and delete this file and then try running again.


### Insuficient Priviledges to create Service Principal
If you're Azure AD Administrator has locked down your tenant you may not have rights to create a service principal, which is needed for deploying AKS. Either have your AAD Admin generate an SP for you with 'az ad sp create-for-rbac --skip-assignment', or request that they grant you 'Application Developer' rights on the tenant, which will give you adequate access.

### Quota Errors
By default some subscriptions have limited quotas, which can cause errors on cluster creation. Check your subscription quotas and raise accordingly.

---

## Lab 3: Helm Setup and Deploy Application

### ErrImagePull on any pods deployed via the helm charts
This error is typically because you didnt correctly update the 'acrServer' parameter in the helm chart values.yaml file. Run 'kubectl get pods', find the pod failing and then run the following to check the 'Events' section at the bottom to confirm the issue.
kubectl describe pod [pod name] -n hackfest

You should be able to see the specific error and the repo name and tag that kubernetes is trying to pull. 

GO back to your helm chart values file and fix the error.