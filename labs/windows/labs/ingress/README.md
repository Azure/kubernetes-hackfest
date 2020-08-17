# Lab: Configure Ingress Controller

In this lab, we will deploy a Kubernetes ingress controller and route traffic to our site. We'll also deploy a second instance of our site to demonstrate how an ingress controller can serve traffic to multiple backends.

An ingress controller is a piece of software that provides reverse proxy, configurable traffic routing, and TLS termination for Kubernetes services. Kubernetes ingress resources are used to configure the ingress rules and routes for individual Kubernetes services. Using an ingress controller and ingress rules, a single IP address can be used to route traffic to multiple services in a Kubernetes cluster.

## Prerequisites

* Complete previous labs:
    * [Azure Kubernetes Service](../create-aks-cluster/README.md)
    * [Build Application Components in Azure Container Registry](../build-application/README.md)
    * [Helm Setup and Deploy Application](../helm-setup-deploy/README.md)

## Instructions

1. Remove public IP addresses for services

    We do not need a public IP for the website when using an Ingress route.

    ```bash
    # delete existing service
    kubectl delete svc jabbr -n jabbr
    ```

    > Note. It should not be necessary to delete this, but there is a bug with kubectl and how it handles services and NodePorts. 

    ```bash
    # update chart to install service again as ClusterIP
    helm upgrade jabbr chart -n jabbr --set service.type=ClusterIP
    ```

1. Create the NGINX ingress controller

    ```bash
    # Add the official stable repository
    helm repo add stable https://kubernetes-charts.storage.googleapis.com/

    # Make sure Helm Repository is up to date
    helm repo update

    # Install ingress controller via helm chart
    # Note the use of a node selector since NGINX wont
    # run on windows nodes.
    helm install nginx-ingress stable/nginx-ingress \
    --namespace jabbr \
    --set controller.replicaCount=2 \
    --set controller.nodeSelector."beta\.kubernetes\.io/os"=linux \
    --set defaultBackend.nodeSelector."beta\.kubernetes\.io/os"=linux
    
    # Validate nginx is installed and running
    helm ls --all-namespaces
    kubectl get service -l app=nginx-ingress --namespace jabbr
    ```

1. Create an ingress route

    * Take a look at `jabbr-ingress.yaml`. Note the use of 'jabbr' for the hostname and the backend that is being targetted.

    * Apply

        ```bash
        # Go to the ingress lab directory
        cd ~/kubernetes-hackfest/labs/windows/labs/ingress

        # Apply the first ingress route
        kubectl apply -f jabbr-ingress.yaml -n jabbr
        ```

1. Setup name resolution for your ingress controller
   >**NOTE:** Typically you would use your prefered enterprise DNS solution to create a public or private A record to bind the ingress controller IP address with the appropriate FQDN, but for lab purposes we'll just use your hosts file.
    * Get your service 'EXTERNAL-IP' address value
      ```bash
      kubectl get svc nginx-ingress-controller -n jabbr
      ```
    * Edit your local /etc/hosts file

      **MacOS**
      ```bash
      # Use vi, nano or other preferred editor and append the following to the end of your /etc/hosts file
      <EXTERNAL-IP> jabbr

      Your file should look something like this:

      #########################################################
      # Host Database
      #
      # localhost is used to configure the loopback interface
      # when the system is booting.  Do not change this entry.
      ##
      127.0.0.1	localhost
      255.255.255.255	broadcasthost
      ::1             localhost

      52.191.235.59 jabbr
      ```

      **Windows**
      ```
      # Using your preferred text editor open the following path:
      c:\windows\system32\drivers\etc\hosts

      # Your file should look something like this:
      # Copyright (c) 1993-2009 Microsoft Corp.
      #
      # This is a sample HOSTS file used by Microsoft TCP/IP for Windows.
      #
      # This file contains the mappings of IP addresses to host names. Each
      # entry should be kept on an individual line. The IP address should
      # be placed in the first column followed by the corresponding host name.
      # The IP address and the host name should be separated by at least one
      # space.
      #
      # Additionally, comments (such as these) may be inserted on individual
      # lines or following the machine name denoted by a '#' symbol.
      #
      # For example:
      #
      #      102.54.94.97     rhino.acme.com          # source server
      #       38.25.63.10     x.acme.com              # x client host

      # localhost name resolution is handled within DNS itself.
      #	127.0.0.1       localhost
      #	::1             localhost
      # Added by Docker Desktop
      172.16.2.4 host.docker.internal
      172.16.2.4 gateway.docker.internal
      # To allow the same kube context to work on the host and the container:
      127.0.0.1 kubernetes.docker.internal
      # End of section

      52.186.38.32 jabbr

      ```

1. Test configuration using an incognito window in your preferred browser.

    Browse to your URL. Eg - http://jabbr

1. Install a second copy of the JabbR app

    ```bash
    # Go back to your JabbR directory
    cd ~/JabbR

    # Install a second instance of your Jabbr App
    helm install jabbr2 chart -n jabbr --set service.name=jabbr2 --set service.type=ClusterIP --set deploy.name=jabbr2
    
    # Check the pods are all running
    kubectl get svc,pods -n jabbr
    ```

1. Edit your jabbr-ingress.yaml file and add the following to create a second ingress configuration (**NOTE:** Dont miss the '---' as this is used to separate manifests in a single file. Alternatively could create a second file):

    ```bash
    cd ~/kubernetes-hackfest/labs/windows/labs/ingress
    nano jabbr-ingress.yaml
    ```

    Append the following
    ```yaml
    ---
    apiVersion: networking.k8s.io/v1beta1
    kind: Ingress
    metadata:
        name: jabbr2-ingress
        namespace: jabbr
        annotations:
          kubernetes.io/ingress.class: nginx
          nginx.ingress.kubernetes.io/ssl-redirect: "false"
    spec:
      rules:
      - host: jabbr2
        http:
          paths:
          - path: /
            backend:
              serviceName: jabbr2
              servicePort: 80
    ```

    Apply the updated ingress
    ```bash
    kubectl apply -f jabbr-ingress.yaml -n jabbr
    ```

    Check your routes have been applied:
    ```bash
    kubectl get ingress -n jabbr
    
    # Sample Output
    # Note: The address field may take a minute to populate

    NAME             HOSTS    ADDRESS      PORTS   AGE
    jabbr-ingress    jabbr    10.240.0.4   80      29m
    jabbr2-ingress   jabbr2   10.240.0.4   80      30s
    ```

1. Add another entry to your etc/hosts for the second instance of the application following the same instructions you used to edit the first file. Your etc/hosts entry should now look like the following:

    ```bash
    52.186.38.32 jabbr jabbr2
    ```

1. In another incognito window or tab browse to the new instance at http://jabbr2
## Troubleshooting / Debugging

* Check that the Service Names in the Ingress Rules match the Application Service Names

## Docs / References

* [Create an ingress controller in Azure Kubernetes Service (AKS)](https://docs.microsoft.com/en-us/azure/aks/ingress-basic)
* [What is an Ingress Controller?](https://kubernetes.io/docs/concepts/services-networking/ingress/)
* [Whitelisting egress traffic](https://docs.microsoft.com/en-us/azure/aks/egress)

