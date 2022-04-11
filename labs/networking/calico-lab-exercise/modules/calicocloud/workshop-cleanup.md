# Calico cloud workshop on AKS

<img src="../img/calico-on-aks.png" alt="Calicocloud on AKS" width="30%"/>



## Workshop cleanup

1. Delete application stack to clean up any `loadbalancer` services.

    ```bash
    kubectl delete -f demo/dev/app.manifests.yaml
    kubectl delete -f demo/boutiqueshop/boutique-app.manifests.yaml
    kubectl delete svc yaobank-customer -n yaobank
    ```

2. Uninstall Calico Cloud from AKS cluster.
   a. Download the script.
   ```bash
   curl -O https://installer.calicocloud.io/manifests/v3.11.1-1/downgrade.sh
   ``` 
   
   b. Make the script executable.
   ```bash
   chmod +x downgrade.sh
   ```

   c. Run the script and read the help to determine if you need to specify any flags.
   ```bash
   ./downgrade.sh --help
   ```

   d. Run the script with any needed flags, for example: 
   ```bash
   ./downgrade.sh --remove-prometheus --remove-all-calico-policy
   ```

3. Delete AKS cluster.

    ```bash
    az aks delete --name $CLUSTERNAME --resource-group $RGNAME
    az aks delete --name $OSSCLUSTERNAME --resource-group $RGNAME
    ```

4. Delete the azure resource group. 

    ```bash
    az group delete --resource-group $RGNAME
    ```
