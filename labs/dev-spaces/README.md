# Lab: Working with Azure Dev Spaces

This lab walks you through working with Azure Dev Spaces for that inner dev loop before checking code into Source Control. It focuses on Developer Productivity and shows you how to do breakpoint debugging to code running in a Pod on the AKS Cluster.

## Prerequisites

* Complete previous labs:
    * [Azure Kubernetes Service](../../create-aks-cluster/README.md)
    * [Build Application Components in Azure Container Registry](../../build-application/README.md)
    * [Helm Setup and Deploy Application](../../helm-setup-deploy/README.md)

* Visual Studio Code (NOT IN AZURE CLOUD SHELL). 

    * This lab is not intended for Azure Cloud Shell. You may need to configure your local machine to match the cloud shell environment. 

## Instructions

1. Setup DevSpaces in AKS Cluster

    * Make sure that http_application_routing is setup in the AKS Cluster.

        ```bash
        # Add HTTP Application Routing add-on to AKS Cluster
        az aks enable-addons -a http_application_routing -g $RGNAME -n $CLUSTERNAME
        ```

    * Add DevSpaces to AKS Cluster

        ```bash
        # Add DevSpaces to Cluster
        az aks use-dev-spaces -g $RGNAME -n $CLUSTERNAME

        # When prompted for a dev space, enter devspaces and hit Enter.
        # When prompted for parent dev space, pick [0] <none>.
        # This command can be used to check DevSpaces version
        azds --version
        ```

    * Download the [Azure Dev Spaces extension](https://marketplace.visualstudio.com/items?itemName=azuredevspaces.azds) for VS Code. Click Install once on the extension's Marketplace page, and again in VS Code.

2. Setup Sample Application

    * Clone the Azure DevSpaces Repo
    * Go to the NodeJS Web Front-end and Prep it for Public Exposure

        ```bash
        # Setup WebFront End for Debugging
        git clone https://github.com/Azure/dev-spaces
        cd dev-spaces
        cd samples/nodejs/getting-started/webfrontend

        # Before view of Directory
        ls -al

        # Prep this service for Public Exposure via Azure DevSpaces
        azds prep --public

        # After view of Directory & Files Added
        ls -al

        # Start the Service and Deploy to AKS via Azure DevSpaces
        # Note: This will take a while the first time through.
        azds up
        
        # Test webapp via http app routing url outputted
        # Press Ctrl+C to detach once testing is completed.
        ```

3. Initialize Debug Assets with VS Code (Breakpoint Debugging)

    * Initialize debug assets with the VS Code extension.

        ```bash
        code dev-spaces/samples/nodejs/getting-started/webfrontend
        ```

    * Go to VS Code Command Palette
        * Run Azure Dev Spaces: Prepare configuration files for Azure Dev Spaces
        * You should now see a .vscode folder added to the folder structure
    * Go to Debug View in VS Code
        * Go to server.js file and set a Breakpoint on Line 10 (res.send('Hello from webfrontend');)
        * Select **Launch Program (AZDS)**
        * Press Green Arrow to Start Debugging
        * It will take a few moments to sync up the two environments so be patient
        * Once the new Container is up and running, navigate to App and watch Breakpoint get hit

## Troubleshooting / Debugging

* If the **Launch Program (AZDS)** does not show up properly in VS Code, restart VS Code and repeat the steps.

## Docs / References

* [Azure DevSpaces](https://docs.microsoft.com/en-us/azure/dev-spaces/azure-dev-spaces)