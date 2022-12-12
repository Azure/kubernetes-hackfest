# Module 5: Change to the eBPF dataplane

>While the standard dataplane focuses on compatibility by inter-working with kube-proxy, and your own iptables rules, the eBPF dataplane focuses on performance, latency and improving user experience with features that aren’t possible in the standard dataplane. As part of that, the eBPF dataplane replaces kube-proxy with an eBPF implementation.

>Calico's eBPF implementation can also leave the kube-proxy pods running (but traffic still bypassing standard Linux dataplane in lieu of eBPF) in situations where a managed control-plane (like AKS') makes it difficult to delete the kube-proxy pods since AKS makes use of the Kubernetes add-on manager instead.

>AKS Wireguard currently has issues with supporting the combination of Wireguard+eBPF dataplane but eBPF dataplane **is** supported without Wireguard. Methods to work around/fix this issue are being explored to integrate into a future Calico release.

**Goal:** Disable Wireguard encryption for the cluster and swap from the standard Linux dataplane to the eBPF dataplane that will allow for preserving the source IP of traffic from outside the cluster.

**Docs:** <https://docs.projectcalico.org/maintenance/enabling-ebpf>

## Steps

1. Delete the Windows node we created from last step in your pool as windows doesn't support ebpf dataplane yet, and confirm the result.

   ```bash
   az aks nodepool delete \
   --resource-group $RGNAME \
   --cluster-name $OSSCLUSTERNAME \
   --name npwin  \
   --no-wait
   ```

   ```bash
   kubectl get nodes
   ```

   ```text
   ### The output is like:
   NAME                                STATUS   ROLES   AGE     VERSION
   aks-nodepool1-40984214-vmss000000   Ready    agent   74m     v1.22.4
   aks-nodepool1-40984214-vmss000001   Ready    agent   74m     v1.22.4
   aks-nodepool1-40984214-vmss000002   Ready    agent   73m     v1.22.4
   ```

2. Disable Wireguard encryption across all the nodes using the following command (as Wireguard+Calico eBPF isn't supported on AKS yet):

   ```bash
    calicoctl --allow-version-mismatch patch felixconfiguration default --type='merge' -p '{"spec":{"wireguardEnabled":false}}'
    ```

    Output will be like this:

    ```bash
    Successfully patched 1 'FelixConfiguration' resource
    ```

3. Verify that the nodes actually have Wireguard disabled by checking the node status set by Felix using calicoctl.

    ```bash
    kubectl get nodes
    ```

    Output will be

    ```bash
      NAME                                STATUS   ROLES   AGE     VERSION
      aks-nodepool1-42466211-vmss000000   Ready    agent   3d20h   v1.24.6
      aks-nodepool1-42466211-vmss000001   Ready    agent   3d20h   v1.24.6
      aks-nodepool1-42466211-vmss000002   Ready    agent   3d20h   v1.24.6
    ```

    ```bash
    ## NODE-NAME will be aks-nodepool1-42466211-vmss000000 for example.
    NODE_NAME=$(kubectl get nodes -o jsonpath='{.items[*].status.addresses[?(@.type=="Hostname")].address}'| awk '{print $1;}')
    sleep 10
    calicoctl --allow-version-mismatch get node $NODE_NAME -o yaml | grep wireguard

    ```

    Output should be blank showing no Wireguard interfaces or public keys.

4. Deploy the demo app `yaobank`, and run a quick test to trace the source IP address before changing to eBPF dataplane.

   a. Deloy demo application `yaobank`

   ```bash
   kubectl apply -f https://raw.githubusercontent.com/tigera/ccol2aws/main/yaobank.yaml
   ```

   b. Deploy LB for Frontend Customer Pod.

   ```bash
   cat <<EOF|kubectl apply -f -
   apiVersion: v1
   kind: Service
   metadata:
     name: yaobank-customer
     namespace: yaobank
   spec:
      selector:
        app: customer
      ports:
      - port: 80
        targetPort: 80
      type: LoadBalancer
   EOF
   ```

   c. Running a curl to the customer LoadBalancer service IP

    ```bash
    SVC_HOST=$(kubectl -n yaobank get svc yaobank-customer -ojsonpath='{.status.loadBalancer.ingress[0].ip}')
    # Curl the svc ip from your cloud shell/local shell or open in your browser to generate logs.
    curl $SVC_HOST
    ```

   >If using curl on a shell, the output should look like the following showing the HTML of the homepage for the Yaobank frontend.

    ```text
   <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
      "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

   <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
         <title>YAO Bank</title>
         <style>
         h2 {
            font-family: Arial, Helvetica, sans-serif;
         }
         h1 {
            font-family: Arial, Helvetica, sans-serif;
         }
         p {
            font-family: Arial, Helvetica, sans-serif;
         }
         </style>
      </head>
      <body>
         <h1>Welcome to YAO Bank</h1>
         <h2>Name: Spike Curtis</h2>
         <h2>Balance: 2389.45</h2>
         <p><a href="/logout">Log Out >></a></p>
      </body>
   </html>
    ```

   d. Checking the source IP from the pod logs

    ```bash
    # Get the customer pod name and output the logs
    export CUSTOMER_POD=$(kubectl get pods -n yaobank -l app=customer -o name)
    kubectl logs -n yaobank $CUSTOMER_POD
    ```

    > Output should be similar as below, the node's private IP will show up as source IP. You see the node IP because the traffic is passed through kube-proxy pods and hits the Linux IPtables rules, which will NAT the traffic to the node IP.

    ```text
   10.224.0.62 - - [12/Dec/2022 18:55:38] "GET / HTTP/1.1" 200 -
   10.224.0.4 - - [12/Dec/2022 18:55:45] "GET / HTTP/1.1" 200 -
    ```

5. Configure Calico to connect directly to the Kubernetes API server.

   ```bash
   # Extract the Kubernetes API server address
   kubectl cluster-info | grep Kubernetes
   ```

   > Output is similar to:

   ```bash
   Kubernetes control plane is running at https://aks-oss-my-aks-rg-xxxxx-yyyyy-zzzzz.hcp.eastus.azmk8s.io:443
   ```

   Create configmap for calico-node to know how to contact Kubernetes API server.

   ```bash
   ## Use the output server FQDN to create a configmap. 
   cat > cm.yaml <<EOF
   kind: ConfigMap
   apiVersion: v1
   metadata:
     name: kubernetes-services-endpoint
     namespace: tigera-operator
   data:
     KUBERNETES_SERVICE_HOST: "<API server FQDN>"  
     KUBERNETES_SERVICE_PORT: "443"
   EOF
   ```

   ```bash
   # Edit the cm yaml file by replacing the API server host address before apply it 
   kubectl apply -f cm.yaml
   ```

   ```bash
   # Restart tigera-operator
   kubectl rollout restart deployment tigera-operator -n tigera-operator
   ```

6. The operator will pick up the change to the config map automatically and do a rolling update to pass on the change. Confirm that pods restart and then reach the Running state with the following command:

   ```bash
   kubectl get pods -n calico-system -w
   ```

   > If you do not see the pods restart then it’s possible that the ConfigMap wasn’t picked up (sometimes Kubernetes is slow to propagate ConfigMaps (see Kubernetes issue #30189)). You can try restarting the operator.

   ```bash
   kubectl delete pods -n calico-system --all
   # Verify all pods restart successfully
   kubectl get pods -n calico-system 
   ```

7. Replace kube-proxy
   > In eBPF mode, Calico replaces kube-proxy so it wastes resources to run the kube-proxy pods when switching the dataplane to eBPF. However, this approach is not suitable for AKS with Azure CNI since the platform makes use of the Kubernetes add-on manager, and the changes will be reverted by the system. For AKS, we leave the kube-proxy pods alone as a compromise and take the (minor) resource hit by leaving them running.

   We *must* utilize a Felix configuration parameter called ```BPFKubeProxyIptablesCleanupEnabled``` and set it to false. This can be done with ```calicoctl``` as follows:

   ```bash
   calicoctl --allow-version-mismatch patch felixconfiguration default --patch='{"spec": {"bpfKubeProxyIptablesCleanupEnabled": false}}'
   ```

   Check the Felix configuration to ensure that ```bpfKubeProxyIptablesCleanupEnabled``` is set properly to ```false``` and also to verify that the ```wireguardenabled``` flag is set to ```false```:

   ```bash
   calicoctl --allow-version-mismatch get felixconfiguration default -o yaml
   ```

   Output should show similar to

   ```bash
   apiVersion: projectcalico.org/v3
   kind: FelixConfiguration
   metadata:
   creationTimestamp: "2022-12-08T21:45:45Z"
   name: default
   resourceVersion: "16715"
   uid: 9dcaa9ac-3c62-4731-a2a3-475febe59c57
   spec:
   bpfKubeProxyIptablesCleanupEnabled: false
   bpfLogLevel: ""
   floatingIPs: Disabled
   logSeverityScreen: Info
   reportingInterval: 0s
   wireguardEnabled: false
   ```

8. Enable eBPF mode
   > To enable eBPF mode, change the spec.calicoNetwork.linuxDataplane parameter in the operator’s Installation resource to "BPF"; you must also clear the hostPorts setting because host ports are not supported in BPF mode.

   ```bash
   kubectl patch installation.operator.tigera.io default --type merge -p '{"spec":{"calicoNetwork":{"linuxDataplane":"BPF", "hostPorts":null}}}'
   ```

9. Restart kube-dns and yaobank pod.

   > When the dataplane changes, it disrupts any existing connections, and as a result it’s a good idea to replace the pods that are running. In our specific case, deleting the kube-dns pods will ensure that connectivity for these pods is running fully on the eBPF dataplane, as these pods are integral to Kubernetes functionality.

   ```bash
   kubectl delete pod -n kube-system -l k8s-app=kube-dns
   kubectl delete pods -n yaobank --all
   ```

10. Curl the `yaobank-customer` service again and confirm the public IP address of cloudshell or your local shell show up as source IP in pod logs, rather than the node IP which we saw via kube-proxy.

      ```bash
      # Curl the svc ip from your cloud shell/local shell or open in your browser to generate logs.
      curl $SVC_HOST
      ```

      ```bash
      # Check the source IP from pod log
      export CUSTOMER_POD=$(kubectl get pods -n yaobank -l app=customer -o name)
      kubectl logs -n yaobank $CUSTOMER_POD
      ```

      Output should be similar as below, the user's public IP will show up as source IP. In the following output example, the user's public IP is partially obscured for security.

      ```text
      40.112.xx.yy - - [26/Oct/2021 19:54:13] "GET / HTTP/1.1" 200 -
      173.178.61.132 - - [26/Oct/2021 19:55:37] "GET / HTTP/1.1" 200 -
      ```

## Reversing to standard Linux dataplane from eBPF dataplane

1. Reverse the changes to the operator’s Installation back to the standard Linux/Iptables dataplane

   ```bash
   kubectl patch installation.operator.tigera.io default --type merge -p '{"spec":{"calicoNetwork":{"linuxDataplane":"Iptables"}}}'
   ```

2. Reverse the changes to the Felix configuration

   ```bash
   calicoctl --allow-version-mismatch patch felixconfiguration default --patch='{"spec": {"bpfKubeProxyIptablesCleanupEnabled": null}}'
   ```

3. Verify the Felix configuration that the option is removed

   ```bash
   calicoctl --allow-version-mismatch get felixconfiguration default -o yaml
   ```

   Output is similar to:

   ```bash
   apiVersion: projectcalico.org/v3
   kind: FelixConfiguration
   metadata:
   creationTimestamp: "2022-12-08T21:45:45Z"
   name: default
   resourceVersion: "1621446"
   uid: 9dcaa9ac-3c62-4731-a2a3-475febe59c57
   spec:
   bpfLogLevel: ""
   floatingIPs: Disabled
   logSeverityScreen: Info
   reportingInterval: 0s
   wireguardEnabled: false
   ```

4. Restart kube-dns and yaobank pods.

   ```bash
   kubectl delete pod -n kube-system -l k8s-app=kube-dns
   kubectl delete pods -n yaobank --all
   ```

5. Delete the configmap which created for calico-node as we don't need connect to api server directly anymore.

   ```bash
   # Delete ConfigMap
   kubectl delete cm -n tigera-operator kubernetes-services-endpoint 
   ```

   ```bash
   # Restart tigera-operator deployment
   kubectl rollout restart deployment tigera-operator -n tigera-operator
   ```

   ```bash
   # Confirm calico-node restart again
   kubectl get pods -n calico-system
   ```

6. Confirm the source IP in yaobank-customer pod has been reversed to showing the node private IP.

   ```bash
   # Check the source IP from pod log
   export CUSTOMER_POD=$(kubectl get pods -n yaobank -l app=customer -o name)
   curl $SVC_HOST
   kubectl logs -n yaobank $CUSTOMER_POD
   ```

## Conclusion

Congratulations! You've completed the labs for Calico Open Source on AKS. Calico can provide even more amazing capabilities through Calico Cloud by Tigera. To explore those features through additional labs, continue below.

>**Note:** The Calico Cloud labs will start by creating a new AKS Cluster with the proper configuration to enable Calico Cloud.

[Next -> Chapter 2-Module 0](../calicocloud/creating-aks-cluster.md)
