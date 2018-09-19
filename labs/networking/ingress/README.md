# Lab: Configure Ingress Controller

This lab is about setting up the Ingress Controller and configuring the different routes.

## Prerequisites

* Clone this repo in Azure Cloud Shell.
* Complete previous labs for [AKS](../../create-aks-cluster/README.md) and [ACR](../../build-application/README.md).

## Instructions
Step 1 & 2 Only Needed if you did not complete Helm Setup In previous labs. Skip to step 3 if it was already completed.

1. Setup Service Account and Permissions in teh Cluster for Tiller

    ```bash
    kubectl apply -f tiller-rbac-config.yaml
    ```

2. Re-Configure Tiller to use Service Account

    ```bash
    helm init --upgrade --service-account=tiller
    ```

3. Install nginx Ingress Controller

    ```bash
    # Make sure Helm Repository is up to date
    helm repo update
    # Install Helm Repo
    helm install stable/nginx-ingress --namespace kube-system
    # Validate nginx is Installed
    helm list
    ```

4. Get Public IP Address & Update [configure-publicip-dns.sh](./configure-publicip-dns.sh) file

    ```bash
    kubectl get service -l app=nginx-ingress --namespace kube-system
    ```

    * Replace IP with Public IP Address above
    * Replace DNSNAME with DNS name to be used

    ```bash
    # Set DNSNAME to be used later
    export DNSNAME=<REPLACE-WITH-USER-INITIALS>ingress
    ```

5. Execute Configure PublicIP DNS Script

    ```bash
    chmod +x configure-publicip-dns.sh
    ./configure-publicip-dns.sh
    ```

6. Install Cert Mgr with RBAC

    ```bash
    helm install stable/cert-manager --set ingressShim.defaultIssuerName=letsencrypt-prod --set IngressShim.defaultIssuerKind=ClusterIssuer
    ```

7. Create CA Cluster Issuer

    ```bash
    kubectl apply -f cluster-issuer.yaml
    ```

8. Create Cluster Certificate
    * Update DNS values in [certificate.yaml](./certificate.yaml)
    * Apply Cluster Certificate

    ```bash
    # Make sure DNSNAME Matches value used above
    kubectl apply -f certificate.yaml
    ```

9. Apply Ingress Rules

    ```bash
    # Apply Ingress Routes
    kubectl apply -f app-ingress.yaml
    # Check Ingress Route & Endpoints
    kubectl get ingress
    kubectl get endpoints
    ```
10. Check Ingress Route Works

    * Open dnsname.eastus.cloudapp.azure.com
#### Next Lab: [Network Policy](../network-policy/README.md)

## Troubleshooting / Debugging

* Check that the Service Names in the Ingress Rules match the Application Service Names.
* Check that the DNS Name associated with the Public IP endpoint matches the one in the Certificate.

## Docs / References

* [What is an Ingress Controller?](https://kubernetes.io/docs/concepts/services-networking/ingress/)
