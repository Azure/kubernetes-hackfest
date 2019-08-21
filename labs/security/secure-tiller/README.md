# Lab: Install Secure Tiller in Single Namespace

This lab walks through how to secure tiller in a single namespace to restrict access from entire cluster.

## Instructions

1. Create Helm/Tiller for **dev** Namespace

    ```bash
    # Move to the lab directory
    cd labs/security/secure-tiller/

    # Create kubeconfig file for tiller Service Account (Useful for DevOps)
    chmod a+x tiller-namespace-setup.sh
    ./tiller-namespace-setup.sh tiller dev

    # Create AKS ServiceAccount, Role and Bindings
    kubectl apply -f tiller-rbac-config.yaml

    # Get List of ServiceAccounts and Pods in dev Namespace
    kubectl get sa,po -n dev

    # Generate Certificate Authority
    openssl genrsa -out ./ca.key.pem 4096
    openssl req -key ca.key.pem -new -x509 -days 7300 -sha256 -out ca.cert.pem -extensions v3_ca -config openssl-with-ca.cnf
    # Generate Tiller Certificate
    openssl genrsa -out ./tiller.key.pem 4096
    # Generate Helm Client Certificate
    openssl genrsa -out ./helm.key.pem 4096
    # Create Certificates from Keys
    openssl req -key tiller.key.pem -new -sha256 -out tiller.csr.pem
    openssl req -key helm.key.pem -new -sha256 -out helm.csr.pem
    # Sign CSRs with CA Certificate
    openssl x509 -req -CA ca.cert.pem -CAkey ca.key.pem -CAcreateserial -in tiller.csr.pem -out tiller.cert.pem -days 365
    openssl x509 -req -CA ca.cert.pem -CAkey ca.key.pem -CAcreateserial -in helm.csr.pem -out helm.cert.pem  -days 365
    ```
    * Make sure the following files are now in the directory:
        * ca.cert.pem
        * ca.key.pem
        * helm.cert.pem
        * helm.key.pem
        * tiller.cert.pem
        * tiller.key.pem

    ```bash
    # Deploy Tiller to dev Namespace
    helm init --tiller-namespace dev --service-account tiller --tiller-tls --tiller-tls-cert ./tiller.cert.pem --tiller-tls-key ./tiller.key.pem --tiller-tls-verify --tls-ca-cert ca.cert.pem

    # Check Helm Connectivity
    helm ls --tiller-namespace dev --tls --tls-ca-cert ca.cert.pem --tls-cert helm.cert.pem --tls-key helm.key.pem

    # To avoid always having to supply the certificates, they can be added to
    # the user's HELM Home directory (~/.helm/)
    # cp ca.cert.pem ~/.helm/ca.pem
    # cp helm.cert.pem ~/.helm/cert.pem
    # cp helm.key.pem ~/.helm/key.pem
    # After being copied user can now use: helm ls --tls

    # Get List of ServiceAccounts and Pods in dev Namespace
    kubectl get sa,po -n dev

    # Test with Service Account (notice no namespace defined)
    KUBECONFIG=/tmp/kube/k8s-tiller-dev-conf kubectl get pods

    # Test Helm Deployment to dev Namespace
    KUBECONFIG=/tmp/kube/k8s-tiller-dev-conf helm install --tls --tls-ca-cert ca.cert.pem --tls-cert helm.cert.pem --tls-key helm.key.pem --namespace dev stable/mysql --tiller-namespace dev
    ```

## Troubleshooting / Debugging

* Check to see that the name of the Service Account and name of Role are referenced correctly in the RoleBinding.

## Docs / References

* [Helm Docs](https://docs.helm.sh)
* [Using SSL Between Helm Client and Tiller Server](https://docs.helm.sh/using_helm/#using-ssl-between-helm-and-tiller)
