#!/bin/bash

# Create Resource Group.
cd ~/repos/stuff
RG="khaksmonitor-rg"
LOC="eastus"
NAME="khaksmonitor"
WORKSPACENAME="k8slogs"
az group create --name $RG --location $LOC
az aks get-versions -l $LOC -o table

# Create Log Analytics Workspace
az group deployment create -n $WORKSPACENAME -g $RG \
  --template-file azuredeploy-loganalytics.json \
  --parameters workspaceName=$WORKSPACENAME \
  --parameters location=$LOC \
  --parameters sku="Standalone"

  # Set Workspace ID
WORKSPACEIDURL=""

# Create AKS with RBAC Cluster
az aks create -g $RG -n $NAME -k 1.10.3 -l $LOC \
  --node-count 1 --ssh-key-value ~/.ssh/id_rsa.pub \
  --enable-addons monitoring \
  --workspace-resource-id $WORKSPACEIDURL \
  --no-wait
