# Lab 2 Part 2: Trigger Notifications Based on Alerts

In the last lab we configured Prometheus and Alert Manager to raise an alert based on a cluster metric. You can see these alerts in the Prometheus dashboard, but you probably want those alerts to surface via email or other means. In this lab we'll configure Alert Manager to invoke an Azure Logic App via a webhook and will configure that logic app to write the alert to a Teams channel.

>*NOTE:* If you don't have Teams, you can easily modify this lab to send an email or just watch the Logic App itself to see the alerts being raised.

## Prerequisites

* Complete previous labs:
    * [Create AKS Cluster](../create-aks-cluster/README.md)
    * [Monitoring Setup](./monitoring.md)
    * [Alerting Part 1](./alerting-part1.md)

## Instructions

Alert Manager provides a bunch of notification options, which are documented [here](https://prometheus.io/docs/alerting/latest/configuration/). For our lab we'll make use of the [WebHook Configuration](https://prometheus.io/docs/alerting/latest/configuration/#webhook_config). Unlike the Prometheus rule file we pulled in the last lab, which was stored in a Kubernetes ConfigMap, the Alert Manager configuration is stored in a Kubernetes Secret. This makes is slightly harder to access, but we'll work through the steps here.

### Get the Alert Manager Configuration File

```bash
kubectl get secret alertmanager-main-generated  -n monitoring -o yaml > alertmanager-main.yaml
```

Take a look at the output file. It should look something like this:

```yaml
apiVersion: v1
data:
  alertmanager.yaml: Imdsb2JhbCI6CiAgIn...truncated....NyaXRpY2FsIg==
kind: Secret
metadata:
  creationTimestamp: "2022-05-24T14:28:31Z"
  labels:
    managed-by: prometheus-operator
  name: alertmanager-main-generated
  namespace: monitoring
  ownerReferences:
  - apiVersion: monitoring.coreos.com/v1
    blockOwnerDeletion: true
    controller: true
    kind: Alertmanager
    name: main
    uid: 2f20493f-f298-4cba-8fcb-5b35f6faa964
  resourceVersion: "2948836"
  uid: 7577eb1f-f173-452a-afd8-4ba0de483813
type: Opaque
```

The big blob of data in the 'alertmanager.yaml' section is our configuration file, but it's base64 encoded, so we need to decode. There are a lot of ways to decode. You can find a website that you can paste it in to decode, like [www.base64decode.org](https://www.base64decode.org/), or you can just use the command line like follows:

```bash
echo "Imdsb2JhbCI6CiAgInJlc29s...truncated....yaXRpY2FsIg==" | base64 -d > alertmanager.yaml
```

Take a look at that file and familiarize yourself with the contents. You can review the alert manager configuration document [here](https://prometheus.io/docs/alerting/latest/configuration/) to understand the file structure.

### Create the Webhook

You can review the alert manager configuration to see what alert recievers are available out of the box. For our lab we're going to send a message to Microsoft Teams. Fortunately, the [Alert Manager WebHook Documentation](https://prometheus.io/docs/alerting/latest/configuration/#webhook_config) tells us that its WebHook reciever will send a POST to the target URL with the following message body.

```json
{
  "version": "4",
  "groupKey": <string>,              // key identifying the group of alerts (e.g. to deduplicate)
  "truncatedAlerts": <int>,          // how many alerts have been truncated due to "max_alerts"
  "status": "<resolved|firing>",
  "receiver": <string>,
  "groupLabels": <object>,
  "commonLabels": <object>,
  "commonAnnotations": <object>,
  "externalURL": <string>,           // backlink to the Alertmanager.
  "alerts": [
    {
      "status": "<resolved|firing>",
      "labels": <object>,
      "annotations": <object>,
      "startsAt": "<rfc3339>",
      "endsAt": "<rfc3339>",
      "generatorURL": <string>,      // identifies the entity that caused the alert
      "fingerprint": <string>        // fingerprint to identify the alert
    },
    ...
  ]
}
```

This is extremely helpful, because it means we can create an HTTP Reciever that expects that message body. Azure Logic Apps are a great option for this, and Logic Apps provide a lot of out of the box actions to do things like send an email, drop a message in a teams chat, etc. Lets go create a Logic App to act as our reciever.

1. Go to the Azure Portal and click the '+' icon in the top right, search for 'Logic App' and click 'Create'

    ![logic-app-create-1](../../assets/img/logic-app-create-1.jpg)

1. Choose a resource group, region and specify the name and plan type and then create:

    ![logic-app-create-2](../../assets/img/logic-app-create-2.jpg)

1. When the deployment completes, click on 'Go to resource'

1. We're going to start with a blank logic app, so click the icon for 'Blank Logic App' under 'Templates'

1. We're going to trigger this logic app with an HTTP Post, so we'll use the 'When HTTP request is recieved' trigger. 

    ![http-trigger](../../assets/img/http-trigger.jpg)

1. For the 'body schema' field, we already have a sample body from the Alert Manager documentation (above), so we can use the 'use sample payload to generate schema' option.

    ![sample-payload-1](../../assets/img/http-trigger-sample-payload-1.jpg)

1. Click 'use sample payload to generate schema' and paste in the following and then click 'Done'. This is just the example from the alert manager documentation with a few fixes to make sure the input data is valid.

    ```json
    {
        "version": "4",
        "groupKey": "data",
        "truncatedAlerts": 1,
        "status": "data",
        "receiver": "data",
        "groupLabels": null,
        "commonLabels": null,
        "commonAnnotations": null,
        "externalURL": "data",
        "alerts": [
            {
            "status": "data",
            "labels": null,
            "annotations": null,
            "startsAt": "data",
            "endsAt": "data",
            "generatorURL": "data",
            "fingerprint": "data"  
            }
        ]
    }
    ```
    ![sample-payload-2](../../assets/img/http-trigger-sample-payload-2.jpg)

1. Click 'Done'

    ![sample-payload-3](../../assets/img/http-trigger-sample-payload-3.jpg)

1. There could be multiple alerts, so we'll iterate through the alerts and execute one action per alert. Click on 'New Step' and search for 'For each'. It's under 'Control' so select 'Control' and then 'For Each'
   
   ![for-each-1](../../assets/img/for-each-1.jpg)

1. Click in the 'Select output from previous steps' dialog and then in the 'Dynamic Content' window select 'alerts'.

    ![for-each-2](../../assets/img/for-each-2.jpg)

1. We need to parse the contents of each item. We know it's JSON content, so we can use the JSON Parse action. Inside the 'For Each' loop box click on 'add an action' and then search for 'Parse', select 'Data Operations' and then 'Parse Json'

1. Click on the 'Content' dialog and in the 'Dynamic Content' window select 'item' to select the current item of the for each loop.

1. For the schema, we can use the alert item above, but there are some additional fields with an actual alert. Below is a schema you can use, or you could stub this out, complete the lab and then generate an alert to get the schema yourselve. Paste the following into the 'Schema' box

    ```json
    {
        "properties": {
            "annotations": {
                "properties": {
                    "description": {
                        "type": "string"
                    },
                    "runbook_url": {
                        "type": "string"
                    },
                    "summary": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "endsAt": {
                "type": "string"
            },
            "fingerprint": {
                "type": "string"
            },
            "generatorURL": {
                "type": "string"
            },
            "labels": {
                "properties": {
                    "alertname": {
                        "type": "string"
                    },
                    "prometheus": {
                        "type": "string"
                    },
                    "severity": {
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "startsAt": {
                "type": "string"
            },
            "status": {
                "type": "string"
            }
        },
        "type": "object"
    }
    ```

    ![parse-json](../../assets/img/parse-json.jpg)

1. Finally, lets add our teams message action. Click on 'Add an action' and search for 'Microsoft Teams'. 

    ![teams-1](../../assets/img/teams-1.jpg)

1. Select 'Microsoft Teams' and then 'Post message in chat or channel'

    ![teams-2](../../assets/img/teams-2.jpg)

1. The first time you use this you'll need to walk through your teams sign in process, to create the auth token to be used by the logic app. Complete the process.

1. Choose the options for the target chat or channel. I'm posting to a channel called 'Windows Cluster Alerts' in my 'Griffith' team, as shown below.

    ![teams-3](../../assets/img/teams-3.jpg)

1. Next we format the message we want to post. I'm going to show the Status, Alert Name, Severity and Description fields, so I've added them as shown below. Note that when you go to select 'Dynamic Content' from the 'Parse JSON' action, you may need to click 'Show more' to see all the fields.

    ![teams-4](../../assets/img/teams-4.jpg)

1. Finally, we can click 'Save' at the top of the screen! Now that the Logic App is saved we should be able to get the URL. Click on the 'When an HTTP request is recieved' action and copy the URL.

    ![logic-app-url](../../assets/img/logic-app-url.jpg)

### Update the Alert Manager Config with the WebHook Details

1. Go to your 'alertmanager.yaml' file and update the 'recievers' section as follows, providing your logic app URL:

    ```yaml
    "receivers":
    - "name": "Default"
    - "name": "Watchdog"
    - "name": "Critical"
    "webhook_configs":
    - "url": "<Insert Logic App URL"
        "send_resolved": true
    ```

1. We need to put this back into the secret, which means we need to base64 encode the file

    ```bash
    cat alertmanager.yaml|base64
    Imdsb2JhbCI6CiAgInJlc29sdm....truncated.....IkNyaXRpY2FsIg==
    ```

1. Copy the base64 encoded string and update the alertmanager-main-generated.yaml file you created above and replace the value of 'alertmanager.yaml' with your base64 encoded string.

1. We need to remove the references to the previous owner of the manifest file, so from the metadata section, remove all fields except 'name' and 'namespace'. Your file should look as follows:


    ```yaml
    apiVersion: v1
    data:
      alertmanager.yaml: Imdsb2...truncated...kNyaXRpY2FsIg==
    kind: Secret
    metadata:
      name: alertmanager-main-generated
      namespace: monitoring
    type: Opaque
    ```

1. Now we replace the existing secret.

    ```bash
    kubectl replace -f alertmanager-main.yaml -n monitoring 
    ```

1. Now if we go back and try to trigger our alert and the resolve the alert, we should see the messages arrive in our Teams chat.

    ![teams-alert-view](../../assets/img/teams-alert-view.jpg)

## Conclusion

That's it! You should now have a functioning alert pipeline! You can obvioulsy go back and adjust this to show other alerts by modifying the alert rules you set in part 1, or you can change the output to email or other by adjusting the actions used in this lab.