# Lab 3: Creating Teams in Otomi

In this lab, we are going to create a Team in Otomi. Teams in Otomi serve the following purpose:

1. Creating a namespace on the cluster, configuring RBAC and setting default quota's

2. Provide self-service options for team members in Otomi Console

3. Isolate ingress traffic between teams

4. Optionally: Separate team metrics and logs. When multi-tenancy is not enabled (default), metrics and logs are not separated (providing all users admin role to see cluster wide metrics and logs)

Let's create a Team

## Instructions

1. Go to the Teams sections in Otomi Console

2. Click on `Create team`

3. Provide a name for the team

4. Under NetworkPolicy, disable `Network policies` and `Egress control` (we will activate this later on)

5. Leave all other settings default

6. Click on `Submit`

7. Click on `Deploy Changed` (this will become active after a change has been submitted)

8. Select your team in teh top bar

9. See that in the left bar, the team section appears

Note:

- Because we did not enable Alert manager, the Alerts section is disabled
- Because we did not enable Grafana, the Azure Monitor section is disabled

Go to the [next lab](../4_netpols/README.md)
