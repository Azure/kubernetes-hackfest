# Lab 0: Azure cli, AKS and ACR Setup guide

<br/>

## Introduction

In this section, you will learn how to create your own 3 node AKS cluster using Azure CLI. You will also learn how to create a new private Azure Container Registry and push a test container image to the newly created private registry. You will then attach the newly created private registry to the AKS cluster. Finally, you will pull NGINX Plus Ingress Controller Image and push it to the private registry.
<br/>

## Learning Objectives
- Setting up Azure CLI in your local workstation.
- Deploy a Kubernetes Cluster within Azure using Azure CLI.
- Creating an Azure Container Registry (ACR) using Azure CLI.
- Pushing a test container image to the newly created Private ACR registry.
- Attaching ACR to AKS cluster using Azure CLI.
- Pulling NGINX Plus Ingress Controller Image using Docker and pushing to private ACR Registry

## What is Azure AKS?

Azure Kubernetes Service is a service provided for Kubernetes on Azure
infrastructure. The Kubernetes resources will be fully managed by Microsoft Azure, which
offloads the burden on maintaining the infrastructure, and makes sure these
resources are highly available and reliable at all times.

## What is Azure ACR?

Azure Container Registry(ACR) is a managed container registry. Like the popular
docker registry Dockerhub, ACR also supports private and public repositories. We
can either push or pull images to ACR using Azure CLI.

## Azure Regions and naming convention suggestions

1. Check out the available [Azure Regions](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview).<br/>
Decide on a [Datacenter region](https://azure.microsoft.com/en-us/explore/global-infrastructure/geographies/#geographies) that is closest to you and meets your needs. <br/>
Check out the [Azure latency test](https://www.azurespeed.com/Azure/Latency)! We will need to choose one and input a region name in the following steps.

2. Consider a naming and tagging convention to organize your cloud assets to support user identification of shared subscriptions.

**Example:** 

I am located in Chicago, Illinois; I will opt to use the Datacenter region
`Central US`. I could also use the following naming
convention:

```bash
<Asset_type>-<your_id_yourname>-<location>
```

So for my AKS Cluster I will deploy in `Central US`, and
will name my Cluster `aks-shouvik-centralus` or just `aks-shouvik` since I
don't intend to have more than one AKS deployment

I will also use the tag `owner=shouvik` to further identify my asset on our shared
account.

## Azure CLI Basic Configuration Setting

We will need Azure Command Line Interface (CLI) installed on your client machine to manage your Azure services. See [How to install the Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)

To check Azure CLI version run below command: 
```bash
az --version
```

1. Sign in with Azure CLI using your preferred method listed [here](https://learn.microsoft.com/en-us/cli/azure/authenticate-azure-cli).
   
   >**Note:** We made use of Sign in interactively method for this workshop
    ```bash
    az login
    ``` 

1. Once you have logged in you can run below command to validate your tenent and subscription ID and name.
   ```bash
   az account show 
   ```

2. Optional: If you have multiple subscriptions and would like to change the current subscription to another then run below command.
   ```bash
   # change the active subscription using the subscription name
   az account set --subcription "{subscription name}"

   # OR

   # change the active subscription using the subscription ID
   az account set --subscription "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  
   ```

3. Create a new Azure resource group which would hold all the Azure resources that you would create for this workshop.
   ```bash
   az group create --name s.dutta --location centralus
   ```


## Deploy a Kubernetes Cluster with Azure CLI

1. With the use of Azure CLI, you can deploy a production-ready AKS cluster with some options using a single command (**This will take a while**).
   ```bash
    MY_RESOURCEGROUP=s.dutta
    MY_LOCATION=centralus
    MY_AKS=aks-shouvik
    MY_NAME=shouvik
    AKS_NODE_VM=Standard_B2s
    K8S_VERSION=1.27

    # Create AKS Cluster
    az aks create \
        --resource-group $MY_RESOURCEGROUP \
        --name $MY_AKS \
        --location $MY_LOCATION \
        --node-count 3 \
        --node-vm-size $AKS_NODE_VM \
        --kubernetes-version $K8S_VERSION \
        --tags owner=$MY_NAME \
        --enable-addons monitoring \ 
        --generate-ssh-keys \
        --enable-fips-image
   ```
   >**Note**: 
   >1. At the time of this writing, 1.27 is the latest kubernetes version that Azure AKS supports. 
   >2. `--enable-fips-image` flag has been added to the `az aks create` command to make all the nodes have FIPS-enabled OS. This is needed for lab5.
   >3. To list all possible vm sizes that an AKS node can use, run below command      
   >     ```bash
   >     az vm list-sizes --location centralus --output table
   >     ```


2. **(Optional Step)**: If kubectl ultility tool is not installed in your workstation then you can install `kubectl` locally using below command:
   ```bash
   az aks install-cli
   ```

3. Configure `kubectl`` to connect to your Azure AKS cluster using below command.
   ```bash
   MY_RESOURCEGROUP=s.dutta
   MY_AKS=aks-shouvik

   az aks get-credentials --resource-group $MY_RESOURCEGROUP --name $MY_AKS
   ```

4. If you are managing multiple Kubernetes clusters, you can easily change between context using the `kubectl config set-context` command:
   ```bash
   # Get a list of kubernetes clusters in you local kube config
   kubectl config get-clusters
   ```
   ```bash
   ###Sample Output###
   NAME
   local-k8s-cluster
   aks-development
   minikube
   aks-shouvik
   ```
   ```bash 
   # Set context
   kubectl config set-context aks-shouvik
   ```
   ```bash
   # Check which context you are currently targeting
   kubectl config current-context
   ```
   ```bash
   ###Sample Output###
   aks-shouvik
   ```
   ```bash
   # Allows you to switch between contexts using their name
   kubectl config use-context <CONTEXT_NAME>
   ```
5. Test if you are able to access your newly created AKS cluster.
   ```bash
   # Get Nodes in the target kubernetes cluster
   kubectl get nodes
   ```
   ```bash
   ###Sample Output###
   NAME                                STATUS   ROLES   AGE     VERSION
   aks-nodepool1-76910942-vmss000000   Ready    agent   9m23s   v1.27.3
   aks-nodepool1-76910942-vmss000001   Ready    agent   9m32s   v1.27.3
   aks-nodepool1-76910942-vmss000002   Ready    agent   9m30s   v1.27.3    
   ```

6. Finally to stop a running AKS cluster use below command.
   ```bash
   MY_RESOURCEGROUP=s.dutta
   MY_AKS=aks-shouvik

   az aks stop --resource-group $MY_RESOURCEGROUP --name $MY_AKS
   ```

7. To start an already deployed AKS cluster use below command.
   ```bash
   MY_RESOURCEGROUP=s.dutta
   MY_AKS=aks-shouvik

   az aks start --resource-group $MY_RESOURCEGROUP --name $MY_AKS
   ```

## Create an Azure Container Registry (ACR)

1.  Create a container registry using the az acr create command. The registry name must be unique within Azure, and contain 5-50 alphanumeric characters
    ```bash
    MY_RESOURCEGROUP=s.dutta
    MY_ACR=acrshouvik

    az acr create \
        --resource-group  $MY_RESOURCEGROUP \
        --name $MY_ACR \
        --sku Basic   
    ```

2. From the output of the `az acr create` command, make a note of the `loginServer`. The value of `loginServer` key is the fully qualified registry name. In our example the registry name is `acrshouvik` and the login server name is `acrshouvik.azurecr.io`.

3. Login to the registry using below command. Make sure docker daemon is up and running.
   ```bash
   MY_ACR=acrshouvik

   az acr login --name $MY_ACR
   ```
   At the end of the output you should see `Login Succeeded`!

### Test access to your Azure ACR 

We can quickly test the ability to push images to our Private ACR from our client machine.

1. If you do not have a test container image to push to ACR, you can download a simple container for testing, e.g.[nginxinc/ingress-demo](https://hub.docker.com/r/nginxinc/ingress-demo)

   ```bash
   docker pull nginxinc/ingress-demo
   ```

2. Get the image ID so we can tag it on the next step

   ```bash
   docker images | grep ingress-demo
   ```
   ```bash
   ###Sample Output###
   nginxinc/ingress-demo                latest    73ba987f213a   2 years ago   23MB
   ```

3. Tag the image with your registry login server name

   ```bash
   MY_ACR=acrshouvik
   MY_REPO=nginxinc/ingress-demo
   MY_TAG=v1
   MY_IMAGE_ID=$(docker images nginxinc/ingress-demo --format "{{.ID}}")

   set| grep MY_

   docker tag $MY_IMAGE_ID $MY_ACR.azurecr.io/$MY_REPO:$MY_TAG
   ```

4. Your newly tagged image is now listed under `docker images`:
   
   ```bash
   docker images | grep ingress-demo
   ```
   ```bash
   ###Sample Output###
   acrshouvik.azurecr.io/nginxinc/ingress-demo   v1        73ba987f213a   2 years ago   23MB
   nginxinc/ingress-demo                         latest    73ba987f213a   2 years ago   23MB
   ```

5. Push your tagged image to ACR

   ```bash
   # you can get copy the docker image name from the last step 
   docker push acrshouvik.azurecr.io/nginxinc/ingress-demo:v1 
   ```

6. Check if the image was successfully pushed to ACR using the azure cli command below

   ```bash
   MY_ACR=acrshouvik
   az acr repository list --name $MY_ACR --output table 
   ```
   ```bash
   ###Sample Output###
   Result
   ---------------------
   nginxinc/ingress-demo
   ```

## Attach an Azure Container Registry (ACR) to Azure Kubernetes cluster (AKS)

1. You will attach the newly created ACR to your AKS cluster. This will enable you to pull private images within AKS cluster directly from the your ACR. Run below command to attach ACR to AKS
   ```bash
   MY_RESOURCEGROUP=s.dutta
   MY_AKS=aks-shouvik
   MY_ACR=acrshouvik

   az aks update -n $MY_AKS -g $MY_RESOURCEGROUP --attach-acr $MY_ACR
   ```
   **NOTE:** You need the Owner, Azure account administrator, or Azure co-administrator role on your Azure subscription. To avoid needing one of these roles, you can instead use an existing managed identity to authenticate ACR from AKS. See [references](#references) for more details.


## Pulling NGINX Plus Ingress Controller Image using Docker and pushing to private ACR Registry

1. For NGINX Ingress Controller, you must have the NGINX Ingress Controller subscription – download the NGINX Plus Ingress Controller (per instance) certificate (nginx-repo.crt) and the key (nginx-repo.key) from [MyF5](https://my.f5.com/). You can also request for a 30-day trial key from [here](https://www.nginx.com/free-trial-connectivity-stack-kubernetes/).
   
2. Once you have the certificate and key, you need to configure the Docker environment to use certificate-based client-server authentication with F5 private container registry `private-registry.nginx.com`.<br/>
To do so create a `private-registry.nginx.com` directory under below paths based on your operating system. (See [references](#references) section for more details)
     -  **linux** : `/etc/docker/certs.d`
     -  **mac** : `~/.docker/certs.d`
     -  **windows** : `~/.docker/certs.d` 

1. Copy your `nginx-repo.crt` and `nginx-repo.key` file in the newly created directory.
     -  Below are the commands for mac/windows based systems
        ```bash
        mkdir ~/.docker/certs.d/private-registry.nginx.com
        cp nginx-repo.crt ~/.docker/certs.d/private-registry.nginx.com/client.cert
        cp nginx-repo.key ~/.docker/certs.d/private-registry.nginx.com/client.key
        ```  

2. ***Optional** Step only for Mac and Windows system
     - Restart Docker Desktop so that it copies the `~/.docker/certs.d` directory from your Mac or Windows system to the `/etc/docker/certs.d` directory on **Moby** (the Docker Desktop `xhyve` virtual machine).

3. Once Docker Desktop has restarted, run below command to pull the NGINX Plus Ingress Controller image from F5 private container registry.
    ```bash
    docker pull private-registry.nginx.com/nginx-ic/nginx-plus-ingress:3.2.1-alpine-fips
    ```
    >**Note**: At the time of this writing `3.2.1-alpine-fips` is the latest NGINX Plus Ingress FIPS-enabled version that is available. Please feel free to use the latest version of NGINX Plus Ingress Controller. Look into [references](#references) for latest Ingress images.

4. Set below variables to tag and push image to AWS ECR
    ```bash
    MY_ACR=acrshouvik
    MY_REPO=nginxinc/nginx-plus-ingress
    MY_TAG=3.2.1-alpine-fips
    MY_IMAGE_ID=$(docker images private-registry.nginx.com/nginx-ic/nginx-plus-ingress:$MY_TAG --format "{{.ID}}") 
    ```
    Check all variables have been set properly by running below command:
    ```bash
    set | grep MY_
    ```

5. After setting the variables, tag the pulled NGINX Plus Ingress image using below command
    ```bash
    docker tag $MY_IMAGE_ID $MY_ACR.azurecr.io/$MY_REPO:$MY_TAG
    ```
6. Login to the ACR registry using below command. 
   ```bash
   az acr login --name $MY_ACR
   ```

7. Push your tagged image to ACR registry
   ```bash
   docker push $MY_ACR.azurecr.io/$MY_REPO:$MY_TAG
   ```

8. Once pushed you can check the image by running below command
    ```bash
    az acr repository list --name $MY_ACR --output table
    ```

## Delete your AKS cluster and other resources associated to cluster

You can easily delete your AKS cluster using the Azure CLI

1. Delete the cluster and its associated nodes with the following command.
   ```bash
   MY_RESOURCEGROUP=s.dutta
   MY_AKS=aks-shouvik

   az aks delete --resource-group $MY_RESOURCEGROUP --name $MY_AKS
   ```

**This completes the Lab.** 
<br/>

## References: 

- [Deploy AKS cluster using Azure CLI](https://learn.microsoft.com/en-us/azure/aks/learn/quick-kubernetes-deploy-cli)
- [Azure CLI command list for AKS](https://learn.microsoft.com/en-us/cli/azure/aks?view=azure-cli-latest)
- [Create private container registry using Azure CLI](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-get-started-azure-cli)
- [Azure CLI command list for ACR](https://learn.microsoft.com/en-us/cli/azure/acr?view=azure-cli-latest)
- [Authenticate with ACR from AKS cluster](https://learn.microsoft.com/en-us/azure/container-registry/authenticate-kubernetes-options#scenarios)
- [Pulling NGINX Plus Ingress Controller Image](https://docs.nginx.com/nginx-ingress-controller/installation/pulling-ingress-controller-image)
- [Add Client Certificate Mac](https://docs.docker.com/desktop/faqs/macfaqs/#add-client-certificates)
- [Add Client Certificate Windows](https://docs.docker.com/desktop/faqs/windowsfaqs/#how-do-i-add-client-certificates)
- [Docker Engine Security Documentation](https://docs.docker.com/engine/security/certificates/)
- [Latest NGINX Plus Ingress Images](https://docs.nginx.com/nginx-ingress-controller/technical-specifications/#images-with-nginx-plus)
<br/>

### Authors
- Chris Akker - Solutions Architect - Community and Alliances @ F5, Inc.
- Shouvik Dutta - Solutions Architect - Community and Alliances @ F5, Inc.
- Jason Williams - Principle Product Management Engineer @ F5, Inc.

-------------

Navigate to ([Lab1](../lab1/readme.md) | [Main Menu](../LabGuide.md#lab-outline))
