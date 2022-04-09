# Otomi: Self-hosted PaaS for AKS

<img src="./otomi-console.png" alt="otomi-screenshot"/>

[Otomi](https://otomi.io/) is an open source self-hosted PaaS for Kubernetes and connects many of the technologies found in the CNCF landscape in a single installable package to provide direct value to developers.

Otomi:

- Brings a full PaaS (like Heroku) to your own Kubernetes cluster. The only thing you'll need to do yourself is deploy your application and Otomi will do the rest.

- Allows you to use a PaaS on top of K8s without the constraints and abstractions of traditional PaaS offerings like OpenShift, Cloud Foundry and Heroku.

- Removes the burden of building and maintaining your internal (developer) platform, lowers the burden on operations, and empowers developers to focus on application deployment and management only.

## About the workshop

The workshop walks you through the all the steps required to install and use Otomi on Kubernetes (AKS in this case).

## For who is the workshop?

- Developers
- Solutions Architects
- DevOps Engineers
- SREs
- Infrastructure & Cloud Engineers

## 🎊 Learning objectives

The main objective is to get a good understanding/overview of Otomi and be able to identify the benefits and possible use cases for it.

## 🛠 Lab prerequisites

- Azure account and Azure cloud shell access

In case of not using Azure Cloud shell, install

- [helm](https://helm.sh/docs/intro/install/)
- [az cli](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- Optionally: [K9s](https://kubernetes.io/docs/tasks/tools/)

## 🚀 Labs

The workshop is organized into 6 labs:

- Lab 1: [Create an AKS cluster](1_create_aks_cluster/README.md)
- Lab 2: [Installing Otomi on AKS](2_install_otomi/README.md)
- Lab 3: [Creating Teams in Otomi](3_create_team/README.md)
- Lab 4: [Configuring network policies in Otomi](4_netpols/README.md)
- Lab 5: [Activate apps in Otomi](5_activate_apps/README.md)
- Lab 6: [Using Knative in Otomi](6_knative/README.md)

After completing the labs, you'll be able to:

- Install Otomi on AKS
- Use the Teams feature in Otomi for multi-tenancy and network isolation
- Use te Otomi web UI to expose K8s services and configure network policies between workloads
- Explain the difference between Otomi core apps and how to activate optional apps
- Create Knative workloads using the Otomi web UI

## 📖 Documentation & support

Official Otomi documentation is available [here](https://otomi.io). We'd also like to invite you to [join our Slack community](https://otomi.slack.com/join/shared_invite/zt-12h11e8aa-6po4NWhhpMXxT~nffDsYqA#/shared-invite/email) for additional support, feature discussions, or just for a quick chat.

The Otomi open source project can be found [here](https://github.com/redkubes/otomi-core) on GitHub. Don't forget to ⭐️ ⭐️ ⭐️. 

Thank you!
