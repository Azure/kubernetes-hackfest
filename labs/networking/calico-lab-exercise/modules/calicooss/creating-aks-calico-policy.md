# Module 0: Create an AKS cluster with Calico network policy

---

**Goal:** Create AKS cluster.

> This cluster deployment utilizes Azure CLI v2.x from your local terminal or via Azure Cloud Shell. Instructions for installing Azure CLI can be found [here](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli).

## Prerequisite

- Azure Account

## Instructions

1. Login to Azure Portal at <https://portal.azure.com/>

2. Open the Azure Cloud Shell and choose Bash Shell (do not choose Powershell)

   ![img-cloud-shell](https://user-images.githubusercontent.com/104035488/199605731-86d9f1c5-d3a6-40fb-8e95-3a9bf837c84b.png)

3. The first time Cloud Shell is started will require you to create a storage account.

4. Once your cloud shell is started, clone the workshop repo into the cloud shell environment

   ```bash
   git clone https://github.com/Azure/kubernetes-hackfest
   ```

   > Note: In the cloud shell, you are automatically logged into your Azure subscription.

5. Ensure you are using the correct Azure subscription you want to deploy AKS to.

    ```bash
    # View subscriptions
    az account list --out table
 
    # Verify selected subscription
    az account show --out table
    ```

    ```bash
    # Set correct subscription (if needed)
    az account set --subscription <subscription_id>
  
    # Verify correct subscription is now set
    az account show --out table
    ```

6. Create a unique identifier suffix for resources to be created in this lab.

    > *NOTE:* In the following sections we'll be generating and setting some environment variables. If you're terminal session restarts you may need to reset these variables. You can use that via the following command:
    ```source ~/workshopvars-calioss.env```

    ```bash
    echo "# Start AKS Hackfest Calico OSS Lab Params" >> ~/workshopvars-calioss.env
    UNIQUE_SUFFIX=$USER$RANDOM
    # Remove Underscores and Dashes (Not Allowed in AKS and ACR Names)
    UNIQUE_SUFFIX="${UNIQUE_SUFFIX//_}"
    UNIQUE_SUFFIX="${UNIQUE_SUFFIX//-}"
    # Check Unique Suffix Value (Should be No Underscores or Dashes)
    echo $UNIQUE_SUFFIX
    # Persist for Later Sessions in Case of Timeout
    echo export UNIQUE_SUFFIX=$UNIQUE_SUFFIX >> ~/workshopvars-calioss.env
    ```

7. Create an Azure Resource Group in your chosen region. We will use East US in this example.

   ```bash
   # Set Resource Group Name using the unique suffix
   RGNAME=aks-rg-$UNIQUE_SUFFIX
   # Persist for Later Sessions in Case of Timeout
   echo export RGNAME=$RGNAME >> ~/workshopvars-calioss.env
   # Set Region (Location)
   LOCATION=eastus
   # Persist for Later Sessions in Case of Timeout
   echo export LOCATION=eastus >> ~/workshopvars-calioss.env
   # Create Resource Group
   az group create -n $RGNAME -l $LOCATION
   ```

8. Create your AKS cluster in the resource group created in step 2 with 3 nodes. We will check for a recent version of kubnernetes before proceeding. You will use the Service Principal information from the prerequisite tasks.

    Use Unique CLUSTERNAME

    ```bash
    # Set AKS Cluster Name
    OSSCLUSTERNAME=aks-oss-${UNIQUE_SUFFIX}
    # Look at AKS Cluster Name for Future Reference
    echo $OSSCLUSTERNAME
    # Persist for Later Sessions in Case of Timeout
    echo export OSSCLUSTERNAME=aks-oss-${UNIQUE_SUFFIX} >> ~/workshopvars-calioss.env
    ```

    Get available kubernetes versions for the region. You will likely see more recent versions in your lab.

    ```bash
    az aks get-versions -l $LOCATION --output table
    ```

    Output is:

    ```bash
    KubernetesVersion    Upgrades
    -------------------  ------------------------
    1.25.2(preview)      None available
    1.24.6               1.25.2(preview)
    1.24.3               1.24.6, 1.25.2(preview)
    1.23.12              1.24.3, 1.24.6
    1.23.8               1.23.12, 1.24.3, 1.24.6
    1.22.15              1.23.8, 1.23.12
    1.22.11              1.22.15, 1.23.8, 1.23.12
    ```

    For this lab we'll use 1.24.6

    ```bash
    K8SVERSION=1.24.6
    echo export K8SVERSION=1.24.6 >> ~/.bashrc
    ```

    > The below command can take 10-20 minutes to run as it is creating the AKS cluster. Please be PATIENT and grab a coffee/tea/kombucha...

    > If using Azure CLI on a local terminal to provision the cluster, either add the "--generate-ssh-keys" to let the CLI generate a new RSA public/private keypair for you or specify an already existing keypair with "--ssh-key-values mypubkey.pub". Please note that at this time that only RSA keys are supported ([no support for ECDSA keys for cluster creation](https://github.com/Azure/AKS/issues/2850))

    ```bash
    # Create AKS Cluster - it is important to set the network-plugin as azure and network-policy as calico
    az aks create -n $OSSCLUSTERNAME -g $RGNAME \
    --kubernetes-version $K8SVERSION \
    --enable-managed-identity \
    --node-count 3 \
    --network-plugin azure \
    --network-policy calico \
    --no-wait
    ```

9. Verify your cluster status. The `ProvisioningState` should be `Succeeded`

    ```bash
    az aks list -o table -g $RGNAME
    ```

    Output is:

    ```bash
    Name                  Location    ResourceGroup        KubernetesVersion    CurrentKubernetesVersion    ProvisioningState    Fqdn
    --------------------  ----------  -------------------  -------------------  --------------------------  -------------------  ----------------------------------------------------------------
    aks-oss-kbharath2690  eastus      aks-rg-kbharath2690  1.24.6               1.24.6                      Succeeded            aks-oss-kb-aks-rg-kbharath2-03cfb8-16989d9f.hcp.eastus.azmk8s.io
    ```

10. Get the Kubernetes config files for your new AKS cluster

    ```bash
    az aks get-credentials -n $OSSCLUSTERNAME -g $RGNAME
    ```

11. Verify you have API access to your new AKS cluster

    > Note: It can take 5 minutes for your nodes to appear and be in READY state. You can run `watch kubectl get nodes` to monitor status. Otherwise, the cluster is ready when the output is similar to the following:

    ```bash
    kubectl get nodes
    ```

    Output is:

    ```bash
    NAME                                STATUS   ROLES   AGE     VERSION
    aks-nodepool1-42466211-vmss000000   Ready    agent   3d19h   v1.24.6
    aks-nodepool1-42466211-vmss000001   Ready    agent   3d19h   v1.24.6
    aks-nodepool1-42466211-vmss000002   Ready    agent   3d19h   v1.24.6
    ```

    To see more details about your cluster:

    ```bash
    kubectl cluster-info
    ```

12. Install `calicoctl` CLI for use in later labs. The following guide is based upon the doc from [Install Calicoctl](https://projectcalico.docs.tigera.io/maintenance/clis/calicoctl/install)

    a) Cloud shell(Linux amd64)

    ```bash
    # Download and configure calicoctl
    curl -L https://github.com/projectcalico/calico/releases/download/v3.24.5/calicoctl-linux-amd64 -o calicoctl
    chmod +x ./calicoctl
    
    # Verify that calicoctl is running 
    ./calicoctl version
    ```

    Output is:

    ```bash
    Client Version:    v3.24.5
    Git commit:        f1a1611ac
    Cluster Version:   v3.21.6
    Cluster Type:      typha,kdd,k8s,operator,aks
    ```

    ```bash
    # Save and alias calicoctl for future usage.
    alias calicoctl=$(pwd)/calicoctl
    ```

    b) Linux arm64

    >Tip: Consider navigating to a location that’s in your PATH. For example, /usr/local/bin/

    ```bash
    # Download and configure calicoctl
    curl -L https://github.com/projectcalico/calico/releases/download/v3.24.5/calicoctl-linux-arm64 -o calicoctl


    chmod +x calicoctl
    
    # Verify calicoctl is running 
    calicoctl version
    ```

    c) MacOS

    >Tip: Consider navigating to a location that’s in your PATH. For example, /usr/local/bin/

    ```bash
    # Download and configure calicoctl
    curl -L https://github.com/projectcalico/calico/releases/download/v3.24.5/calicoctl-darwin-amd64 -o calicoctl

    chmod +x calicoctl
    
    # Verify calicoctl is running 
    calicoctl version
    ```

    Note: If you are faced with `cannot be opened because the developer cannot be verified` error when using `calicoctl` for the first time. go to `Applications` \> `System Preferences` \> `Security & Privacy` in the `General` tab at the bottom of the window click `Allow anyway`.  

    d) Windows - using powershell command to download the calicoctl binary  
    >Tip: Consider running Powershell as administraor and navigating to a location that’s in your PATH. For example, C:\Windows.

    ```pwsh
    Invoke-WebRequest -Uri "https://github.com/projectcalico/calico/releases/download/v3.24.5/calicoctl-windows-amd64.exe -OutFile "calicoctl.exe" 
    ```

---

## Next steps

You should now have a Kubernetes cluster running with 3 nodes. You do not see the master servers for the cluster because these are managed by Microsoft. The Control Plane services which manage the Kubernetes cluster such as scheduling, API access, configuration data store and object controllers are all provided as services to the nodes.

[Next -> Module 1](../calicooss/configuring-demo-apps.md)

[https://portal.azure.com/#home]: ttps://portal.azure.co
