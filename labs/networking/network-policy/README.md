# Lab: AKS Network Policies

When you run modern, microservices-based applications in Kubernetes, you often want to control which components can communicate with each other. The principle of least privilege should be applied to how traffic can flow between pods in an Azure Kubernetes Service (AKS) cluster. Let's say you likely want to block traffic directly to back-end applications. The Network Policy feature in Kubernetes lets you define rules for ingress and egress traffic between pods in a cluster.

## Prerequisites 

* Complete previous labs:
    * [Azure Kubernetes Service](../../create-aks-cluster/README.md)
    * [Build Application Components in Azure Container Registry](../../build-application/README.md)
    * [Helm Setup and Deploy Application](../../helm-setup-deploy/README.md)
    * Azure CLI version 2.0.61 or later (Cloud Shell should provide the latest)

## Instructions

1. Create a new AKS cluster with advanced networking

    Our AKS cluster in lab 1 uses basic networking and this lab requires AKS advanced networking. Follow these steps to create a new cluster:

    * Create a virtual network and subnet

        ```bash
        az network vnet create \
            --resource-group $RGNAME \
            --name myVnet \
            --address-prefixes 10.0.0.0/8 \
            --subnet-name myAKSSubnet \
            --subnet-prefix 10.240.0.0/16
        ```
    
    * Validate service principle values in profile

        ```bash
        echo $APPID
        echo $CLIENTSECRET
        ```

    * Get the virtual network resource ID
        
        ```bash
        VNET_ID=$(az network vnet show --resource-group $RGNAME --name myVnet --query id -o tsv)
        echo $VNET_ID
        ```

    * Assign the service principal Contributor permissions to the virtual network resource

        ```bash
        az role assignment create --assignee $APPID --scope $VNET_ID --role Contributor
        ```

    * Get the virtual network subnet resource ID

        ```bash
        SUBNET_ID=$(az network vnet subnet show --resource-group $RGNAME --vnet-name myVnet --name myAKSSubnet --query id -o tsv)
        echo $SUBNET_ID
        ```

    * Create AKS Cluster

        > Note: Note the `--network-policy` parameter

        ```bash
        CLUSTERNAME=aks-np-${UNIQUE_SUFFIX}

        az aks create \
            --resource-group $RGNAME \
            --name $CLUSTERNAME \
            --node-count 3 \
            --generate-ssh-keys \
            --network-plugin azure \
            --service-cidr 10.0.0.0/16 \
            --dns-service-ip 10.0.0.10 \
            --docker-bridge-address 172.17.0.1/16 \
            --vnet-subnet-id $SUBNET_ID \
            --service-principal $APPID \
            --client-secret $CLIENTSECRET \
            --network-policy azure
        ```

    * Get credentials

        ```bash
        az aks get-credentials --resource-group $RGNAME --name $CLUSTERNAME
        ```

2. Deploy our application

    * Create namespace

        ```bash
        kubectl create ns hackfest
        ```

    * Create secret to allow pods to access Cosmos from this new cluster

        ```bash
        export MONGODB_USER=$(az cosmosdb show --name $COSMOSNAME --resource-group $RGNAME --query "name" -o tsv)
        ```

        ```bash
        export MONGODB_PASSWORD=$(az cosmosdb list-keys --name $COSMOSNAME --resource-group $RGNAME --query "primaryMasterKey" -o tsv)
        ```

        Use Instrumentation Key from step 3 above.
        ```bash
        export APPINSIGHTS_INSTRUMENTATIONKEY='replace-me'
        ```

        ```bash
        kubectl create secret generic cosmos-db-secret --from-literal=user=$MONGODB_USER --from-literal=pwd=$MONGODB_PASSWORD --from-literal=appinsights=$APPINSIGHTS_INSTRUMENTATIONKEY -n hackfest
        ```
    
    * Follow the steps from the earlier lab 3 [Helm Setup and Deploy Application](../../helm-setup-deploy/README.md)

        > Note: the helm charts from lab 3 earlier should already be updated and should work fine without edit

    * Test and ensure app works correctly (Browse the UI and update data)

3. Deny all inbound traffic to a pod (data-api)

    * Quickly test access to one of our api's from a pod

        ```bash
        kubectl run --rm -it --image=alpine network-policy --namespace hackfest --generator=run-pod/v1

        wget -qO- http://data-api.hackfest:3009/status

        # should see a result such as:
        {"message":"api default endpoint for data api","payload":{"uptime":"3 hours"}}
        ```

        Exit the pod:
        ```bash
        exit
        ```
    
    * Create the deny policy

        Review the file `block-access-to-data-api.yaml`

        ```yaml
        kind: NetworkPolicy
        apiVersion: networking.k8s.io/v1
        metadata:
        name: data-api-policy
        namespace: hackfest
        spec:
        podSelector:
            matchLabels:
            app: data-api
        ingress: []
        ```

        ```bash
        kubectl apply -f ./labs/networking/network-policy/block-access-to-data-api.yaml
        ```

    * Retry accessing the pod

        ```bash
        kubectl run --rm -it --image=alpine network-policy --namespace hackfest --generator=run-pod/v1

        wget -qO- http://data-api.hackfest:3009/status

        # this will fail to return a result
        ```
        
        Exit the pod:
        ```bash
        exit
        ```
    
    * Delete this policy

        ```bash
        kubectl delete networkpolicy -n hackfest data-api-policy
        ```

4. Allow inbound traffic based on a pod label


## Troubleshooting / Debugging

## Docs / References

* [AKS Network Policy Docs](https://docs.microsoft.com/en-us/azure/aks/use-network-policies)
* [Kubernetes Network Policy](https://kubernetes.io/docs/concepts/services-networking/network-policies)