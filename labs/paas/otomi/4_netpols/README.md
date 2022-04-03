# Lab 4

In this lab we are going to deploy a multi tier web application, called [guestbook](https://github.com/hivenetes/guestbook), map the 3 K8s services to Otomi and configure public access to the front-end. Next we are going to turn on the NetworkPolicies option for the team.

## Instructions

1. Install the Guestbook resources:

```bash
kubectl apply -f https://github.com/hivenetes/guestbook/blob/master/guestbook.yaml -n team-<team-name>
```

2. Get the names of the created ClusterIP services:

```bash
kubectl get svc -n team<team-name>
```
You will see 3 services:

```bash
NAME             TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
frontend         ClusterIP   10.0.183.235   <none>        80/TCP     6m44s
redis-follower   ClusterIP   10.0.135.61    <none>        6379/TCP   6m44s
redis-leader     ClusterIP   10.0.82.226    <none>        6379/TCP   6m44s
```

3. Go to the console and click `Services` under your team

4. We will now first add the created frontend service to Otomi. Click `Create Service`. 

5. Fill in the name `frontend`

6. Under `Exposure`, select `Public`. Leave all other settings default

7. Leave all other settings default and click `Submit`

8. Click `Deploy Changes`

After the changes have been deployed (this will take a couple of minutes), you will see that the service we just created has a host name. Click on the host name. What do you see? Submit a couple of messages.

9. Now add the other 2 services (reddis-follower and reddis-leader). Make sure to provide the correct port (6379). Leave all other settings default and Submit. You don't need to Deploy Changes after every Submit. Just create the 2 services and then Deploy Changes.

When you create a service in Otomi with ingress `Cluster`, the K8s service will be added to the service-mesh in Otomi. When you create services in Otomi, the Istio Gateway is automatically configured and Istio virtual services are also automatically created.

Notice that the guestbook front-end still works!

10. Go to the console and select `Settings` under your team.

11. Under NetworkPolicy, enable `Network Policies`

Now go to the Guestbook application and notice that your messages have gone and you can't submit new messages. This is because traffic between the frontend and the 2 reddis services is not permitted anymore. Let's fix this.

12. Click on the `reddis-leader` service

13. Under Network Policies, select `Allow selected` and click `Add Item`. Add the following 2 items and Submit:

| Team name | Service Name |
| ---       |              |
| <team-name> | frontend |
| <team-name> | reddis-follower |

Before deploying changes, go to the reddis-follower service and to the same, but in this case only allow the frontend service:

| Team name | Service Name |
| ---       |              |
| <team-name> | frontend |

Now `Deploy Changes`

Notice that the Guestbook app works again.


