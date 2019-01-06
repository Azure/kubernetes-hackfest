# Lab 1B: Create AKS Cluster

In this lab we will create our Azure Kubernetes Services (AKS) distributed compute cluster with Terraform.

Terraform

## Prerequisites

* Azure Account

## Instructions

1. Login to Azure Portal at http://portal.azure.com.
2. Open the Azure Cloud Shell and choose Bash Shell (do not choose Powershell)

    ![Azure Cloud Shell](img-cloud-shell.png "Azure Cloud Shell")

3. The first time Cloud Shell is started will require you to create a storage account.

4. Once your cloud shell is started, clone the workshop repo into the cloud shell environment
    ```bash
    git clone https://github.com/Azure/kubernetes-hackfest
    ```

    > Note: In the cloud shell, you are automatically logged into your Azure subscription.

5. Ensure you are using the correct Azure subscription you want to deploy AKS to.
    ```bash
    # View subscriptions
    az account list
    ```
    ```bash
    # Verify selected subscription
    az account show
    ```

    ```bash
    # Set correct subscription (if needed)
    az account set --subscription <subscription_id>
    ```
    ```bash
    # Verify correct subscription is now set
    az account show
    ```

6. Create Azure Service Prinicpal to use through the labs

    ```bash
    az ad sp create-for-rbac --skip-assignment
    ```
    This will return the following. !!!IMPORTANT!!! - Please copy this information down as you'll need it for labs going forward.

    ```bash
    "appId": "7248f250-0000-0000-0000-dbdeb8400d85",
    "displayName": "azure-cli-2017-10-15-02-20-15",
    "name": "http://azure-cli-2017-10-15-02-20-15",
    "password": "77851d2c-0000-0000-0000-cb3ebc97975a",
    "tenant": "72f988bf-0000-0000-0000-2d7cd011db47"
    ```

    Set the values from above as variables **(replace <appId> and <password> with your values)**.

    DON'T MESS THIS STEP UP. REPLACE THE VALUES IN BRACKETS!!!

    ```bash
    # Persist for Later Sessions in Case of Timeout
    TF_VAR_APPID=<appId>
    ```
    ```bash
    echo export TF_VAR_APPID=$APPID >> ~/.bashrc
    ```
    ```bash
    TF_VAR_CLIENTSECRET=<password>
    ```
    ```bash
    echo export TF_VAR_CLIENTSECRET=$CLIENTSECRET >> ~/.bashrc
    ```

7. Create a  unique identifier suffix for resources to be created in this lab.

    ```bash
    UNIQUE_SUFFIX=$USER$RANDOM
    ```
    ```bash
    # Remove Underscores and Dashes (Not Allowed in AKS and ACR Names)
    
    UNIQUE_SUFFIX="${UNIQUE_SUFFIX//_}"
    ```
    ```bash
    UNIQUE_SUFFIX="${UNIQUE_SUFFIX//-}"
    ```
    ```bash
    # Check Unique Suffix Value (Should be No Underscores or Dashes)
    echo $UNIQUE_SUFFIX
    ```
    ```bash
    # Persist for Later Sessions in Case of Timeout
    echo export TF_VAR_UNIQUE_SUFFIX=$UNIQUE_SUFFIX >> ~/.bashrc
    ```

    *** Note this value as it will be used in the next couple labs. ***

8. Set variables for an Azure Resource Group in East US.

    ```bash
    # Set Resource Group Name
    RGNAME=kubernetes-hackfest
    ```
    ```bash
    # Persist for Later Sessions in Case of Timeout
    echo export RGNAME=kubernetes-hackfest >> ~/.bashrc
    ```
    ```bash
    # Set Region (Location)
    LOCATION=eastus
    ```
    ```bash
    # Persist for Later Sessions in Case of Timeout
    echo export LOCATION=eastus >> ~/.bashrc
    ```

9. Create your AKS cluster with Terraform with 3 nodes, targeting Kubernetes version 1.11.5, with Container Insights, and HTTP Application Routing Enabled.

    Use Unique CLUSTERNAME

    ```bash
    # Set AKS Cluster Name
    TF_VAR_CLUSTERNAME=aks${UNIQUE_SUFFIX}
    ```
    ```bash
    # Look at AKS Cluster Name for Future Reference
    echo $TF_VAR_CLUSTERNAME
    ```
    ```bash
    # Persist for Later Sessions in Case of Timeout
    echo export TF_VAR_CLUSTERNAME=aks${UNIQUE_SUFFIX} >> ~/.bashrc
    ```
    Run "terraform init" to initialize the Terraform directory. This command performs several different initialization steps in order to prepare a working directory for use.
    ```hcl
    terraform init
    ```  
    Run "terraform plan" to ensure the right resources are being created. Terraform plan allows you to evaluate the resources Terraform will create before actually deploying the resources

    ```hcl
    terraform plan
    ```
    Now we will create the cluster with applying the terrraform configuration

    ```hcl
    terraform apply
    ```

> The deployment can take 8-10 minutes to run as it is creating the AKS cluster. Please be PATIENT and grab a coffee...

10. Verify your cluster status. The `ProvisioningState` should be `Succeeded`

    ```bash
    az aks list -o table
    ```

    ```bash
    Name                 Location    ResourceGroup         KubernetesVersion    ProvisioningState    Fqdn
    -------------------  ----------  --------------------  -------------------  -------------------  -------------------------------------------------------------------
    ODLaks-v2-gbb-16502  eastus   ODL_aks-v2-gbb-16502  1.11.4                Succeeded odlaks-v2--odlaks-v2-gbb-16-b23acc-17863579.hcp.centralus.azmk8s.io
    ```
11. Get the Kubernetes config files for your new AKS cluster

    ```bash
    az aks get-credentials -n $CLUSTERNAME -g $RGNAME
    ```

12. Verify you have API access to your new AKS cluster

      > Note: It can take 5 minutes for your nodes to appear and be in READY state. You can run `watch kubectl get nodes` to monitor status.

     ```bash
     kubectl get nodes
     ```
    ```bash
     NAME                       STATUS    ROLES     AGE       VERSION
     aks-nodepool1-26522970-0   Ready     agent     33m       v1.11.5
     ```
 
     To see more details about your cluster:

     ```bash
     kubectl cluster-info
     ```
     ```bash
     Kubernetes master is running at https://cluster-dw-kubernetes-hackf-80066e-a44f3eb0.hcp.eastus.azmk8s.io:443

     addon-http-application-routing-default-http-backend is running at https://cluster-dw-kubernetes-hackf-80066e-a44f3eb0.hcp.eastus.azmk8s.io:443/api/v1/namespaces/kube-system/services/addon-http-application-routing-default-http-backend/proxy

     addon-http-application-routing-nginx-ingress is running at http://168.62.191.18:80 http://168.62.191.18:443

     Heapster is running at https://cluster-dw-kubernetes-hackf-80066e-a44f3eb0.hcp.eastus.azmk8s.io:443/api/v1/namespaces/kube-system/services/heapster/proxy

     KubeDNS is running at https://cluster-dw-kubernetes-hackf-80066e-a44f3eb0.hcp.eastus.azmk8s.io:443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

     kubernetes-dashboard is running at https://cluster-dw-kubernetes-hackf-80066e-a44f3eb0.hcp.eastus.azmk8s.io:443/api/v1/namespaces/kube-system/services/kubernetes-dashboard/proxy 
     ```

     You should now have a Kubernetes cluster running with 3 nodes. You do not see the master servers for the cluster because these are managed by Microsoft. The Control Plane services which manage the Kubernetes cluster such as scheduling, API access, configuration data store and object controllers are all provided as services to the nodes.

## Namespaces Setup

This lab creates namespaces that reflect a representative example of an organization's environments. In this case dev, uat and prod. We will also apply the appopriate permissions, limits and resource quotas to each of the namespaces.

1. Create three namespaces

    ```bash
    # Create namespaces
    kubectl apply -f ~/kubernetes-hackfest/labs/create-aks-cluster/create-namespaces.yaml

    # Look at namespaces
    kubectl get ns
    ```

2. Assign CPU, memory and storage limits to namespaces

    ```bash
    # Create namespace limits
    kubectl apply -f ~/kubernetes-hackfest/labs/create-aks-cluster/namespace-limitranges.yaml

    # Get list of namespaces and drill into one
    kubectl get ns
    kubectl describe ns uat
    ```

3. Assign CPU, Memory and Storage Quotas to Namespaces

    ```bash
    # Create namespace quotas
    kubectl apply -f ~/kubernetes-hackfest/labs/create-aks-cluster/namespace-quotas.yaml

    # Get list of namespaces and drill into one
    kubectl get ns
    kubectl describe ns dev
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

5. Clean up limits, quotas, pods

    ```bash
    kubectl delete -f ~/kubernetes-hackfest/labs/create-aks-cluster/namespace-limitranges.yaml
    kubectl delete -f ~/kubernetes-hackfest/labs/create-aks-cluster/namespace-quotas.yaml
    kubectl delete po nginx-limittest nginx-quotatest -n dev

    kubectl describe ns dev
    kubectl describe ns uat
    kubectl describe ns prod
    ```

6. Create namespace for our application. This will be used in subsequent labs.

    ```bash
    kubectl create ns hackfest
    ```


## Troubleshooting / Debugging

* To further debug and diagnose cluster problems, use `kubectl cluster-info dump` command.
* The limits and quotas of a namespace can be found via the **kubectl describe ns <...>** command. You will also be able to see current allocations.
* If pods are not deploying then check to make sure that CPU, Memory and Storage amounts are within the limits and do not exceed the overall quota of the namespace.

## Docs / References

* [Troubleshoot Kubernetes Clusters](https://kubernetes.io/docs/tasks/debug-application-cluster/debug-cluster)
* [Kubernetes Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)
* [Default CPU Requests and Limits for a Namespace](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/cpu-default-namespace/)
* [Configure Min and Max CPU Constraints for a Namespace](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/cpu-constraint-namespace/)
* [Configure Memory and CPU Quotas for a Namespace](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/)
* [Use Ansible to deploy AKS](https://docs.microsoft.com/en-us/azure/ansible/ansible-create-configure-aks?toc=%2Fen-us%2Fazure%2Faks%2FTOC.json&bc=%2Fen-us%2Fazure%2Fbread%2Ftoc.json)
* [Use Terraform to deploy AKS](https://docs.microsoft.com/en-us/azure/terraform/terraform-create-k8s-cluster-with-tf-and-aks?toc=%2Fen-us%2Fazure%2Faks%2FTOC.json&bc=%2Fen-us%2Fazure%2Fbread%2Ftoc.json)


#### Next Lab: [Build Application Components and Prerequisites](../build-application/README.md)