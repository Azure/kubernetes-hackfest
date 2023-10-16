# Install NGINX Ingress Controller by pulling image from F5 Docker registry

This doc needs to used as an alternative to Step 7 of [Install NGINX Ingress Controller using Manifest files](readme.md#install-nginx-ingress-controller-using-manifest-files) section in case `nginx-plus-ingress` image hasn't been pushed to your ACR registry and you would like to directly pull the image from F5's private Docker registry.
>**Note:** This doc only replaces Step 7 within [Install NGINX Ingress Controller using Manifest files](readme.md#install-nginx-ingress-controller-using-manifest-files) of the main readme doc. All the steps from 1-6 need to be performed before starting here.

1. To pull images from F5 Docker registry you would require a NGINX Ingress Controller subscription JWT token (Please check with lab instructors if you donot have this). Copy your JWT token into an environment variable by running either of two below commands:
   
   Replace `{JWT Token}` placeholder with your JWT Token.
   ```bash
   export jwt_token="{JWT Token}"
   ```
   OR
    
    if you have the jwt token in a file then replace `{JWT Token file path}` placeholder with your JWT file path.
   ```bash
   export jwt_token=$(cat {JWT Token file path})
   ```

2. Confirm that the `jwt_token` has been set by running below command. 
   ```bash
   echo $jwt_token
   ```

3. Create a Kubernetes docker-registry secret type on the cluster, by passing the `jwt_token` environment variable as the username and `none` for password (Password is unused). The name of the docker server is `private-registry.nginx.com`. 
   ```bash
   kubectl create secret docker-registry regcred --docker-server=private-registry.nginx.com --docker-username=$jwt_token --docker-password=none -n nginx-ingress
   ```

4. Confirm the details of the created secret by running below command.
   ```bash
    kubectl get secret regcred -n nginx-ingress --output=yaml
   ```

5. Assuming you are still in `kubernetes-ingress/deployments` directory, navigate to Azure/labs directory 
    ```bash
    cd ../../Azure/labs
    ```
  
    Observe the `lab1/jwt-nginx-plus-ingress.yaml` looking at below details:
     - On line #22-23, we included the `imagePullSecret` field to make use of the `regcred` secret that we created in previous step to pull images from F5 private docker registry.
     - On line #38, we have replaced the `nginx-plus-ingress:3.2.1` placeholder with an image that we pull directly from the private F5 docker registry(`private-registry.nginx.com/nginx-ic/nginx-plus-ingress:3.2.1-alpine-fips`) instead using image that we pushed in the private ACR registry as instructed in lab0.
     - On lines #52-53, we have added TCP port 9000 for the Plus Dashboard.
     - On lines #98-99, we have enabled the Dashboard and set the IP access controls to the Dashboard.
     - On lines #16-19, we have enabled Prometheus related annotations.
     - On line #108, we have enabled Prometheus to collect metrics from the NGINX Plus stats API.
     - On line #109, we have enabled OIDC. This is to add authentication to a specific application which is covered in lab3.
     - On line #67, we are changing `allowPrivilegeEscalation` from default value of `false` to `true`. This is needed to run few FIPS related test commands in lab5.
     - On line #97, uncomment to make use of default TLS secret.

    Now deploy NGINX Ingress Controller as a Deployment using the updated manifest file.
    ```bash
    kubectl apply -f lab1/jwt-nginx-plus-ingress.yaml
    ```

Now you should be all set and can continue with the next section ([Check your NGINX Ingress Controller](readme.md#check-your-nginx-ingress-controller)) of the main readme doc.