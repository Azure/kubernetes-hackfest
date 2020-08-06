AKS_RESOURCE_GROUP=$1
AKS_CLUSTER_NAME=$2
ACR_NAME=$3


# Get the id of the service principal configured for AKS
CLIENT_ID=$(az aks show -g $AKS_RESOURCE_GROUP -n $AKS_CLUSTER_NAME -o tsv --query identity.principalId)

# Get the ACR registry resource id
ACR_ID=$(az acr show --name $ACR_NAME --resource-group $AKS_RESOURCE_GROUP --query "id" --output tsv)

# Create role assignment
az role assignment create --assignee $CLIENT_ID --role Contributor --scope $ACR_ID
