# Lab 2: Installing Otomi on AKS

In this lab, we'll be installing [Otomi](https://github.com/redkubes/otomi-core) using `helm`.

## Instructions

1. Helm CLI is installed by default in Azure Cloud shell

    ```bash
    helm version
    ```

2. Add Otomi helm chart repository

    ```bash
    helm repo add otomi https://otomi.io/otomi-core && \
    helm repo update
    ```

3. Install Otomi with chart values

    ```bash
    helm install otomi otomi/otomi \
    --set cluster.k8sVersion="1.21" \
    --set cluster.name=$CLUSTERNAME \
    --set cluster.provider=azure
    ```

4. Monitoring the Chart install

    ```bash
    # The chart deploys a Job (`otomi`) in the `default` namespace
    # Monitor the status of the job
    kubectl get job otomi -w
    # watch the helm chart install status (optional)
    watch helm list -Aa
    ```

5. When the installer job has finished, go to the end of the logs

    ```bash
    kubectl logs jobs/otomi -n default -f
    ```

   There you will see the following:

    ```bash
    2022-04-01T10:01:59.239Z otomi:cmd:commit:commit:info                                                                                            
    ########################################################################################                                      
    #  To start using Otomi, go to https://<your-ip>.nip.io and sign in to the web console 
    #  with username "otomi-admin" and password "password".
    #  Then activate Drone. For more information see: https://otomi.io/docs/installation/activation
    ########################################################################################
    ```

6. Sign in to the web UI (Otomi Console)

   Once Otomi is installed, go to the url provided in the logs of the installer job and sign in to the web UI with the provided username and password.

7. Add the auto generated CA to your keychain (optional)

   Since we install Otomi without proving a custom CA or using LetsEncrypt, the installer generated a CA. This CA is of course not trusted on your local machine.
   To prevent you from clicking away lots of security warnings in your browser, you can add the generated CA to your keychain:

- In the left menu of the console, click on "Download CA"
- Double click the downloaded CA.crt or add the CA to your keychain on your mac using the following command:
  
  ```bash
  # On Mac
  sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ~/Downloads/ca.crt  
  ```  

  ```powershell
  # On Windows(PowerShell - Run as Administrator)
  # Use certutil:
  certutil.exe -addstore root <downloaded cert path>
  # Or 
  Import-Certificate -FilePath "<downloaded cert path>" -CertStoreLocation Cert:\LocalMachine\Root
  # Restart the browser 
  ```

    But you could also run Chrome (sorry Msft folks ;) in insecure mode:

    ```bash
    alias chrome-insecure='/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --ignore-certificate-errors --ignore-urlfetcher-cert-requests &> /dev/null'
    ```

8. Activate Drone:

- In the side menu of Otomi Console under `Platform`, select `Apps` and click on the **Drone** app
- Click on the `play` button in the top right. A new tab will open for Drone
- Sign in locally with as `otomi-admin` and the password provided in the logs of the installer job.
- Click on `Authorize Application`
- Click on `Submit on the Complete your Drone Registration page. You don't need to fill in your Email, Full Name or Company Name if you don't want to
- Click on the `otomi/values` repository
- Click on `+ Activate Repository`


Go to the [next lab](../3_create_team/README.md)
