# Calico cloud workshop on AKS

<img src="modules/img/calico-on-aks.png" alt="Calicocloud on AKS" width="30%"/>

## AKS Calico Cloud Workshop

The intent of this lab is to introduce Calico OSS and [Calico Cloud](https://www.calicocloud.io/?utm_campaign=calicocloud&utm_medium=digital&utm_source=microsoft) to manage AKS clusters and leverage Calico features to implement the various use cases. While there are many capabilities that the Calico product provides, this lab focuses on a subset of those that are used most often by enterprises to derive value from the Calico Product. 


## Learning Objectives

In this lab we are going to focus on these main use cases (with links to Calico docs for further info). Note that features for policy and visibility as outlined in this lab are identical between Calico Cloud and Calico Enterprise. Consult the [Calico Enterprise docs](https://docs.tigera.io/) for further reading:

- **Integration:** [Integrating Calico Cloud into the AKS clusters.](https://docs.calicocloud.io/install/system-requirements)
- **Essential Network policy:** [Introducing essential Calico OSS (i.e.open source) network policies.](https://docs.projectcalico.org/security/tutorials/calico-policy)
- **East-West security:** [leveraging zero-trust security approach.](https://docs.tigera.io/security/adopt-zero-trust)
- **Egress access controls:** [using DNS policy to access external resources by their fully qualified domain names (FQDN).](https://docs.calicocloud.io/use-cases/security-controls/global-egress)
- **Observability:** [exploring various logs and application level metrics collected by Calico.](https://docs.calicocloud.io/use-cases/troubleshoot-apps)
- **Compliance:** [providing proof of security compliance.](https://docs.tigera.io/compliance/)

## Join the Slack Channel

[Calico User Group Slack](https://slack.projectcalico.org/) is a great resource to ask any questions about Calico. If you are not a part of this Slack group yet, we highly recommend [joining it](https://slack.projectcalico.org/) to participate in discussions or ask questions. For example, you can ask questions specific to AKS and other managed Kubernetes services in the `#eks-aks-gke-iks` channel.

## Who should take this workshop?
- Developers
- DevOps Engineers
- Solutions Architects
- Anyone that is interested in Security, Observability and Network policy for Kubernetes.


## Lab prerequisites

>It is recommended to follow the AKS creation step outlined in [Module 0](modules/calicocloud/creating-aks-cluster.md) and to keep the resources isolated from any existing deployments. If you are using a corporate Azure account for the workshop, make sure to check with account administrator to provide you with sufficient permissions to create and manage AKS clusters and Load Balancer resources.

- [Azure Kubernetes Service](https://docs.microsoft.com/en-us/azure/aks/intro-kubernetes)
- [Calico Cloud trial account for Chapter two](https://www.calicocloud.io/?utm_campaign=calicocloud&utm_medium=digital&utm_source=microsoft)
- Terminal or Command Line console to work with Azure resources and AKS cluster
 
- `Git`
- `netcat`

## Workshop modules

Chapter one: Calico OSS

- [Module 0: Creating an AKS cluster with Calico network policy](modules/calicooss/creating-aks-calico-policy.md)
- [Module 1: Configuring demo applications](modules/calicooss/configuring-demo-apps.md)
- [Module 2: Using global network policies for security controls](modules/calicooss/using-security-controls.md)
- [Module 3: Adding windows node in your AKS and isolate pods traffic](modules/calicooss/calico-for-windows.md)
- [Module 4: Enabling wireguard to secure on-the-wire for your AKS cluster](modules/calicooss/wireguard-encryption.md)
- [Module 5: Change dataplane from standard to eBPF for your AKS cluster](modules/calicooss/ebpf-dataplane.md)


Chapter two: Calico Cloud Trial 

- [Module 0: Creating an AKS compatible cluster for Calico Cloud](modules/calicocloud/creating-aks-cluster.md)
- [Module 1: Joining AKS cluster to Calico Cloud](modules/calicocloud/joining-aks-to-calico-cloud.md)
- [Module 2: Configuring demo applications](modules/calicocloud/configuring-demo-apps.md)
- [Module 3: Using Calico UI for observability](modules/calicocloud/using-observability-tools.md)
- [Module 4: Using DNS policy for egress controls](modules/calicocloud/using-dns-controls.md)
- [Module 5: Using alerts](modules/calicocloud/using-alerts.md)
- [Module 6: Packet Capture](modules/calicocloud/packet-capture.md)
- [Module 7: Anomaly Detection](modules/calicocloud/anomaly-detection.md)
- [Module 8: Using compliance reports](modules/calicocloud/using-compliance-reports.md)
- [Module 9: Eabling L7 visibility](modules/calicocloud/enable-l7-visibility.md)
- [Module 10: Host Endpoints](modules/calicocloud/host-end-point.md)





