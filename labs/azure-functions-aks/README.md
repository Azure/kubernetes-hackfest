# Lab: FaaS using Azure Functions and AKS
With serverless technology and microservice architecture on the rise more and more people are looking at Function as a Service (FaaS) platforms as a great way to focus on delivering business requirements with a focus on code rather than hosting infrastructure. The downside of most FaaS platforms is that they, by nature, tend to be a bit prescriptive about the code framework, which leads to vendor/platform stickiness. 

Many dont realize that the Azure Functions platform and tools are open source, fully allowing you to use the framework defined by Azure Functions and run anywhere. This reduces some of the stickiness, but increases the need to manage the hosting infrasture. Azure Functions Core Tools step in to help address this by providing the tools needed to containerize your function and even deploy to your Kubernetes cluster.

In this lab we'll run through the creation of an Azure function. We'll then deploy that locally as a container and then push that container to our AKS cluster.

## Prerequisites 
1. You should have completed the [Create AKS Cluster](labs/create-aks-cluster/README.md) lab
2. You should have completed the [Build Application Components in Azure Container Registry](labs/build-application/README.md) lab or you should have access to another container registery 
3. The following tools should be installed and operational on a machine you can access:
 - Docker
 - kubectl
 - [Azure Functions Core Tools](https://github.com/Azure/azure-functions-core-tools/blob/master/README.md)
 - [.Net Core SDK](https://www.microsoft.com/net/download)


## Instructions

1. From the command line create a new directory called 'functions' and navigate into that directory.
    ```bash
    mkdir functions
    cd functions
    ```
2. Run ```func init myhelper --docker``` and choose option 1 to begin creating a new dotnet core function project.
    ```bash
    user@labvm:~/functions$ func init myhelper --docker
    Select a worker runtime:
    1. dotnet
    2. node
    3. java
    Choose option: 1
    dotnet

    Writing /home/user/functions/myhelper/.vscode/extensions.json
    Writing Dockerfile
    ```
3. Run change directories into the 'myhelper' directory and examine the files generated. Note the Dockerfile. Also note we only have the project for the function, not the function itself.
4. Run ```func new``` to start creation of a new function. Choose option 2 for ```HttpTrigger``` and name your function ```myhelperfunc```.

    ```bash
    user@labvm:~/functions/myhelper$ func new
    Select a template:
    1. QueueTrigger
    2. HttpTrigger
    3. BlobTrigger
    4. TimerTrigger
    5. DurableFunctionsOrchestration
    6. SendGrid
    7. EventHubTrigger
    8. ServiceBusQueueTrigger
    9. ServiceBusTopicTrigger
    10. EventGridTrigger
    11. IotHubTrigger
    Choose option: 2
    Function name: myhelperfunc
    myhelperfunc
    ```
5. Inspect the myhelper directory again and you should now see ```myhelperfunc.cs```. 
6. Open the ```myhelperfunc.cs``` file in your favorite code or text editor and update the ```AuthorizationLevel``` in the method signature from ```AuthorizationLevel.Function``` to ```AuthorizationLevel.Anonymous```.

7. Build the function container using the following:
    ```bash
    docker build -t myhelperfunc .
    ```
8. Run the function container.
    ```bash
    docker run -d -p 80:80 myhelperfunc
    ```
9. Test the container
    ```bash
    curl http://localhost/api/myhelperfunc?name=Docker
    ```
10. Open the ```myhelperfunc.cs``` file again and add the code below  inside the method, between the method start and end curly brackets, to make the function a little more interesting. 

    ```csharp
    string text = new StreamReader(req.Body).ReadToEnd();

    string top = "";
    string bottom= "";
    for (int i = 0; i < text.Length+2; i++)
    {
        top +="_";
        bottom+="-";
    }
    string output = $" {top}\n< {text} >\n {bottom}\n \\\n  \\\n    __\n   /  \\\n   |  |\n   @  @\n   |  |\n   || |/\n   || ||\n   |\\_/|\n   \\___/ ";

    return output != null
        ? (ActionResult)new OkObjectResult(output)
        : new BadRequestObjectResult("Please pass a message in the request body");
    ```
11. Run ```docker build``` using your container registry tag.
    ```bash
    REGISTRYNAME=<insertRegistryName>
    docker build -t $REGISTRYNAME/myhelperfunc .
    ```
12. Login to your container registry and push your function app container.

    ```bash
    docker login $REGISTRYNAME
    #Enter credentials when prompted
    ```
13. Deploy the function app to AKS
    ```bash
    func deploy --platform kubernetes --name myhelperfunc --registry $REGISTRYNAME
    ```

14. Test the function
    ```bash
    curl -X POST -d "Hello" http://<insertIP>/api/myhelperfunc
    ```

## Troubleshooting / Debugging

## Docs / References

