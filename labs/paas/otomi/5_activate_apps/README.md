# Lab 5: Activate apps in Otomi

Otomi by default installs a minimal set of apps. These are called the Core apps. With the Core apps, Otomi offers an advanced ingress architecture, using Nginx, Istio, Keycloak, Certmanager and Oauth2, combined with developer self-service. Next to the Core apps, Otomi offers optional apps like Knative, Harbor, Vault, Kubeapps, Prometheus, Loki, Alertmanager, and more. These apps are all fully integrated and can be activated by dragging them to the active apps section in the Console.

In this lab we are going to activate Loki for logging. But first: The multi-tenancy option in Otomi is by default not enabled. When multi-tenancy is enabled, team metrics and logs will be separated per team. When multi-tenancy is disabled this effectively gives all users the admin role for logs and metrics, including metrics and logs of all platform services.

## Instructions

1. Go to `Settings` under the `Platform` section in the side menu and then select `Otomi`. In the bottom of the page you will see the flag `Multi-tenancy`. For this lab, we will not enable multi-tenancy.

2. Go to `Apps` under the `Platform` section in the side menu and Drag and Drop `Loki` from the `Disabled apps` to the `Enabled apps`. Notice that `Grafana` and `Prometheus` will also be enabled. This is because Loki requires Grafana, and Grafana requires Prometheus and therefor are also installed because of these dependencies.

3. Click on `Deploy Changes`

4. To see the progress of the installation of Loki, go to apps under the Platform section and click on `Drone`. In the top right you will see a play button. Click on it. The Drone app will now open in a new tab. Click on the `otomi/values` repository and then on the last build execution. When the `apply` step is finished, Loki and Grafana will be installed and ready to use.

5. Go to the Apps section again and click on `Loki`. In the app bar, click on `Values`. The Loki chart has been installed with sane default values to support the most common use cases. Click on `Duration` to see the default value. All the defaults (specified in the Otomi values [schema](https://github.com/redkubes/otomi-core/blob/master/values-schema.yaml) can be modified.

6. In the app bar, click on `Raw values`. In the Raw values, all values of the Loki chart that are not provided with defaults from the Otomi values schema can be used here.

7. Click on the play button. A new tab wil open and here you can execute queries to search for logs. Add the following query: `{namespace="team-<TEAM-NAME>"}`. Now you will see all the logs of containers running in the namespace of your team. Copy the path after .nip.io/ from the address bar in your browser.

8. Go back to the console and in the Loki app, click on `Shortcuts`. Click `Edit` and the `Add item`. Fill in a title (like "TEAM-NAME logs"), a description (like "The logs of TEAM-NAME") and paste the copied path. Now click Submit. The shortcut you now created can be used to go directly to Loki and see the result of your query.

Go to the [next lab](../6_knative/README.md)
