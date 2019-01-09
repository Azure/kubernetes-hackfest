# Lab: Best Practices for App Developers

This lab walks through some basic best practices for developers using AKS. In many cases, the operations and developer best practices overlap. 

## Prerequisites

* Complete previous labs:
    * [Azure Kubernetes Service](../create-aks-cluster/README.md)
    * [Build Application Components in Azure Container Registry](../build-application/README.md)
    * [Helm Setup and Deploy Application](../helm-setup-deploy/README.md)

## Instructions

### Base Container Images

* It is important to select a proper base image for containers. Images should be lean to reduce size and eliminate tools that can lead to a larger attack surface. 

* It is recommended to start with super lean images such as alpine as a base image. Note that these images often exclude troubleshooting tools such as curl and do not include a full bash shell. 

* In our containers, you will notice that we used an alpine based node image for the base: 

    ```Dockerfile
    FROM node:10.9.0-alpine

    WORKDIR /usr/src/app
    COPY package*.json ./
    RUN npm ci

    COPY . .
    ENV NODE_ENV "development"
    EXPOSE 3003

    CMD [ "npm", "run", "container" ]
    ```

* Exec into the `flights-api` pod and attempt to use some typical linux tools.

    ```bash
    kubectl get pod -n hackfest

    NAME                                  READY     STATUS    RESTARTS   AGE
    data-api-847ff65574-7jlg2             1/1       Running   0          1d
    flights-api-6b5d7fd7fb-842p5          1/1       Running   0          1d
    quakes-api-6fbcf77dd5-2fr98           1/1       Running   0          1d
    service-tracker-ui-68fb7d7b87-4sh4q   1/1       Running   0          1d
    weather-api-677bc7ffc6-5x725          1/1       Running   0          1d
    ```

    ```bash
    # this command will fail since bash is not available
    kubectl exec -it flights-api-6b5d7fd7fb-842p5 -n hackfest /bin/bash

    # try sh instead
    kubectl exec -it flights-api-6b5d7fd7fb-842p5 -n hackfest /bin/sh

    # explore various commands such as curl
    /usr/src/app $ curl www.microsoft.com
    ```

* Use the "Builder Pattern" or multi-stage builds for Dockerfiles

    * Each instruction in a Dockerfile adds a layer which can lead to enormous images. These will be slower to start and store in registries. 
    * With Docker multi-stage builds you can copy files from builder images to a final, super-slim image. 
        > Note: requiring Docker 17.05 or higher
    * Try it with this new Dockerfile

        ```Dockerfile
        # build stage (use full node image to provide tooling needed for CI)
        FROM node:10.9.0 as build-stage

        WORKDIR /usr/src/app
        COPY package*.json ./
        RUN npm ci
        COPY . /usr/src/app/

        # final stage (using slim)
        FROM node:10.9.0-slim
        WORKDIR /app
        COPY --from=build-stage /usr/src/app/ /app/
        ENV NODE_ENV "development"
        EXPOSE 3003

        CMD [ "npm", "run", "container" ]
        ```

    * Build the new image and try it out

        ```bash
        az acr build -t hackfest/flights-api:multistage -r $ACRNAME --no-logs ~/kubernetes-hackfest/labs/best-practices/appdev/flights-api
        ```

### Version Control and Image Tags

* Never use `latest` for container image tags. Just don't do it. Trust me. Stop it. Now.
* In our labs we tagged images with a version such as `hackfest/data-api:1.0`. This is a simple starting point, but in best practice the image tag should map to a commit ID in source control.
* Review the approach in the [CI/CD labs](https://github.com/Azure/kubernetes-hackfest/blob/master/labs/cicd-automation/README.md) in this Hackfest. 
* Ideally, the image could be tagged using details from the git commit. For example: 

    ```
    def  imageTag = "${env.BRANCH_NAME}.${env.GIT_SHA}"
    ```

### Handling Failures



### Readiness and Liveness Probes



### Define pod resource requests and limits



### Pod Security 



### Visual Studio Code extension for Kubernetes



### Develop and debug applications against an AKS cluster

* Draft

* Dev Spaces

### Use kube-advisor to check for issues




## Troubleshooting / Debugging


## Docs / References

* [Full AKS Best Practices Documentation](https://docs.microsoft.com/en-us/azure/aks/best-practices)
* [5 reasons you should be doing container native development](https://cloudblogs.microsoft.com/opensource/2018/04/23/5-reasons-you-should-be-doing-container-native-development) 
* https://www.weave.works/blog/kubernetes-best-practices 
* http://technosophos.com 