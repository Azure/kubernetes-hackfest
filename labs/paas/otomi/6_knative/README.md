# Lab 6: Using Knative in Otomi

In this lab we are going to activate Knative and create a new Knative service using Otomi Console.

## Instructions

1. Go to the Apps section under `Platform` in the side menu and Drag and Drop `Knative` from the `Disabled apps` to the `Enabled apps` and `Deploy Changes`.

2. Select your team in the top bar, click `Services` under your team in the right menu and click on `Create Service`.

You might notice that in the `Service type` section there are now 2 extra options:

- Existing knative service: to map a pre-deployed knative service to Otomi
- New knative service: to create a new knative service using Otomi

3. Provide a name for your service

4. Select `New knative service` and use the following values:

- Run As User: 1001
- Repository: nginxinc/nginx-unprivileged
- Tag: stable
- Limits: CPU=200m, Memory=128Mi
- Requests: CPU=100m, Memory=64Mi
- Exposure: Public

5. Now click `Submit` and then `Deploy Changes`.

6. The new service and the hostname are now shown in the list of services. Wait until the Drone pipeline has finished and click on the hostname. What do you see?

This was the last lab. In the labs we only touched upon a couple of Otomi features. Please go and play around some more. And if you run into any issues, please report them [here](https://github.com/redkubes/otomi-core). We hope you enjoyed the labs. To show your appreciation to our open source project, please ⭐️ ⭐️ ⭐️

Thank you!
