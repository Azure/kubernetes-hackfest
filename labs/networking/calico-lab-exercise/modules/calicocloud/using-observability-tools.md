# Module 3: Using observability tools

**Goal:** Explore Calico observability tools.

## Calico observability tools

1. Choose your cluster
   To access resources in a managed cluster from the Calico cloud Manager UI, you can select via the drop down in the top right corner of the portal.
   All your connected clusters are displayed in the cluster selection drop-down menu with the fixed name.
   

   ![drop-down menu](../img/drop-down-menu.png)

2. Dashboard

    The `Dashboard` view in the Calicocloud Manager UI presents high level overview of what's going on in your cluster. The view shows the following information:

    - Connections, Allowed Bytes and Packets
    - Denied Bytes and Packets
    - Total number of Policies, Endpoints and Nodes
    - Summary of CIS benchmarks
    - Count of triggered alerts
    - Packets by Policy histogram that shows allowed and denied traffic as it is being evaluated by network policies

    ![dashboard overall view](../img/dashboard-overall-view.png)

3. Policies Board

    The `Policies Board` shows all policies deployed in the cluster and organized into `policy tiers`. You can control what a user can see and do by configuring Kubernetes RBAC roles which determine what the user can see in this view. You can also use controls to hide away tiers you're not interested in at any given time.

    a. Deploy the centos-to-frontend policy to platform tier.

    ```bash
    kubectl create -f demo/20-egress-access-controls/centos-to-frontend.yaml
    ```

    This will add `centos-to-frontend` policy to your `platform` tier. 

    ![policies board stats](../img/policies-board-stats.png) 


4. Audit timeline

    The `Timeline` view shows audit trail of created, deleted, or modified resources.

    <img src="../img/timeline-view.png" alt="timeline view" width="50%"/>


5. Endpoints

    The `Endpoints` view lists all endpoints known to Calico. It includes all Kubernetes endpoints, such as Pods, as well as Host endpoints that can represent a Kubernetes host or an external VM or bare metal machine.

    ![endpoints view](../img/endpoints-view.png)


6. Network Sets 

    a. Calico Cloud & Calico EE offers `GlobalThreatfeed` resource to prevent known bad actors from accessing Kubernetes pods. We will configure a `Network Set` resource to reference an external threatfeed which will dynamically update the IP addresses or FQDNs/domains. Then we configure a network policy to deny traffic to these blacklisted destinations.
    
    

    ```bash
    # deploy feodo tracker threatfeed
    kubectl apply -f demo/10-security-controls/feodotracker.threatfeed.yaml
    # deploy network policy that uses the threadfeed
    kubectl apply -f demo/10-security-controls/feodo-block-policy.yaml
    ```
    <br>
    
    You should be able to view the `threatfeed.feodo-tracker` details in `Network Sets` view and the `block-feodo` policy in `Policies Board` view in your calicocloud manager UI.
    
    ![network-set-grid](../img/network-set-grid.png)
    
    ```bash
    # try to ping any of the IPs in from the feodo tracker list, and the packet will be denied with "exit code 1". 
    IP=$(kubectl get globalnetworkset threatfeed.feodo-tracker -ojson | jq '.spec.nets[0]' | sed -e 's/^"//' -e 's/"$//' -e 's/\/32//')
    kubectl -n dev exec -t centos -- sh -c "ping -c1 $IP"
    ```
   
7. Service Graph

    The dynamic `Service Graph` presents network flows from service level perspective. Top level view shows how traffic flows between namespaces as well as external and internal endpoints.

    ![service graph node view](../img/service-graph-node.png)

    - When you select any node representing a namespace, you will get additional details about the namespace, such as incoming and outgoing traffic, policies evaluating each flow, and DNS metrics.
    - When you select any edge, you will get details about the flows representing that edge.
    - If you expand a namespace by double-clicking on it, you will get the view of all components of the namespace.


8. Flow Visualizations

    The `Flow Visualizations` view shows all point-to-point flows in the cluster. It allows you to see the cluster traffic from the network point of view.

    ![flow viz view](../img/flow-viz.png)


9. Kibana dashboards

    The `Kibana` components comes with Calico cloud offerings and provides you access to raw flow, audit, and dns logs, as well as ability to visualize the collected data in various dashboards.

    When you login Kibana, you can choose a predefined dashboard or create your own, below is "Tigera Flow Logs" dashboard.

    ![kibana flows](../img/kibana-flow-logs.png)

    Some of the default dashboards you get access to are DNS Logs, Flow Logs, Audit Logs, Kuernetes API calls, L7 HTTP metrics, and others.

    ![kibana dashboard](../img/kibana-dashboard.png)

[Next -> Module 4](../calicocloud/using-dns-controls.md)
