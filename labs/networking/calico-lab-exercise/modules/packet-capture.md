# Module 7: Packet Capture

**Goal:** Configure packet capture for specific pods and review captured payload.

## Steps

1. Confirm `calicoctl` binary is installed. Follow instructions in [Module 0 Step 7](./creating-aks-cluster.md) if installation is required

    The easiest way to retrieve captured `*.pcap` files is to use [calicoctl](https://docs.tigera.io/maintenance/clis/calicoctl/) CLI.

    ```bash
    # confirm calicoctl is executable
    calicoctl version
    ```
    
    ```bash
    # confirm calicoctl is executable from CloudShell
    ./calicoctl version
    ```


2. Configure packet capture.

    Navigate to `demo/80-packet-capture` and review YAML manifests that represent packet capture definition. Each packet capture is configured by deploying a `PacketCapture` resource that targets endpoints using `selector` and `labels`.

    Deploy packet capture definition to capture packets for `default/frontend` pods.

    ```bash
    kubectl apply -f demo/80-packet-capture/packet-capture.yaml
    ```

    >Once the `PacketCapture` resource is deployed, Calico starts capturing packets for all endpoints configured in the `selector` field.


3. Fetch and review captured payload.

    >The captured `*.pcap` files are stored on the hosts where pods are running at the time the `PacketCapture` resource is active.

    Retrieve captured `*.pcap` files and review the content.

    ```bash
    # get pcap files
    calicoctl captured-packets copy packet-capture-frontend --namespace default

    ls frontend-*
    # view *.pcap content
    tcpdump -Xr frontend-XXXXXX.pcap
    ```

4. Stop packet capture

    Stop packet capture by removing the `PacketCapture` resource.

    ```bash
    kubectl delete -f demo/80-packet-capture/packet-capture.yaml
    ```

[Next -> Module 8](../modules/anomaly-detection.md)
