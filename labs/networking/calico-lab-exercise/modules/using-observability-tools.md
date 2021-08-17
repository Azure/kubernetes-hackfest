# Module 5: Using observability tools

**Goal:** Explore Calico observability tools.

## Calico observability tools

>If you are interested in enabling collection of application layer metrics for your workloads, refer to [Configure L7 logs](https://docs.tigera.io/visibility/elastic/l7/configure) documentation to enable application layer metrics collection.

1. Dashboard

    The `Dashboard` view in the Calicocloud Manager UI presents high level overview of what's going on in your cluster. The view shows the following information:

    - Connections, Allowed Bytes and Packets
    - Denied Bytes and Packets
    - Total number of Policies, Endpoints and Nodes
    - Summary of CIS benchmarks
    - Count of triggered alerts
    - Packets by Policy histogram that shows allowed and denied traffic as it is being evaluated by network policies

    ![dashboard overall view](../img/dashboard-overall-view.png)

2. Policies Board

    The `Policies Board` shows all policies deployed in the cluster and organized into `policy tiers`. You can control what a user can see and do by configuring Kubernetes RBAC roles which determine what the user can see in this view. You can also use controls to hide away tiers you're not interested in at any given time.

    a. Move the centos-to-frontend policy to platform tier as well.

    ```bash
    kubectl apply -f demo/20-egress-access-controls/centos-to-frontend.yaml

    kubectl delete -f demo/20-egress-access-controls/default-centos-to-frontend.yaml
    ```

    This will add `centos-to-frontend` policy to your `platform` tier and remove `centos-to-frontend` policy in your `default` tier. 


    b. Add the `allow-azure-access` DNS policy to security tier.

    ```bash
    kubectl apply -f demo/20-egress-access-controls/netset.external-apis.yaml

    kubectl apply -f demo/20-egress-access-controls/dns-policy.netset.yaml
    ```

    This will add `allow-azure-access` policy to your `security` tier. 
    
    ![create dns policy](../img/create-dns-policy.png)

    ![policies board](../img/policies-board.png)

    By leveraging stats controls you can toggle additional metrics to be listed for each shown policy.

    ![policies board stats](../img/policies-board-stats.png) 


3. Audit timeline

    The `Timeline` view shows audit trail of created, deleted, or modified resources.

    <img src="../img/timeline-view.png" alt="timeline view" width="50%"/>

4. Endpoints

    The `Endpoints` view lists all endpoints known to Calico. It includes all Kubernetes endpoints, such as Pods, as well as Host endpoints that can represent a Kubernetes host or an external VM or bare metal machine.

    ![endpoints view](../img/endpoints-view.png)

5. Network Sets 

    a. Calico Cloud & Calico EE offers `GlobalThreatfeed` resource to prevent known bad actors from accessing Kubernetes pods. We will configure a `Network Set` resource to reference an external threatfeed which will dynamically update the IP addresses or FQDNs/domains. Then we configure a network policy to deny traffic to these blacklisted destinations.
    
    

    ```bash
    # deploy feodo tracker threatfeed
    kubectl apply -f demo/10-security-controls/feodotracker.threatfeed.yaml
    # deploy network policy that uses the threadfeed
    kubectl apply -f demo/10-security-controls/feodo-block-policy.yaml
    ```
    <br>
    
    You should be able to view the `threatfeed.feodo-tracker` details in `Network Sets` view and the `block-feodo`policy in `Policies Board` view in your calicocloud manager UI.
    
    ![network-set-grid](../img/network-set-grid.png)
    
    ```bash
    # try to ping any of the IPs in from the feodo tracker list, and the packet will be deny.
    IP=$(kubectl get globalnetworkset threatfeed.feodo-tracker -ojson | jq '.spec.nets[0]' | sed -e 's/^"//' -e 's/"$//' -e 's/\/32//')
    kubectl -n dev exec -t centos -- sh -c "ping -c1 $IP"
    ```
    
    b. Calico Cloud & Calico EE offer DNS policy which leveage `Network Sets` to whitelist the external access. You should be able to view the `external-apis` details in `Network Sets` view and you can add or delete Domain name with your calicocloud manager UI.


    ```bash
    # test egress access to www.azure.com
    kubectl -n dev exec -t centos -- sh -c 'curl -m3 -skI https://www.azure.com 2>/dev/null | grep -i http'
    # test egress access to www.bing.com
    kubectl -n dev exec -t centos -- sh -c 'curl -m3 -skI https://www.bing.com 2>/dev/null | grep -i http'
    ```
    As access to `*.azure.com` is permitted and access to `*.bing.com` is denied we are able to whitelist domains as described next, you can also try to add `*.bing.com` in `external-apis` and test the connectivity again.

    ![dns network set](../img/dns-network-set.png)

6. Service Graph

    The dynamic `Service Graph` presents network flows from service level perspective. Top level view shows how traffic flows between namespaces as well as external and internal endpoints.

    ![service graph node view](../img/service-graph-node.png)

    - When you select any node representing a namespace, you will get additional details about the namespace, such as incoming and outgoing traffic, policies evaluating each flow, and DNS metrics.
    - When you select any edge, you will get details about the flows representing that edge.
    - If you expand a namespace by double-clicking on it, you will get the view of all components of the namespace.


7. Flow Visualizations

    The `Flow Visualizations` view shows all point-to-point flows in the cluster. It allows you to see the cluster traffic from the network point of view.

    ![flow viz view](../img/flow-viz.png)

8. Kibana dashboards

    The `Kibana` components comes with Calico cloud offerings and provides you access to raw flow, audit, and dns logs, as well as ability to visualize the collected data in various dashboards.

    When you login Kibana, you can choose a predefined dashboard or create your own, below is "Tigera Flow Logs" dashboard.

    ![kibana flows](../img/kibana-flow-logs.png)

    Some of the default dashboards you get access to are DNS Logs, Flow Logs, Audit Logs, Kuernetes API calls, L7 HTTP metrics, and others.

[Next -> Module 6](../modules/using-alerts.md)
