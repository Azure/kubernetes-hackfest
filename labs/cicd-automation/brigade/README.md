# Lab: CI/CD with Brigade and Helm

This workshop will guide you through building a Continuous Integration (CI) and Continuous Deployment (CD) pipeline using the open source platform Brigade. The pipeline will utilize Azure Container Registry to build the images and Helm for application updating.   

## Prerequisites 

* Complete previous labs:
    * [Azure Kubernetes Service](../../create-aks-cluster/README.md)
    * [Build Application Components in Azure Container Registry](../../build-application/README.md)
    * [Helm Setup and Deploy Application](../../helm-setup-deploy/README.md)

## Instructions

The general workflow/result will be as follows:

- Push code to source control (Github)
- Trigger a continuous integration (CI) build pipeline when project code is updated via Git
- Package app code into a container image (Docker Image) created and stored with Azure Container Registry
- Trigger a continuous deployment (CD) release pipeline upon a successful build
- Deploy container image to AKS upon successful a release (via Helm chart)
- Rinse and repeat upon each code update via Git

#### Setup Github Repo

In order to trigger this pipeline you will need your own Github account and forked copy of this repo. Log into Github in the browser and get started. 

1. Broswe to https://github.com/azure/kubernetes-hackfest and click "Fork" in the top right. 

    ![](github-fork.png)

2. Grab your clone URL from Github which will look something like: `https://github.com/thedude-lebowski/kubernetes-hackfest.git`

    ![](github-clone.png)

3. Clone your repo in Azure Cloud Shell.

    > Note: If you have cloned the repo in earlier labs, the directory name will conflict. You can either delete the old one or just rename it before this step. 

    ```
    git clone https://github.com/<your-github-account>/kubernetes-hackfest.git

    cd kubernetes-hackfest
    ```

#### Setup Brigade

1. Update helm repo

    ```
    helm repo add brigade https://azure.github.io/brigade
    ```

2. Install brigade chart into it's own namespace

    ```
    kubectl create ns brigade

    helm install -n brigade brigade/brigade --namespace brigade

    kubectl get pod,svc -n brigade

    NAME                                             READY     STATUS    RESTARTS   AGE
    pod/brigade-brigade-api-789bf79dbd-t2p8g         1/1       Running   0          25s
    pod/brigade-brigade-ctrl-5d85d9f5bc-9zd26        1/1       Running   0          25s
    pod/brigade-brigade-github-gw-65f45c69c7-kbvhg   1/1       Running   0          25s

    NAME                                TYPE           CLUSTER-IP     EXTERNAL-IP   PORT(S)          AGE
    service/brigade-brigade-api         ClusterIP      10.0.140.170   <none>        7745/TCP         25s
    service/brigade-brigade-github-gw   LoadBalancer   10.0.44.207    <pending>     7744:30858/TCP   25s
    ```

#### Setup Brigade Project

Brigade uses projects to define the configuration for pipelines. Brigade Projects are also installed with a Helm chart. In this section, we will create a YAML file to configure the brigade project Helm chart. 

1. Create a brigade project YAML file

    * Create a file called ```brig-proj-hackfest.yaml```
    * Add the contents below to start your file

        ```yaml
        project: "REPLACE"
        repository: "REPLACE"
        cloneURL: "REPLACE"
        sharedSecret: "create-something-super-secret"
        # MAKE SURE YOU CHANGE THIS. It's basically a password
        github:
          token: "REPLACE"
        secrets:
          acrServer: REPLACE
          acrUsername: REPLACE
          acrPassword: "REPLACE"
        vcsSidecar: "deis/git-sidecar:v0.11.0"
        ```

    * Edit the values from above to match your Github account (example below)
        * project: thedude-lebowski/blackbelt-aks-hackfest
        * repository: github.com/thedude-lebowski/blackbelt-aks-hackfest
        * cloneURL: https://github.com/thedude-lebowski/blackbelt-aks-hackfest.git

    * Create a Github token and update the ```brig-proj-heroes.yaml```
        * In your Github, click on `Settings` and `Developer settings`
        * Select `Personal sccess tokens`
        * Select `Generate new token`
            ![Github token](img/github-token.png "Github token")
        * Provide a description and give access to the `repo`
            ![Github token access](img/github-token-access.png "Github token access")

        > Note: More details on Brigade and Github integration are here: https://github.com/Azure/brigade/blob/master/docs/topics/github.md 

    * Gather your ACR credentials from the Azure portal. Edit the ```brig-proj-heroes.yaml``` for these values
        * acrServer
        * acrUsername
        * acrPassword

    * After the above steps, your file will look like the below (values are not valid for realz)

        ```yaml
        project: "thedude-lebowski/blackbelt-aks-hackfest"
        repository: "github.com/thedude-lebowski/blackbelt-aks-hackfest"
        cloneURL: "https://github.com/thedude-lebowski/blackbelt-aks-hackfest"
        sharedSecret: "create-something-super-secret"
        # MAKE SURE YOU CHANGE THIS. It's basically a password
        github:
          token: "58df6bf1c6bogus73d2e76b54531c35f45dfe66c"
        secrets:
          acrServer: youracr.azurecr.io
          acrUsername: youracr
          acrPassword: "lGsP/UA1Gnbogus9Ps5fAL6CeWsGfPCg"
        vcsSidecar: "deis/git-sidecar:v0.11.0"
        ```

2. Create your brigade project

    ```
    # from the directory where your file from step #1 was created

    helm install --name brig-proj-heroes brigade/brigade-project -f brig-proj-heroes.yaml
    ``` 

    > Note: There is a ```brig``` CLI client that allows you to view your brigade projects. More details here: <https://github.com/Azure/brigade/tree/master/brig>

#### Setup Brigade Pipeline

1. In your forked Github repo, add a file called ```brigade.js```
2. Paste the contents from the sample [brigade.js](./brigade.js) file in this file
3. Edit `brigade.js` to ensure that the image matches your ACR service name (line 63)

    ```
    function kubeJobRunner (config, k) {
        k.storage.enabled = false
        k.image = "lachlanevenson/k8s-kubectl:v1.8.2"
        k.tasks = [
            `kubectl set image deployment/heroes-web-deploy heroes-web-cntnr=<youracrhere>.azurecr.io/azureworkshop/rating-web:${config.get("imageTag")}`
        ]
    }
    ```
4. Commit the new file
5. Review the steps in the javascript that run the jobs in our pipeline

#### Configure Github Webhook

1. Get a URL for your Brigade Gateway

    ```
    kubectl get service brigade-brigade-gw

    NAME                 TYPE           CLUSTER-IP    EXTERNAL-IP     PORT(S)          AGE
    brigade-brigade-gw   LoadBalancer   10.0.45.233   13.67.129.228   7744:30176/TCP   4h
    ```

    Use the IP address above to note a URL such as: http://13.67.129.228:7744/events/github You will use this in the next step

2. In your forked Github repo, click on Settings
3. Click Webhooks
4. Click `Add webhook`
5. Set the `Payload URL` to the URL created in step 1
6. Set the `Content type` to `application/json`
7. Set the `Secret` to the value from your `brig-proj-heroes.yaml` called "sharedSecret"
8. Set the `Which events...` to `Let me select individual events` and check `Push` and `Pull request`

    ![Github webhook](img/github-webhook.png "Github webhook")

9. Click the `Add webhook` button

#### Test the CI/CD Pipeline



## Troubleshooting / Debugging

## Docs / References

