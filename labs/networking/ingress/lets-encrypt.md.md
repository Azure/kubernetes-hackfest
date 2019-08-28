# Lab: Configure Ingress Controller

This lab is about setting up the Ingress Controller and configuring the different routes.

## Prerequisites

* Complete previous labs:
    * [Azure Kubernetes Service](../../create-aks-cluster/README.md)
    * [Build Application Components in Azure Container Registry](../../build-application/README.md)
    * [Helm Setup and Deploy Application](../../helm-setup-deploy/README.md)

## Instructions

1. Install nginx Ingress Controller

    ```bash
    # Make sure Helm Repository is up to date
    helm repo update

    # Install ingress controller via helm chart
    helm install stable/nginx-ingress --namespace kube-system
    
    # Validate nginx is installed
    helm list
    ```

2. Get Public IP address & update [configure-publicip-dns.sh](./configure-publicip-dns.sh) file

    * In the configure-public-dns.sh file, replace IP with IP address from the below command

    ```bash
    kubectl get service -l app=nginx-ingress --namespace kube-system
    ```

    * Note the DNSNAME in the script is set to the $UNIQUE_SUFFIX from earlier labs

3. Execute Configure PublicIP DNS Script

    ```bash
    # first, set permissions on script
    chmod +x labs/networking/ingress/configure-publicip-dns.sh

    # do it
    labs/networking/ingress/configure-publicip-dns.sh
    ```

4. Install Cert Mgr with RBAC

    ```bash
    helm install stable/cert-manager --set ingressShim.defaultIssuerName=letsencrypt-prod --set IngressShim.defaultIssuerKind=ClusterIssuer
    ```

5. Create CA Cluster Issuer

    ```bash
    kubectl apply -f labs/networking/ingress/cluster-issuer.yaml
    ```

6. Create Cluster Certificate
    * Update DNS values in [certificate.yaml](./certificate.yaml)
        * Eg - `<DNSNAMEHERE>.eastus.cloudapp.azure.com`

    * Apply Cluster Certificate

    ```bash
    # Make sure DNSNAME Matches value used above
    kubectl apply -f labs/networking/ingress/certificate.yaml
    ```

7. Apply Ingress Rules
    * Update DNS values in [app-ingress.yaml](./app-ingress.yaml)

    ```bash
    # Apply Ingress Routes
    kubectl apply -f labs/networking/ingress/app-ingress.yaml

    # Check Ingress Route & Endpoints
    kubectl get ingress
    kubectl get endpoints
    ```

8. Check Ingress Route Works

    * Open dnsname.eastus.cloudapp.azure.com

## Troubleshooting / Debugging

* Check that the Service Names in the Ingress Rules match the Application Service Names.
* Check that the DNS Name associated with the Public IP endpoint matches the one in the Certificate.

## Docs / References

* [What is an Ingress Controller?](https://kubernetes.io/docs/concepts/services-networking/ingress/)

#### Next Lab: [Network Policy](../network-policy/README.md)
