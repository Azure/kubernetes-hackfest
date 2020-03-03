# Lab: Best Practices for Cluster Operators

This lab walks through some basic best practices for operators using AKS. In many cases, the operations and developer best practices overlap. 

## Prerequisites

* Complete previous labs:
    * [Azure Kubernetes Service](../create-aks-cluster/README.md)
    * [Build Application Components in Azure Container Registry](../build-application/README.md)
    * [Helm Setup and Deploy Application](../helm-setup-deploy/README.md)

## Instructions

This lab has a number of exercises in no particular order:

- [Image Vulnerability Scanning](#image-vulnerability-scanning)
- [Upgrade Kubernetes Regularly](#Upgrade-Kubernetes-Regularly)
- [Process Node Updates and Reboots Using kured](#Process-Node-Updates-and-Reboots-Using-kured)
- [Enforce Resource Quotas](#Enforce-Resource-Quotas)
- [Pod Disruption Budgets](#Pod-Disruption-Budgets)
- [Network Security](#Network-Security)
- [Provide Dedicated Nodes using Taints and Tolerations](#Provide-Dedicated-Nodes-using-Taints-and-Tolerations)
- [Using Role Based Access Control (RBAC)](#Using-Role-Based-Access-Control-(RBAC))
- [Pod Identities](#Pod-Identities)
- [Backup and Business Continuity](#Backup-and-Business-Continuity)
- [App Armor and seccomp Filtering](#App-Armor-and-seccomp-Filtering)
- [Use kube-advisor to check for issues](#Use-kube-advisor-to-check-for-issues)


### Image Vulnerability Scanning
- - -

* It is critical to scan images for vulnerabilities in your environment. We recommending using a Enterprise grade tool such as [Aqua Security](https://www.aquasec.com/products/aqua-container-security-platform) or [Twistlock](https://www.twistlock.com/why-twistlock)

* There are also numerous open source tools that provide basic image scanning for CVE's. https://opensource.com/article/18/8/tools-container-security 

* These tools should be integrated into the CI/CD pipeline, Container Regsitry, and container runtimes to provide end-to-end protection. Review full guidance here: https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-container-image-management 

* In our lab, we will use Anchore for some quick testing. https://anchore.com/opensource 

    * Install anchore with helm

        ```bash
        helm install anchore-demo stable/anchore-engine
        ```
        > Note: It may take a few minutes for all of the pods to start and for the CVE data to be loaded into the database. 

    * Exec into the analyzer pod to access the CLI

        ```bash
        kubectl get pod -l app=anchore-demo-anchore-engine -l component=analyzer

        NAME                                                   READY   STATUS    RESTARTS   AGE
        anchore-demo-anchore-engine-analyzer-974d7479d-7nkgp   1/1     Running   0          2h
        ```
        ```bash
        # now exec in
        kubectl exec -it anchore-demo-anchore-engine-analyzer-974d7479d-7nkgp bash
        ```

    * Set env variables to configure CLI (while exec'd into pod)

        ```bash
        ANCHORE_CLI_USER=admin
        ANCHORE_CLI_PASS=foobar
        ANCHORE_CLI_URL=http://anchore-demo-anchore-engine-api.default.svc.cluster.local:8228/v1/
        ```

    * Check status (while exec'd into pod)

        ```bash
        anchore-cli system status

        Service catalog (anchore-demo-anchore-engine-catalog-5fd7c96898-xq5nj, http://anchore-demo-anchore-engine-catalog:8082): up
        Service analyzer (anchore-demo-anchore-engine-analyzer-974d7479d-7nkgp, http://anchore-demo-anchore-engine-analyzer:8084): up
        Service apiext (anchore-demo-anchore-engine-api-7866dc7fcc-nk2l7, http://anchore-demo-anchore-engine-api:8228): up
        Service policy_engine (anchore-demo-anchore-engine-policy-578f59f48d-7bk9v, http://anchore-demo-anchore-engine-policy:8087): up
        Service simplequeue (anchore-demo-anchore-engine-simplequeue-5b5b89977c-nzg8r, http://anchore-demo-anchore-engine-simplequeue:8083): up

        Engine DB Version: 0.0.8
        Engine Code Version: 0.3.1
        ```

    * Connect Anchore to ACR (you will need to set these variables since they are not in the container profile)

        ```bash
        APPID=
        CLIENTSECRET=
        ACRNAME=

        anchore-cli registry add --registry-type docker_v2 $ACRNAME $APPID $CLIENTSECRET

        Registry: youracr.azurecr.io
        User: 59343209-9d9e-464d-8508-068a3d331fb9
        Type: docker_v2
        Verify TLS: True
        Created: 2019-01-10T17:56:05Z
        Updated: 2019-01-10T17:56:05Z
        ```

    * Add our images and check for issues

        ```bash
        anchore-cli image add youracr.azurecr.io/hackfest/service-tracker-ui:1.0
        anchore-cli image add youracr.azurecr.io/hackfest/data-api:1.0
        anchore-cli image add youracr.azurecr.io/hackfest/flights-api:1.0
        anchore-cli image add youracr.azurecr.io/hackfest/quakes-api:1.0
        anchore-cli image add youracr.azurecr.io/hackfest/weather-api:1.0
        ```
        ```bash
        # first wait for all images to be "analyzed"
        anchore-cli image list

        # then view results (there are none in these images thankfully)
        anchore-cli image vuln youracr.azurecr.io/hackfest/service-tracker-ui:1.0 all

        # show os packages
        anchore-cli image content youracr.azurecr.io/hackfest/service-tracker-ui:1.0 os
        ```
    

### Upgrade Kubernetes Regularly
- - -

* To stay current on new features and bug fixes, regularly upgrade to the Kubernetes version in your AKS cluster.

    ```bash
    az aks get-upgrades --resource-group $RGNAME --name $CLUSTERNAME
    ```

    ```bash
    # change the image version below based on your cluster (if upgrade is available)
    KUBERNETES_VERSION=1.11.5
    az aks upgrade --resource-group $RGNAME --name $CLUSTERNAME --kubernetes-version $KUBERNETES_VERSION
    ```

### Process Node Updates and Reboots Using kured
- - -

AKS automatically downloads and installs security fixes on each of the worker nodes, but does not automatically reboot if necessary.

The open-source kured [(KUbernetes REboot Daemon)](https://github.com/weaveworks/kured) project by Weaveworks watches for pending node reboots. When a node applies updates that require a reboot, the node is safely cordoned and drained to move and schedule the pods on other nodes in the cluster. 

* Deploy kured into the AKS cluster

    ```bash
    kubectl apply -f https://github.com/weaveworks/kured/releases/download/1.1.0/kured-1.1.0.yaml
    ```

* Check status. Since kured is installed with a DaemonSet, you will see one kured pod per node in your cluster.

    ```bash
    kubectl get pod -n kube-system -l name=kured

    NAME          READY   STATUS    RESTARTS   AGE
    kured-22s4v   1/1     Running   0          1m
    kured-5hbqz   1/1     Running   0          1m
    kured-ljsv4   1/1     Running   0          1m
    kured-mnkcl   1/1     Running   0          1m
    kured-wv9pp   1/1     Running   0          1m
    ```

* You're done. Re-boots will happen automatically if security updates are applied.
    * You can force an re-boot as described [here.](https://docs.microsoft.com/en-us/azure/aks/node-updates-kured#update-cluster-nodes)


### Enforce Resource Quotas
- - -

In our first lab, we introduced resource quotas with namespaces. You can review those steps again [here.](../../create-aks-cluster/README.md)

### Pod Disruption Budgets
- - -

We can use "pod disruption budgets" to make sure a minimum number of pods are available. These pod disruption budgets can help ensure availability during voluntary updates to our deployments such as container image upgrades, etc.

* First, scale out a deployment to create more pods for the test

    ```bash
    kubectl scale deployment service-tracker-ui -n hackfest --replicas=4
    ```

* Create a pod disruption budget

    Review the spec and then deploy:
    ```yaml
    apiVersion: policy/v1beta1
    kind: PodDisruptionBudget
    metadata:
      name: service-tracker-pdb
    spec:
      minAvailable: 2
     selector:
       matchLabels:
         app: service-tracker-ui
    ```

    ```bash
    kubectl apply -f labs/best-practices/operators/pod-disruption-budget.yaml -n hackfest
    ```

* Create a new version of the service-tracker-ui

    ```bash
    az acr build -t hackfest/service-tracker-ui:newversion -r $ACRNAME --no-logs app/service-tracker-ui
    ```

* Watch the pods in the namespace

    ```bash
    watch kubectl get pod -n hackfest
    ```

* Perform the upgrade (you will need a new terminal/cloud shell session for this)

    ```bash
    kubectl set image deployment/service-tracker-ui service-tracker-ui=briaracr.azurecr.io/hackfest/service-tracker-ui:newversion -n hackfest
    ```

* Based on our PDB, you should see 2 pods running at all times while the pods are being updated to the new image


### Use kube-advisor to check for issues
- - -

* Create a service account and role binding

    ```bash    
    kubectl apply -f labs/best-practices/operators/sa-kube-advisor.yaml
    ```

* Create the pod

    ```bash
    kubectl run --rm -i -t kube-advisor --image=mcr.microsoft.com/aks/kubeadvisor --restart=Never --overrides="{ \"apiVersion\": \"v1\", \"spec\": { \"serviceAccountName\": \"kube-advisor\" } }"
    ```

* Review results


### Provide Dedicated Nodes using Taints and Tolerations
- - -


### Using Role Based Access Control (RBAC)
- - -


### Pod Identities
- - -


### Backup and Business Continuity
- - -


### App Armor and seccomp Filtering
- - -



## Troubleshooting / Debugging


## Docs / References

* [Full AKS Best Practices Documentation](https://docs.microsoft.com/en-us/azure/aks/best-practices)
* [Install Anchore using Helm](https://anchore.freshdesk.com/support/solutions/articles/36000060726-installing-anchore-using-helm)
