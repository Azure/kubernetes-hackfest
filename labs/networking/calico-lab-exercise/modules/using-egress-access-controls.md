# Module 4: Using egress access controls with global networkset ( Calico OSS resource)

**Goal:** Configure egress access for specific workloads.

**Docs:** https://docs.projectcalico.org/archive/v3.20/reference/resources/globalnetworkset

## Steps

1. Test connectivity within the cluster and to the external endpoint.

    a. Test connectivity between `dev/centos` pod and `default/frontend` pod.

    ```bash
    # test connectivity from dev namespace to default namespace
    kubectl -n dev exec -t centos -- sh -c 'curl -m3 -sI http://frontend.default 2>/dev/null | grep -i http'
    ```

    b. Test connectivity from `dev/centos` to the external endpoint.

    ```bash
    # test connectivity from dev namespace to the Internet
    kubectl -n dev exec -t centos -- sh -c 'curl -m3 -sI http://www.bing.com 2>/dev/null | grep -i http'
    ```
    The access should be denied as the policies configured in previous module do not allow it.
   

2. Implement egress policy to allow egress access from a workload in one namespace, e.g. `dev/centos`, to a service in another namespace, e.g. `default/frontend`. A

    a. Deploy egress policy.

    ```bash
    kubectl apply -f demo/20-egress-access-controls/default-centos-to-frontend.yaml
    ```

    b. Test connectivity between `dev/centos` pod and `default/frontend` service.

    ```bash
    kubectl -n dev exec -t centos -- sh -c 'curl -m3 -sI http://frontend.default 2>/dev/null | grep -i http'
    ```

    The access should be allowed once the egress policy is in place.

    ![default-centos-to-frontend](../img/default-centos-to-frontend.png)


3. Implement GlobalNetworkSet policy to allow the external endpoint access from a specific workload, e.g. `dev/centos`.

    a. create `external-ips` as a `GlobalNetworkSet` with whitelist two CIDR.

    b. create a `GlobalNetworkSet` to allow external access to `198.51.100.0/28 & 203.0.113.0/24` and apply it in `GlobalNetworkPolicy`.


    ```bash
    # deploy network set
    kubectl apply -f demo/20-egress-access-controls/external-ips.yaml
    # deploy DNS policy using the network set
    kubectl apply -f demo/20-egress-access-controls/allow-ip-access.yaml
    ```

4. Calico Cloud & Calico EE offer DNS policy feature, which can whitelist DNS domain, we will test it in next module.   



[Next -> Module 5](../modules/using-observability-tools.md)
