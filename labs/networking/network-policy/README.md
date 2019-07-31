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

    * Get the virtual network resource and subnet ID's
        
        ```bash
        VNET_ID=$(az network vnet show --resource-group $RGNAME --name myVnet --query id -o tsv)
        echo $VNET_ID
         ```
         
        ```bash
        SUBNET_ID=$(az network vnet subnet list --resource-group $RGNAME --vnet-name myVnet --query [].id --output tsv)
        echo $SUBNET_ID
        ```
        
    * Assign the service principal Contributor permissions to the virtual network resource

        ```bash
        az role assignment create --assignee $APPID --scope $VNET_ID --role Contributor
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

        Use Instrumentation Key from lab 2 [Build Application Components and Prerequisites](../../build-application/README.md)
        
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

        # no results...
        ```
        
        Exit the pod:
        ```bash
        exit
        ```

        > Notice that if you browse the service-tracker-ui web page, the app no longer works. The api's can no longer access the data-api, so the app is now broken. We should probably fix this. 
    
4. Allow inbound traffic based on pod label

    * Update the policy to allow flights-api to access

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
        ingress:
        - from:
            - namespaceSelector: {}
            podSelector:
                matchLabels:
                app: flights-api
        ```

        Apply the policy

        ```bash
        kubectl apply -f ./labs/networking/network-policy/fix-access-data-api.yaml
        ```

    * Test access from flights-api

        ```bash
        # lookup your pod name as it will be different
        kubectl exec -it flights-api-9f9bb5b86-4x7z8 -n hackfest sh

        wget -qO- http://data-api.hackfest:3009/status

        "message":"api default endpoint for data api","payload":{"uptime":"4 hours"}}
        ```

        Exit the pod:
        ```bash
        exit
        ```

    * Test access from weather-api (this should fail)

        ```bash
        # lookup your pod name as it will be different
        kubectl exec -it data-api-69dbc755f7-lr6hn -n hackfest sh

        wget -qO- http://data-api.hackfest:3009/status

        # no results...
        ```

        Exit the pod:
        ```bash
        exit
        ```

5. Allow inbound traffic based on namespace

    * Create and label the production namespace

        ```bash
        kubectl create namespace production
        kubectl label namespace/production purpose=production
        ```

    * Update the policy to allow the `hackfest` namespace

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
        ingress:
          - from:
            - namespaceSelector:
                matchLabels:
                  purpose: production
            - podSelector:
                matchLabels:
                  app: flights-api
            - podSelector:
                matchLabels:
                  app: weather-api
            - podSelector:
                matchLabels:
                  app: quakes-api
        ```

        Apply the policy

        ```bash
        kubectl apply -f ./labs/networking/network-policy/fix-access-namespace.yaml
        ```

    * Validate that all pods and the web page are working properly

    * Validate the a pod in the specifed namespace can also access the pod

        ```bash
        kubectl run --rm -it --image=alpine network-policy --namespace production --generator=run-pod/v1

        wget -qO- http://data-api.hackfest:3009/status

        {"message":"api default endpoint for data api","payload":{"uptime":"5 hours"}}
        ```

        Exit the pod:
        ```bash
        exit
        ```        

## Troubleshooting / Debugging

## Docs / References

* [AKS Network Policy Docs](https://docs.microsoft.com/en-us/azure/aks/use-network-policies)
* [Kubernetes Network Policy](https://kubernetes.io/docs/concepts/services-networking/network-policies)