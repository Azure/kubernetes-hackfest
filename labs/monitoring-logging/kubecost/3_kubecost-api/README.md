# Module 3 (Extra Credit): Using the Kubecost API

Kubecost offers a number of API endpoints to query cost metrics data. The Kubecost API is especially useful in cases where you want to integrate Kubecost data with your existing services, trigger alerts, or set up automation pipelines.

## Prerequisites

- You have completed Sections 1 & 2 of this lab
- You have an API client installed, such as [Insomnia](https://insomnia.rest/), [Postman](https://www.postman.com/), or a CLI utility such as [HTTPie](https://httpie.io/cli) or [cURL](https://curl.se/).

## Step 1: Enable access to the Kubecost API

The Kubecost API can be queried using the `<KUBECOST_IP>:9090/model/` prefix. In order to do this, you'll either need to expose Kubecost locally, or via a Load Balancer Controller. Full steps for both are described in Section 2 of this lab.

For the sake of simplicity, we'll access the API from the locally exposed Kubecost:

```
$ kubectl port-forward --namespace kubecost deployment/kubecost-cost-analyzer 9090
```

## Step 2: Explore the data

Here are some examples of data available in the Free Tier of the API:

### [`/allocation`](https://github.com/kubecost/docs/blob/main/allocation.md)

The Kubecost Allocation API is used by the Kubecost Allocation frontend and retrieves cost allocation information for any Kubernetes concept, e.g. cost by namespace, label, deployment, service, and more. This API is directly integrated with the Kubecost ETL caching layer and CSV pipeline so it can scale to large clusters.

E.g. Request allocation data for each 24-hour period in the last three days, aggregated by namespace:

```
$ curl http://localhost:9090/model/allocation \
  -d window=3d \
  -d aggregate=namespace \
  -d accumulate=false \
  -d shareIdle=false \
  -G
```

Note: querying for "3d" will likely return a range of four sets because the queried range will overlap with four precomputed 24-hour sets, each aligned to the configured timezone.

### [`/assets`](https://github.com/kubecost/docs/blob/main/assets.md)

Assets API retrieves the backing cost data broken down by individual assets, e.g. node, disk, etc, and provides various aggregations of this data. Optionally provides the ability to integrate with external cloud assets.

API parameters include the following:

* `window` dictates the applicable window for measuring historical asset cost. Currently, supported options are as follows:
    - "15m", "24h", "7d", "48h", etc. 
    - "today", "yesterday", "week", "month", "lastweek", "lastmonth"
    - "1586822400,1586908800", etc. (start and end unix timestamps)
    - "2020-04-01T00:00:00Z,2020-04-03T00:00:00Z", etc. (start and end UTC RFC3339 pairs)
* `aggregate` is used to consolidate cost model data. Supported aggregation types are cluster and type. Passing an empty value for this parameter, or not passing one at all, returns data by an individual asset.
* `accumulate` when set to false this endpoint returns daily time series data vs cumulative data. Default value is false.
* `disableAdjustments` when set to true, zeros out all adjustments from cloud provider reconciliation, which would otherwise change the totalCost.
* `format` when set to `csv`, will download an accumulated version of the asset results in CSV format. By default, results will be in JSON format.

This API returns a set of JSON objects in this format:

```
  {
    cluster: "cluster-one"  // parent cluster for asset
    cpuCores: 2  // number of CPUs, given this is a node asset type
    cpuCost: 0.047416 // cumulative cost of CPU measured over time window
    discount: 0.3 // discount applied to asset cost
    end: "2020-08-21T00:00:00+0000" // end of measured time window
    gpuCost: 0
    key: "cluster-one/node/gke-niko-n1-standard-2-wljla-8df8e58a-hfy7"
    name: "gke-niko-n1-standard-2-wljla-8df8e58a-hfy7"
    nodeType: "n1-standard-2"
    preemptible: 0
    providerID: "gke-niko-n1-standard-2-wljla-8df8e58a-hfy7"
    ramBytes: 7840256000
    ramCost: 0.023203
    start: "2020-08-20T00:00:00+0000"
    adjustment: 0.0023 // amount added to totalCost during reconciliation with cloud provider data
    totalCost: 0.049434 // total asset cost after applied discount
    type: "node" // e.g. node, disk, cluster management fee, etc
}
```

### [`/savings`](https://docs.kubecost.com/apis)

Savings endpoints provide cost optimization insights, such as cluster sizing, request sizing, abandoned workloads and more.

---

📖 Full documentation on the `/savings` endpoint and others can be found in [Kubecost docs](https://docs.kubecost.com/apis).
