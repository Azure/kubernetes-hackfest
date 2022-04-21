# Lab 4: Configuring network policies in Otomi

In this lab we are going to deploy a multi tier web application, called `guestbook`, map the 3 K8s services to Otomi and configure public access to the front-end. Next we are going to turn on the NetworkPolicies option for the team.

## Instructions

1. Install the Guestbook application resources in the `team-<TEAM-NAME>` namespace:

```bash
kubectl apply -f https://raw.githubusercontent.com/redkubes/workshops/main/netpol/manifests/guestbook.yaml -n team-<TEAM-NAME>
```

2. Get the names of the created ClusterIP services:

```bash
kubectl get svc -n team-<TEAM-NAME>
```

You will see three services:

```bash
NAME             TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
frontend         ClusterIP   10.0.183.235   <none>        80/TCP     6m44s
redis-follower   ClusterIP   10.0.135.61    <none>        6379/TCP   6m44s
redis-leader     ClusterIP   10.0.82.226    <none>        6379/TCP   6m44s
```

3. Go to Otomi Console. Make sure you have selected your team in the top bar en and then click the `Services` item under your team in the side menu.

4. We will now first add the created frontend service to Otomi. Click `Create Service`.

5. Fill in the name `frontend`.

6. Under `Exposure ingress`, select `Public`. Leave all other settings under exposure default.

7. Leave all other settings default and click `Submit`.

8. Click `Deploy Changes`.

After the changes have been deployed (this will take a couple of minutes), you will see that the service we just created has a host name. Click on the host name. What do you see? Submit a couple of messages.

9. Now add the other two services (`redis-follower` and `redis-leader`). Make sure to provide the correct port (6379) for both the `redis-leader` and `redis-follower` services. Leave all other settings default (so no exposure) and Submit. You don't need to Deploy Changes after every Submit. Just create the 2 services and then Deploy Changes.

When you create a service in Otomi with ingress `Cluster`, the K8s service will be added to the service-mesh in Otomi. When you create services in Otomi, the Istio Gateway is automatically configured and Istio virtual services are also automatically created.

Notice that the guestbook front-end still works!

10. In Otomi Console go to your team and then click the `Settings` item.

11. Under NetworkPolicy, enable `Network Policies`. Click on `submit` and then `Deploy Changes`.

Now go to the Guestbook application and notice that your messages are gone and you can't submit new messages. This is because traffic between the frontend and the 2 redis services is not permitted anymore. Let's fix this.

12. Click on the `redis-leader` service.

13. Under Network Policies, select `Allow selected` and click `Add Item`. Add the following 2 items and Submit:

| Team name   | Service Name |
| ----------- | ------------ |
| TEAM-NAME   | frontend     |
| TEAM-NAME   | redis-follower |

Before deploying changes, go to the `redis-follower` service and do the same, but in this case only allow the frontend service:

| Team name   | Service Name |
| ----------- | ------------ |
| TEAM-NAME   | frontend    |
| TEAM-NAME   | redis-leader |

Now `Deploy Changes` and check the progress of the deployment in the `Drone` application.

Note that the Guestbook app works again.

Go to the [next lab](../5_activate_apps/README.md)
