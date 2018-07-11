# Lab: Configure Ingress Controller

This lab is about setting up the Ingress Controller and configuring the different routes.

## Prerequisites 

1. Create AKS Cluster
2. Build Application
3. Deploy App via Helm

## Instructions

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
    ./configureaksingressdns.sh
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
    * Update Ingress Rules in [app-ingress.yaml](./app-ingress.yaml) to align to web-ui, auth-api and flights-api
    * Apply Ingress Rules

    ```bash
    # Apply Ingress Routes
    kubectl apply -f app-ingress.yaml
    # Check Ingress Route & Endpoints
    kubectl get ingress
    kubectl get endpoints
    ```

## Troubleshooting / Debugging

* Check that the Service Names in the Ingress Rules match the Application Service Names.
* Check that the DNS Name associated with the Public IP endpoint matches the one in the Certificate.

## Docs / References

* [What is an Ingress Controller?](https://kubernetes.io/docs/concepts/services-networking/ingress/)