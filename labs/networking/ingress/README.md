# Lab: Configure Ingress Controller

In this lab, we will deploy a Kubernetes ingress controller and route traffic to our site.

An ingress controller is a piece of software that provides reverse proxy, configurable traffic routing, and TLS termination for Kubernetes services. Kubernetes ingress resources are used to configure the ingress rules and routes for individual Kubernetes services. Using an ingress controller and ingress rules, a single IP address can be used to route traffic to multiple services in a Kubernetes cluster.

## Prerequisites

* Complete previous labs:
    * [Azure Kubernetes Service](../../create-aks-cluster/README.md)
    * [Build Application Components in Azure Container Registry](../../build-application/README.md)
    * [Helm Setup and Deploy Application](../../helm-setup-deploy/README.md)

>**Note:** Modern browsers (ex. Chrome) have started restricting navigation to untrusted sites by default. The following lab creates a self signed cert which will be considered untrusted by these browsers. To test navigation to the site at the end of the lab you may need to use Safari or Internet Explorer. 

## Instructions

1. Remove public IP addresses for services

    We do not need a public IP for the website when using an Ingress route.

    ```bash
    # delete existing service
    kubectl delete svc service-tracker-ui -n hackfest
    ```

    > Note. It should not be necessary to delete this, but there is a bug with kubectl and how it handles services and NodePorts. 

    ```bash
    # update chart to install service again as ClusterIP
    helm upgrade service-tracker-ui charts/service-tracker-ui --set service.type=ClusterIP
    ```

2. Create the NGINX ingress controller

    ```bash
    # Make sure Helm Repository is up to date
    helm repo update

    # Install ingress controller via helm chart
    helm install stable/nginx-ingress --namespace kube-system --set controller.replicaCount=2
    
    # Validate nginx is installed and running
    helm list
    kubectl get service -l app=nginx-ingress --namespace kube-system
    ```

3. Setup DNS for ingress controller

    * Get the public IP for the controller

        ```bash
        kubectl get service -l app=nginx-ingress --namespace kube-system
        ```
    
    * Update [configure-publicip-dns.sh](./configure-publicip-dns.sh) file and replace the IP

    * Note the DNSNAME in the script is set to the $UNIQUE_SUFFIX from earlier labs

    * Set permissions on the script

        ```bash
        chmod +x labs/networking/ingress/configure-publicip-dns.sh
        ```

    * Execute the script
        ```
        labs/networking/ingress/configure-publicip-dns.sh
        ```

    * Note the new DNS name for your public IP. It should be something like `brian13270.eastus.cloudapp.azure.com`. You can look it up in the portal in the "MC" resource group for your cluster. 


4. Generate TLS certificates

    In your organization, you will already have a process for this. In our lab, we are going to use self-signed TLS certs.

    Replace the url below with your domain created above. It is important that these hostnames match throughout the lab.

    ```bash
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -out labs/networking/ingress/aks-ingress-tls.crt \
    -keyout labs/networking/ingress/aks-ingress-tls.key \
    -subj "/CN=brian13270.eastus.cloudapp.azure.com/O=aks-ingress-tls"
    ```

5. Create a secret to store TLS cert

    We will use this later when creating ingress routes.

    ```bash
    kubectl create secret tls aks-ingress-tls \
    --key labs/networking/ingress/aks-ingress-tls.key \
    --cert labs/networking/ingress/aks-ingress-tls.crt -n hackfest
    ```

6. Create an ingress route

    * Update `service-tracker-ingress.yaml` with your unique hostname (lines 11 and 14)

    * Apply

        ```bash
        kubectl apply -f labs/networking/ingress/service-tracker-ingress.yaml -n hackfest
        ```

7. Test configuration

    Browse to your URL. Eg - http://brian13270.eastus.cloudapp.azure.com/ui 


## Troubleshooting / Debugging

* Check that the Service Names in the Ingress Rules match the Application Service Names

## Docs / References

* [Create an ingress controller in Azure Kubernetes Service (AKS)](https://docs.microsoft.com/en-us/azure/aks/ingress-basic)
* [What is an Ingress Controller?](https://kubernetes.io/docs/concepts/services-networking/ingress/)
* [Whitelisting egress traffic](https://docs.microsoft.com/en-us/azure/aks/egress)

