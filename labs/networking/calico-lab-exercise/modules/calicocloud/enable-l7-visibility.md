# Module 9: Enabling L7 visibility 

**Goal:** Enable L7/HTTP flow logs in hipstershop with Calico cloud. Calico cloud not only can provide L3 flow logs, but also can provide L7 visibility without service mesh headache. 

**Docs:** https://docs.tigera.io/v3.9/visibility/elastic/l7/configure)

## Steps


1. Patch your AKS 
   > The current installation script doesn't adapt k8s provider to aks and will provide a fix in later version

   ```bash
   kubectl patch installation default --type=merge -p '{"spec": {"kubernetesProvider": "AKS"}}'

   kubectl patch installation default --type=merge -p '{"spec": {"flexVolumePath": "/etc/kubernetes/volumeplugins/"}}'
   ```

2. Create the Envoy configmap with `envoy-config.yaml` in l7-visibility folder

    ```bash
    
    #Create the Envoy config in calico-system namespace.
    kubectl create configmap envoy-config -n calico-system --from-file=demo/70-l7-visibility/envoy-config.yaml

    ```
    
3. Configure Felix for log data collection.
    
    ```bash
    
    kubectl patch felixconfiguration default --type='merge' -p '{"spec":{"policySyncPathPrefix":"/var/run/nodeagent"}}'
    ```


4. Apply l7-collector-daemonset.yaml and ensure that l7-collector and envoy-proxy containers are in `Running` state. 
   >You can also edit the `LOG_LEVEL` with different options: Trace, Debug, Info, Warning, Error, Fatal and Panic. Enable L7 log collection daemonset mode in Felix by setting Felix configuration variable tproxyMode to Enabled or by setting felix environment variable FELIX_TPROXYMODE to Enabled.

   ```bash

   kubectl patch felixconfiguration default --type='merge' -p '{"spec":{"tproxyMode":"Enabled"}}'

   kubectl apply -f demo/70-l7-visibility/l7-collector-daemonset.yaml

   ```

5. Select traffic for L7 log collection

   ```bash
   #Annotate the services you wish to collect L7 logs as shown. Use hipstershop service as example
   kubectl annotate svc adservice projectcalico.org/l7-logging=true
   kubectl annotate svc cartservice projectcalico.org/l7-logging=true
   kubectl annotate svc checkoutservice projectcalico.org/l7-logging=true
   kubectl annotate svc currencyservice projectcalico.org/l7-logging=true
   kubectl annotate svc emailservice projectcalico.org/l7-logging=true
   kubectl annotate svc frontend projectcalico.org/l7-logging=true
   kubectl annotate svc frontend-external projectcalico.org/l7-logging=true
   kubectl annotate svc paymentservice projectcalico.org/l7-logging=true
   kubectl annotate svc productcatalogservice projectcalico.org/l7-logging=true
   kubectl annotate svc recommendationservice projectcalico.org/l7-logging=true
   kubectl annotate svc redis-cart projectcalico.org/l7-logging=true
   kubectl annotate svc shippingservice projectcalico.org/l7-logging=true
   ```
   
5. *[Optional]* restart the pods of `hipstershop` if you want to see l7 logs right away.    

    ```bash
    kubectl delete pods --all 
    ``` 

  Now view the L7 logs in Kibana by selecting the tigera_secure_ee_l7 index pattern. You should also see the relevant HTTP log from service graph.    

   ![service graph HTTP log](../img/service-graph-l7.png)
   

[Next -> Module 10](../calicocloud/host-end-point.md)

[Menu](../README.md)

