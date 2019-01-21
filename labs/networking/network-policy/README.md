# Lab: Configure Network Policy

In this lab we will setup Kube-Router and Network Policies to enforce communication between services via Policy.

## Prerequisites

* Complete previous labs:
    * [Azure Kubernetes Service](../../create-aks-cluster/README.md)
    * [Build Application Components in Azure Container Registry](../../build-application/README.md)
    * [Helm Setup and Deploy Application](../../helm-setup-deploy/README.md)

## Kubernetes and Kube-Router Overview

Kubernetes networking has following security model:

* Every Pod can talk to every other Pod by default so a Pod can receive traffic from any one
* Default allow behaviour can be changed to default deny on per namespace basis. When a namespace is configured with isolation tye of DefaultDeny no traffic is allowed to the pods in that namespace
* When a namespace is configured with DefaultDeny isolation type, network policies can be configured in the namespace to whitelist the traffic to the pods in that namespace

Kubernetes network policies are application centric compared to infrastructure/network centric standard firewalls. There are no explicit CIDR or IP used for matching source or destination IP’s. Network policies build up on labels and selectors which are key concepts of Kubernetes that are used to organize (for e.g all DB tier pods of app) and select subsets of objects.

In this lab we will use Kube-Router for Network Policy Management. Kube-Router will use ipsets with iptables to ensure your firewall rules have as little performance impact on your cluster as possible.

## Instructions

1. Run the following commands to deploy kube-router and verify it is running on your cluster.

   ```bash
   cd ~/kubernetes-hackfest
   kubectl apply -f ./labs/networking/network-policy/kube-router.yaml
   kubectl get daemonset -n kube-system -l k8s-app=kube-router
   ```

2. Take a look at the [deny-all file](deny-all.yaml) for an example of a Kubernetes Network Policy. In this case this is a blanket policy across all Namespaces and Pods to deny traffic. Apply the deny-all.yaml file which will break the applicaton as no communication between Pods will be allowed.

    ```bash
    kubectl apply -f ./labs/networking/network-policy/deny-all.yaml
    kubectl get networkpolicy
    ```

3. Test out the Application by going to the Dashboard and clicking on the Refresh Data button for one of the APIs. You should see that the Refresh is taking an extra long time and eventually comes back with an error. This is becuase you have denied all Ingress to Pods, which means all traffic into the Cluster.

    ![Example Error Message](img-refresh-error.png "Error from Data Refresh")

4. Test out connectivity between Pods by interacting with a Pod using kubectl exec. Let's log into the Quakes API pod and try to access somethign outside of the Pod.

    ```bash
    # Log into the Pod
    kubectl exec -it $(kubectl get pod -n hackfest -l "app=quakes-api" -o jsonpath='{.items[0].metadata.name}') -n hackfest -- /bin/sh
    # Once inside the Pod try to do a nslookup on the flights API
    nslookup flights-api
    ```

    **Sample Output:**
    ```bash
    /usr/src/app # nslookup flights-api
    nslookup: can't resolve '(null)': Name does not resolve

    nslookup: can't resolve 'flights-api': Try again
    ```

    ```bash
    # Now exit out of the Pod
    exit
    ```

5. As we can see from above all ingress and egress traffic from Pods has been blocked. Let's enable traffic between Pods in the **default** Namespace. First, take a look at the [allow default namespace file](allow-default-namespace.yaml) and notice the Ingress (from: synatx) and Egress (to: syntax) are allowed in the **default** namespace.

    ```bash
    # Apply the Allow Network Policy
    kubectl apply -f ./labs/networking/network-policy/allow-default-namespace.yaml
    kubectl get networkpolicy
    # Let's Test the nslookup again
    kubectl exec -it $(kubectl get pod -n hackfest -l "app=quakes-api" -o jsonpath='{.items[0].metadata.name}') -n hackfest -- /bin/sh
    # Once inside the Pod try to do a nslookup on the flights API
    nslookup flights-api
    ```

    **Sample Output:**
    ```bash
    /usr/src/app # nslookup flights-api
    nslookup: can't resolve '(null)': Name does not resolve

    nslookup: can't resolve 'flights-api': Try again
    ```

    ```bash
    # Now exit out of the Pod
    exit
    ```

6. So what gives as it is still not working. In order for nslookup to work it requires to be able to talk to the kube-dns server. Let's delete the Network Policy and try one that allows egress.

    ```bash
    # Delete Previous Network Allow Policy
    kubectl delete -f ./labs/networking/network-policy/allow-default-namespace.yaml
    kubectl get networkpolicy
    # Apply the Allow Network Policy
    kubectl apply -f ./labs/networking/network-policy/allow-default-namespace-with-egress.yaml
    kubectl get networkpolicy
    # Let's Test the nslookup again
    kubectl exec -it $(kubectl get pod -n hackfest -l "app=quakes-api" -o jsonpath='{.items[0].metadata.name}') -n hackfest -- /bin/sh
    # Once inside the Pod try to do a nslookup on the flights API
    nslookup flights-api
    ```

    **Sample Output:**
    ```bash
    /usr/src/app # nslookup flights-api
    nslookup: can't resolve '(null)': Name does not resolve

    Name:      flights-api
    Address 1: 10.0.230.91 flights-api.default.svc.cluster.local
    ```

    ```bash
    # Now exit out of the Pod
    exit
    ```

7. All right we now have connectivity between the Pods and it can interact with kube-dns to resolve Service Endpoints. Great, but my UI is still not responding, what do I do? We leave this last exercise up to you to figure out.

    * **Hint:** Create a Network Policy that allows the proper Ingress traffic to only the UI Pods (think PodSelectors and labels).

8. Cleanup all the Network Policies so if you do other labs they will not interfere.

    ```bash
    # Cleanup Network Policies
    kubectl delete networkpolicy --all
    kubectl get networkpolicy
    ```

## Troubleshooting / Debugging

* Check to make sure that the namespace that is in the yaml files is the same namespace that the Microservices are deployed to.

## Docs / References

* [Kubernetes Network Policy](https://kubernetes.io/docs/concepts/services-networking/network-policies/)
* [Kube-Router Docs](https://www.kube-router.io/)
* [Kube-Router Repo](https://github.com/cloudnativelabs/kube-router)

#### Next Lab: [Monitoring and Logging](../../monitoring-logging/README.md)
