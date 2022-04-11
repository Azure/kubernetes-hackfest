# Module 4: Enabling wireguard to secure on-the-wire for your AKS cluster
>Wireguard enable layer 3 encryption, you can enable it with one command setting, we do everything else (interface, peer configuration, sharing public keys, route tables, ip rules, etc), Wireguard could be disabled/enabled on the entire cluster, or specific nodes, for specific nodes configuration, please refer to doc as below.


**Goal:** Enable WireGuard to secure on-the-wire, in-cluster pod traffic in a AKS cluster.

**Docs:** https://docs.projectcalico.org/security/encrypt-cluster-pod-traffic

## Steps

1. Enable WireGuard encryption across all the nodes using the following command.

    
    ```bash
    calicoctl --allow-version-mismatch patch felixconfiguration default --type='merge' -p '{"spec":{"wireguardEnabled":true}}'
    ```
    Output will be like this:
    ```bash
    Successfully patched 1 'FelixConfiguration' resource
    ```


2. Verify that the nodes are configured for WireGuard encryption, check the node status set by Felix using calicoctl. 

    ```bash
    kubectl get nodes
    ```
    
    Output will be
    ```bash
    NAME                                STATUS   ROLES   AGE   VERSION
    aks-nodepool1-40984214-vmss000000   Ready    agent   68m   v1.22.4
    aks-nodepool1-40984214-vmss000001   Ready    agent   68m   v1.22.4
    aks-nodepool1-40984214-vmss000002   Ready    agent   67m   v1.22.4
    aksnpwin000000                      Ready    agent   23m   v1.22.4
    ```

    ```bash
    ##NODE-NAME will be aks-nodepool1-40984214-vmss0000000 for example.
    NODE_NAME=$(kubectl get nodes -o jsonpath='{.items[*].status.addresses[?(@.type=="Hostname")].address}'| awk '{print $1;}')
    sleep 10
    calicoctl --allow-version-mismatch get node $NODE_NAME -o yaml | grep wireguard

    ```

    Output will be like:
    ```bash
    wireguard:
    wireguardPublicKey: +vkMXAJ3BSbxkqqozx3ZArNcctWjOoGIpgbi2ZmsgGQ=
    ```

3. You can also verify it in one of the nodes, Calico will generate a wireguard interface as `wireguard.cali` 
   ```bash
   ##This command starts a privileged container on your node and connects to it over SSH.
   kubectl debug node/$NODE_NAME -it --image=mcr.microsoft.com/aks/fundamental/base-ubuntu:v0.0.11
   ```
   Output will be like:
   ```bash
   Creating debugging pod node-debugger-aks-nodepool1-41939440-vmss000001-c9bjq with container debugger on node aks-nodepool1-41939440-vmss000001.
   If you don't see a command prompt, try pressing enter.
   ```

   ```bash
   ifconfig | grep wireguard
   ```
   
   Output will be like:
   ```bash
   wireguard.cali: flags=209<UP,POINTOPOINT,RUNNING,NOARP>  mtu 1340
   ```



[Next -> Module 5](../calicooss/ebpf-dataplane.md)
