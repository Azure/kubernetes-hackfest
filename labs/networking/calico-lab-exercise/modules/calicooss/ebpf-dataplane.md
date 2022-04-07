# Module 5: Change to eBPF dataplane
>While the standard dataplane focuses on compatibility by inter-working with kube-proxy, and your own iptables rules, the eBPF dataplane focuses on performance, latency and improving user experience with features that aren’t possible in the standard dataplane. As part of that, the eBPF dataplane replaces kube-proxy with an eBPF implementation. 

**Goal:** Swap your kube-proxy from standard Linux dataplane to eBPF dataplane for preserving the source IP of traffic from outside

**Docs:** https://docs.projectcalico.org/maintenance/enabling-bpf


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


2. Deploy the demo app `yaobank`, and run a quick test to trace the source IP address before changing to eBPF dataplane.

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

   c. Check the source IP when curl customer svc 

    ```bash
    SVC_HOST=$(kubectl -n yaobank get svc yaobank-customer -ojsonpath='{.status.loadBalancer.ingress[0].ip}')
    #Curl the svc ip from your cloud shell/local shell or open in your browser to generate logs.
    curl $SVC_HOST
    ```
    
    ```bash
    #check the source IP fromm pod log
    export CUSTOMER_POD=$(kubectl get pods -n yaobank -l app=customer -o name)
    kubectl logs -n yaobank $CUSTOMER_POD
    ```
 
    > Output should be similar as below, the node private IP will show up as source IP. You see the node IP because the traffic is passed through kube-proxy rules, which will NAT the traffic to the node IP.
    ```text
    10.240.0.35 - - [08/Nov/2021 21:49:42] "GET / HTTP/1.1" 200 -
    10.240.0.4 - - [08/Nov/2021 21:51:25] "GET / HTTP/1.1" 200 -
    ```

3. Configure Calico to connect directly to the API server. 

   ```bash
   ##Extract API server address
   kubectl cluster-info | grep Kubernetes
   ```

   > Output is similar:

   ```bash
   # "aks-oss-je-aks-rg-xxxxxxxyyyyyyzzzzzz.hcp.eastus.azmk8s.io" is your api server host
   Kubernetes control plane is running at https://aks-oss-je-aks-rg-xxxxxxxyyyyyyzzzzzz.hcp.eastus.azmk8s.io:443
   ```

   Create configmap for calico-node to know how to contact Kubernetes API server.
   ```bash
   ##use above server host to create configmap. 
   cat > cm.yaml <<EOF
   kind: ConfigMap
   apiVersion: v1
   metadata:
     name: kubernetes-services-endpoint
     namespace: tigera-operator
   data:
     KUBERNETES_SERVICE_HOST: "<API server host>"  
     KUBERNETES_SERVICE_PORT: "443"
   EOF
   ```

   ```bash
   #edit the cm yaml file by replacing the API server host address before apply it 
   kubectl apply -f cm.yaml
   ```

   ```bash
   #restart tigera-operator
   kubectl rollout restart deployment tigera-operator -n tigera-operator
   ```

4. The operator will pick up the change to the config map automatically and do a rolling update to pass on the change. Confirm that pods restart and then reach the Running state with the following command:
   ```bash
   kubectl get pods -n calico-system -w
   ```
   > If you do not see the pods restart then it’s possible that the ConfigMap wasn’t picked up (sometimes Kubernetes is slow to propagate ConfigMaps (see Kubernetes issue #30189)). You can try restarting the operator.
   ```bash
   kubectl delete pods -n calico-system --all
   #Verify all pods restart successfully
   kubectl get pods -n calico-system 
   ```

5. Replace kube-proxy 
   > In eBPF mode, Calico replaces kube-proxy so it wastes resources to run both. To disable kube-proxy reversibly, we recommend adding a node selector to kube-proxy’s DaemonSet that matches no nodes. By doing so, we’re telling kube-proxy not to run on any nodes (because they’re all running Calico):
   

   ```bash
   kubectl patch ds -n kube-system kube-proxy -p '{"spec":{"template":{"spec":{"nodeSelector":{"non-calico": "true"}}}}}'
   ```
   
   ```bash
   #Confirm kube-proxy is no longer running
   kubectl get pods -n kube-system
   ```

6. Enable eBPF mode
   > To enable eBPF mode, change the spec.calicoNetwork.linuxDataplane parameter in the operator’s Installation resource to "BPF"; you must also clear the hostPorts setting because host ports are not supported in BPF mode.

   ```bash
   kubectl patch installation.operator.tigera.io default --type merge -p '{"spec":{"calicoNetwork":{"linuxDataplane":"BPF", "hostPorts":null}}}'
   ```

7. Restart kube-dns and yaobank pod.

   > When the dataplane changes, it disrupts any existing connections, and as a result it’s a good idea to replace the pods that are running. In our specific case, deleting the kube-dns pods will ensure that connectivity for these pods is running fully on the eBPF dataplane, as these pods are integral to Kubernetes functionality.

   ```bash
   kubectl delete pod -n kube-system -l k8s-app=kube-dns
   kubectl delete pods -n yaobank --all
   ```

8. Curl the `yaobank-customer` service again and confirm the public IP address of cloudshell or your local shell show up as source IP in pod logs, rather than the node IP which we saw via kube-proxy. 

   ```bash
   #Curl the svc ip from your cloud shell/local shell or open in your browser to generate logs.
   curl $SVC_HOST
   ```
    
   ```bash
   #check the source IP fromm pod log
   export CUSTOMER_POD=$(kubectl get pods -n yaobank -l app=customer -o name)
   kubectl logs -n yaobank $CUSTOMER_POD
   ```
 
   > Output should be similar as below, the public IP will show up as source IP.
   ```text
   40.114.1.180 - - [26/Oct/2021 19:54:13] "GET / HTTP/1.1" 200 -
   173.178.61.132 - - [26/Oct/2021 19:55:37] "GET / HTTP/1.1" 200 -
   ```


## <Option> - Reverse to standard Linux dataplane from eBPF dataplane 

1. Reverse the changes to the operator’s Installation

   ```bash
   kubectl patch installation.operator.tigera.io default --type merge -p '{"spec":{"calicoNetwork":{"linuxDataplane":"Iptables"}}}'
   ```
2. Re-enable kube-proxy by removing the node selector added above

   ```bash
   kubectl patch ds -n kube-system kube-proxy --type merge -p '{"spec":{"template":{"spec":{"nodeSelector":{"non-calico": null}}}}}'
   ```

3. Restart kube-dns and yaobank pod.

   ```bash
   kubectl delete pod -n kube-system -l k8s-app=kube-dns
   kubectl delete pods -n yaobank --all
   ```

4. Delete the configmap which created for calico-node as we don't need connect to api server directly anymore.

   ```bash
   kubectl delete cm -n tigera-operator kubernetes-services-endpoint 
   ```
   
   ```bash
   #restart tigera-operator
   kubectl rollout restart deployment tigera-operator -n tigera-operator
   ```

   ```bash
   #confirm calico-node restart again
   kubectl get pods -n calico-system
   ```

5. Confirm the source IP in yaobank-customer pod been reversed to node private IP.

   ```bash
   #check the source IP fromm pod log
   export CUSTOMER_POD=$(kubectl get pods -n yaobank -l app=customer -o name)
   curl $SVC_HOST
   kubectl logs -n yaobank $CUSTOMER_POD
   ```
 

## Conclusion

Congratulations! You've completed the labs for Calico Open Source on AKS. Calico can provide even more amazing capabilities through Calico Cloud by Tigera. To explore those features through additional labs, continue below.

>**Note:** The Calico Cloud labs will start by creating a new AKS Cluster with the proper configuration to enable Calico Cloud.

[Next -> Chapter 2-Module 0](../calicocloud/creating-aks-cluster.md)