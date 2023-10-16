# Lab 4: Monitoring NIC with Prometheus and Grafana

<br/>

## Introduction

This lab exercise is going to walk you through how to install and use several tools to monitor your NGINX Ingress Controller in your Kubernetes cluster. 
<br/>

## Learning Objectives
By the end of the lab, you will be able to: 

- Learn and Use Helm Charts
- Deploy Prometheus using Helm
- Deploy Grafana using Helm
- Access these apps thru NGINX Ingress Controller

<br/>

Helm | Prometheus | Grafana
:-------------------------:|:-------------------------:|:-------------------------:
![](media/helm-icon.png)  |![](media/prometheus-icon.png)  |![](media/grafana-icon.png)

<br/>

Here is a brief description of what these different tools and application provide, and how you will use them.

`Helm` will make it simple to install everything into your cluster. This keeps the setup easier to deploy and easier to manage.  (Note, you can also install using the `manifests` method or `operator` method as well). It will come down to personal preference or specific requirements when installing software into Kubernetes.  You will use the Helm Chart provided by NGINX for this lab exercise.

`Prometheus` is a software package that can watch and collect statistics from many different k8s pods and services.  It then provides those statistics in a simple html/text format, often referred to as the "scraper page", meaning that it scrapes the statistics and presents them as a simple text-based web page.

`Grafana` is a data visualization tool, which contains a time series database and graphical web presentation tools.  Grafana imports the Prometheus scraper page statistics into it's database, and allows you to create `Dashboards` of the statistics that are important to you.  There are a large number of pre-built dashboards provided by both Grafana and the k8s community, so there are many available to use. And of course, you can customize them as needed or build your own.

<br/>

## Helm Installation

![Helm](media/helm-icon.png)

1. Run below command to install helm:
    ```bash
    # Install helm command
    curl -sSL https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash
    ```
1. Verify Helm is installed and you are running Version 3.x or higher:

    ```bash
    # check your helm version (Needs to be v3 or higher)
    helm version --short
    ```
    ```bash
    ###Sample Output###
    v3.11.2+g912ebc1
    ```
2. Create a new Kubernetes namespace called `monitoring`. You will use this namespace for Prometheus and Grafana components:

    ```bash
    kubectl create namespace monitoring
    ```
    <br/>

## Prometheus Installation

![Prometheus](media/prometheus-icon.png)

<br/>

1. The first step will be to deploy `Prometheus` into our cluster. Below are the steps to install it using Helm as follows:  

    ```bash
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

    helm repo add kube-state-metrics https://kubernetes.github.io/kube-state-metrics

    helm repo update
    ```
    ```bash
    ###Sample Output###
    "prometheus-community" has been added to your repositories
    "kube-state-metrics" has been added to your repositories
    Hang tight while we grab the latest from your chart repositories...
    ...Successfully got an update from the "kube-state-metrics" chart repository
    ...Successfully got an update from the "prometheus-community" chart repository
    Update Complete. ⎈Happy Helming!⎈
    ```

2. Once the repos have been added to Helm, the next step is to deploy a `release`. For this lab, you will create a release called `nginx-prometheus`.   

    ```bash
    helm install nginx-prometheus prometheus-community/prometheus --set server.persistentVolume.enabled=false -n monitoring
    ```
    ```bash
    ###Sample Output###
    NAME: nginx-prometheus
    LAST DEPLOYED: Mon Oct  9 16:12:11 2023
    NAMESPACE: monitoring
    STATUS: deployed
    REVISION: 1
    TEST SUITE: None
    NOTES:
    The Prometheus server can be accessed via port 80 on the    following DNS name from within your cluster:
    nginx-prometheus-server.monitoring.svc.cluster.local


    Get the Prometheus server URL by running these commands in the same shell:
    export POD_NAME=$(kubectl get pods --namespace monitoring -l "app.kubernetes.io/name=prometheus,app.kubernetes.io/instance=nginx-prometheus" -o jsonpath="{.items[0].metadata.name}")
    kubectl --namespace monitoring port-forward $POD_NAME 9090
    #################################################################################
    ######   WARNING: Persistence is disabled!!! You will lose your data when   #####
    ######            the Server pod is terminated.                             #####
    #################################################################################


    The Prometheus alertmanager can be accessed via port 9093 on the following DNS name from within your cluster:
    nginx-prometheus-alertmanager.monitoring.svc.cluster.local


    Get the Alertmanager URL by running these commands in the same shell:
    export POD_NAME=$(kubectl get pods --namespace monitoring -l "app.kubernetes.io/name=alertmanager,app.kubernetes.io/instance=nginx-prometheus" -o jsonpath="{.items[0].metadata.name}")
    kubectl --namespace monitoring port-forward $POD_NAME 9093
    #################################################################################
    ######   WARNING: Pod Security Policy has been disabled by default since    #####
    ######            it deprecated after k8s 1.25+. use                        #####
    ######            (index .Values "prometheus-node-exporter" "rbac"          #####
    ###### .          "pspEnabled") with (index .Values                         #####
    ######            "prometheus-node-exporter" "rbac" "pspAnnotations")       #####
    ######            in case you still need it.                                #####
    #################################################################################


    The Prometheus PushGateway can be accessed via port 9091 on the following DNS name from within your cluster:
    nginx-prometheus-prometheus-pushgateway.monitoring.svc.cluster.local


    Get the PushGateway URL by running these commands in the same shell:
    export POD_NAME=$(kubectl get pods --namespace monitoring -l "app=prometheus-pushgateway,component=pushgateway" -o jsonpath="{.items[0].metadata.name}")
    kubectl --namespace monitoring port-forward $POD_NAME 9091

    For more information on running Prometheus, visit:
    https://prometheus.io/
    ```
    <br/>

## Grafana Installation

![Grafana](media/grafana-icon.png)

<br/>

1. Next step will be to setup and deploy Grafana into your cluster: 

    ```bash
    helm repo add grafana https://grafana.github.io/helm-charts

    helm repo update
    ```
    ```bash
    ###Sample Output###
    "grafana" has been added to your repositories
    Hang tight while we grab the latest from your chart repositories...
    ...Successfully got an update from the "kube-state-metrics" chart repository
    ...Successfully got an update from the "prometheus-community" chart repository
    ...Successfully got an update from the "grafana" chart repository
    Update Complete. ⎈Happy Helming!⎈
    ```

2. The Grafana repo is added via Helm. Next you will install Grafana using the below command. For this lab, you will create a second release called `nginx-grafana`.  

    ```bash
    helm install nginx-grafana grafana/grafana -n monitoring
    ```
    ```bash
    ###Sample Output###
    NAME: nginx-grafana
    LAST DEPLOYED: Mon Oct  9 16:22:22 2023
    NAMESPACE: monitoring
    STATUS: deployed
    REVISION: 1
    NOTES:
    1. Get your 'admin' user password by running:

        kubectl get secret --namespace monitoring nginx-grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo


    2. The Grafana server can be accessed via port 80 on the following DNS name from within your cluster:

        nginx-grafana.monitoring.svc.cluster.local

        Get the Grafana URL to visit by running these commands in the same shell:
     export POD_NAME=$(kubectl get pods --namespace monitoring -l "app.kubernetes.io/name=grafana,app.kubernetes.io/instance=nginx-grafana" -o jsonpath="{.items[0].metadata.name}")
        kubectl --namespace monitoring port-forward $POD_NAME 3000

    3. Login with the password from step 1 and the username: admin
    #################################################################################
    ######   WARNING: Persistence is disabled!!! You will lose your data when   #####
    ######            the Grafana pod is terminated.                            #####
    #################################################################################
    ```

    If you want to check the status of your helm installations, you can run this command which will show all helm deployments across the cluster"

    ```bash
    helm ls -A
    ```
    ```bash
    ###Sample Output###
    NAME                    NAMESPACE       REVISION        UPDATED                                 STATUS          CHART                   APP VERSION
    nginx-grafana           monitoring      1               2023-10-09 16:22:22.207876 -0500 CDT    deployed        grafana-6.60.4          10.1.4     
    nginx-prometheus        monitoring      1               2023-10-09 16:12:11.677934 -0500 CDT    deployed        prometheus-25.1.0       v2.47.0    
    ```
    <br/>

## Prometheus and Grafana Testing

For you and your team to access Prometheus and Grafana from outside the cluster, you will add these apps to your existing NGINX Ingress Controller. In your lab environment, you will use VirtualServer and VirtualServerRoute manifests, to take advantage of NGINX's ability to do cross-namespace routing. (Prometheus and Grafana are running in the "monitoring" namespace, remember?).  

1. Inspect the `prometheus-vs.yaml`, `grafana-vs.yaml` and `grafana-vsr.yaml` files in the lab4 folder.

    Notice that you are routing requests to your Prometheus and Grafana applications that live in a different namespace (`monitoring` in this lab), which are specified in your `VirtualServer/VirtualServerRoute` configuration.

2. Apply the VS manifests:

    ```bash
    kubectl apply -f lab4/prometheus-vs.yaml
    kubectl apply -f lab4/grafana-secret.yaml
    kubectl apply -f lab4/grafana-vs.yaml
    kubectl apply -f lab4/grafana-vsr.yaml
    ```
    ```bash
    ###Sample Output###
    virtualserver.k8s.nginx.org/prometheus-vs created
    secret/grafana-secret created
    virtualserver.k8s.nginx.org/grafana-vs created
    virtualserverroute.k8s.nginx.org/grafana-dashboard created
    ```
    <br/>


3. To test Prometheus access through NGINX Ingress, open Chrome and navigate to Prometheus (http://prometheus.example.com). You should see a webpage like below. Search for `nginx_ingress_nginxplus` in the query box to see a list of all the statistics that Prometheus is collecting for you: 
   
   ![Prometheus Statistics List](media/prometheus_statistics_list.png)

    Select `nginx_ingress_nginxplus_http_requests_total` from the list, click on Graph, and then click the "Execute" Button.  This will provide a graph similar to this one:

    ![Prometheus graph screenshot](media/prometheus_graph.png)

    Take a few minutes to explore the many  different statistics, time windows, etc. Try another Prometheus query that interests you.

4. To test Grafana access through NGINX Ingress, open Chrome and navigate to Grafana (https://grafana.example.com). You should see a Grafana login page like below.
   
    ![Grafana Login](media/ext_grafana_login.png)

    Retrieve the Grafana `admin` login password, which was dynamically created by Helm during the installation:

    ```bash
    kubectl get secret --namespace monitoring nginx-grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
    ```
    | | |
    |---|---|
    | **username:** | admin |
    | **password:** | Output of the above command |


    After logging in, you should see the main Grafana Welcome page:

    ![Grafana screenshot](media/ext_grafana_welcome.png)

## Configure Grafana Data Sources

1. Once logged in, click on `Data Sources` shortcut present on the Welcome page. This would navigate you to `Home > Connections > Data sources > Add data source` which we can also reach by using the left  `Toggle Button`. Add `Prometheus` as a data source.
   
    ![Data Sources](media/grafana_data_source.png)
    ![Add Prometheus DS](media/grafana_add_prometheus.png)

2. Once `Prometheus` is added as a data source, in the Prometheus `settings` tab, update the HTTP URL to `http://nginx-prometheus-server:80`.

    ![Update Prometheus URL](media/grafana_prometheus_ds.png)

    Scroll to the botton, and click "Save and Test", it should show a Green Checkmark status and then click the "Home" button to take you back to welcome page.

## Import Grafana Custom Dashboards

1. Now you should be ready to import the NGINX Dashboards for NIC from NGINX, Inc. Using the left `Toggle Button`, navigate to `Home > Dashboards`.
Within the `Dashboard` section, expand the right `New` button and then click on `Import` to add a dashboard:

    ![Grafana Import](media/grafana_imports.png)

2. Next you will import the two Grafana dashboard JSON definition files present in the `lab4` folder.

   - `NGINX-Basic.json` gives you basic metrics which come from NGINX Opensource.
   - `NGINXPlusICDashboard.json` is provided by NGINX, Inc, giving you advanced Layer 4 thru 7 TCP/HTTP/HTTPS metrics which are only available from NGINX Plus.

    Copy the entire json file and place it within the  `Import via panel json` textbox and click on `Load` button. In the subsequent screen click on `Import` button with default fields.

    ![json load](media/grafana_json_load.png)

    ![json load2](media/grafana_json_load2.png)
    <br/>

3. Once you have imported both Dashboards, it's time to check them out:

    Navigate back to `Dashboard` section. Within this section, click on the `NGINX` dashboard.

    ![grafana open NGINX dashboard](media/grafana_open_basic_dashboard.png)

    This should open up the NGINX Basic Grafana Dashboard. You can expand the sub-sections or adjust the `time range` and `refresh` interval in the upper right corner as needed.  You can see this shows the up/down Status of the Ingress, and few Connections and Requests stats:

    ![grafana nginx basic dashboard](media/grafana_nginx_basic.png)

    **NOTE:** If you see a red bar with the message "**No Data**" in the top most pane as seen in below screenshot then click on edit, and change Value options Fields to "Numeric Fields" and click Apply.

    ![no data issue](media/grafana_no_data.png)

    ![no data fix](media/grafana_no_data_fix.png)
    
    <br/>

1. Next, from the `Dashboards` section, select the `NGINX Plus Ingress Controller` Dashboard.

    ![grafana open NIC dashboard](media/grafana_open_nic_dashboard.png)

    This should open up the NGINX Plus Grafana Dashboard. You can expand the sub-sections or adjust the time range and refresh time as needed.

    ![grafana NIC dashboard](media/grafana_nic_dashboard.png)

    If the graphs are blank or do not show much data, try running a load test tool of your choice(You can use the code below to run [wrk](https://github.com/wg/wrk) load tool). Once load test has run for few minutes, you should start seeing some statistics being collected and graphed:

    ```bash
     # Make sure the bash variables are populated with the correct values
    export EIP=$(kubectl get svc nginx-ingress -n nginx-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

    echo $EIP
    ```
    ```bash
    docker run --rm williamyeh/wrk -t4 -c200 -d20m -H 'Host: cafe.example.com' --timeout 2s https://$EIP/coffee
    ```
    ```bash
    ###Sample Output###
    Running 20m test @ https://13.86.100.10/coffee
    ```
    <br/>

**This completes the Lab.** 
<br/>

## References: 

- [VirtualServer and VirtualServerRoute](https://docs.nginx.com/nginx-ingress-controller/configuration/virtualserver-and-virtualserverroute-resources/)

- [Grafana NGINX Plus IC Dashboard](https://github.com/nginxinc/kubernetes-ingress/tree/master/grafana)
<br/>

### Authors
- Chris Akker - Solutions Architect - Community and Alliances @ F5, Inc.
- Shouvik Dutta - Solutions Architect - Community and Alliances @ F5, Inc.
- Jason Williams - Principle Product Management Engineer @ F5, Inc.

-------------

Navigate to ([Lab5](../lab5/readme.md) | [Main Menu](../readme.md#lab-outline))
