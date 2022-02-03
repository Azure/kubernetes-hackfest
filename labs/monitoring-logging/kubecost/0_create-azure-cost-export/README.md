# Module 0: Creating an Azure Cost Export

Kubecost has the ability to ingest the Azure Cost Export to ensure that the costs we use are reflective of any Reserved Instances or Enterprise Discounts you have.

Due to the delayed nature of the Cost Exports being published, they should be configured at least 24 hours ahead of the lab.

For this lab, we recommend creating a export with the scope of the subscription that will contain your AKS cluster. Additionally, make sure the storage account is in the same subscription. You may want to consider creating everything under a single resource group to allow for easier cleanup.

## Prerequisites

- You have signed into the [Azure Portal](https://portal.azure.com/)
- You have access to Azure Cost Management to create a Cost Export

## Step 1: Create Cost Export

Choose your method for creating the Cost Export:
- [Azure Portal](#via-azure-portal)
- [Azure CLI](#via-az-cli)

### Via Azure Portal:

1. Login to [Azure Portal](https://portal.azure.com).
1. Select "Cost Management" from the home page or search box.
1. Select the Scope you want to create the export for.
    1. It is recommended to choose the subscription where your test AKS cluster as the billing scope.
1. Select "Exports" from the menu.
1. Select "Add" from the resource menu
1. Provide a meaningful but simple name (Example: amortizeddailym2d).
1. For "Metric", select "Amortized cost (Usage and Purchases)".
1. For "Export Type", select "Daily export of month-to-date costs".
1. For "Start Date", select todays date.
1. Leave "File Partitioning" off.
1. For the "Storage" section, choose "Use existing" or "Create new" based on your preference and populate the remaining details.
    1. It is recommended to create a new storage account so it can be easily identified.
    1. Take note of the Storage Account and Container Name.
1. Tag the storage account with the following name and value: `kubernetes_namespace:kubecost`

### Via az cli:

The following commands assume the creation of a storage account, adjust accordingly if you wish to use an existing one.

Be sure to replace `{location}`, `{subscription id}`, and `{storage account name}` with the respective values for your environment.
Note that the `{storage account name}` needs to be globally unique across all Azure Storage Accounts. We recommend using something like `kubecost{random_number}`


```shell
# Define Runtime Variables
location={location}
subscriptionId={subscription id}
resourceGroupName=kubecost
storageAccountName={storage account name}
storageContainerName=costexport
storageDirectoryName=cur
costExportName=kubecost

# Create Resource Group
az group create \
  --location ${location} \
  --name ${resourceGroupName}

#Create Storage Account and Tag
az storage account create \
  --name ${storageAccountName} \
  --resource-group ${resourceGroupName} \
  --location ${location} \
  --sku Standard_LRS \
  --kind StorageV2 \
  --tags kubernetes_namespace=kubecost

# Create Storage Container
az storage container create \
  --name ${storageContainerName} \
  --account-name ${storageAccountName}

# Create Cost Export
export_start=$(date +"%Y-%m-%dT%H:%M:%S")
az costmanagement export create \
  --name ${costExportName} \
  --scope "subscriptions/${subscriptionId}" \
  --storage-account-id "/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Storage/storageAccounts/${storageAccountName}" \
  --storage-container ${storageContainerName} \
  --timeframe MonthToDate \
  --recurrence Daily \
  --recurrence-period from=${export_start} to=2022-03-01T00:00:00 \
  --storage-directory ${storageDirectoryName} \
  --type AmortizedCost \
  --schedule-status "Active"
```

## Step 2: Verify Cost Export

Allow 24 hours for the export to be created and validate that you see data being populated.
Within the Storage Account, there should be files in a similar path to: `costexport / cur / kubecost / 20220201-20220228`

We will also need an access key during the lab to connect to the storage account.
You can grab it now and save it in a safe place or during the lab exercise.

## Kubecost Documentation

For additional details, reference the Kubecost Documentation [here](https://guide.kubecost.com/hc/en-us/articles/4407595936023-Adding-Azure-Out-of-Cluster-Cluster-Costs-into-Kubecost).
