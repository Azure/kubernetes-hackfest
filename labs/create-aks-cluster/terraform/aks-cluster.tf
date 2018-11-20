resource "azurerm_resource_group" "rg" {
  name     = "${var.RGNAME}"
  location = "${var.location}"
}

resource "azurerm_kubernetes_cluster" "cluster" {
  name                = "${var.CLUSTERNAME}"
  resource_group_name = "${var.RGNAME}"
  location            = "${var.location}"
  dns_prefix          = "${var.DNSNAME}"
  kubernetes_version  = "${var.kubernetes_version}"

  agent_pool_profile {
    name            = "default"
    count           = "${var.node_count}"
    vm_size         = "${var.vm_size}"
    os_type         = "Linux"
    os_disk_size_gb = 30
  }

  service_principal {
    client_id     = "${var.APPID}"
    client_secret = "${var.CLIENTSECRET}"
}

output "id" {
  value = "${azurerm_kubernetes_cluster.cluster.id}"
}

output "kube_config" {
  value = "${azurerm_kubernetes_cluster.cluster.kube_config_raw}"
}

output "client_key" {
  value = "${azurerm_kubernetes_cluster.cluster.kube_config.0.client_key}"
}

output "client_certificate" {
  value = "${azurerm_kubernetes_cluster.cluster.kube_config.0.client_certificate}"
}

output "cluster_ca_certificate" {
  value = "${azurerm_kubernetes_cluster.cluster.kube_config.0.cluster_ca_certificate}"
}

output "host" {
  value = "${azurerm_kubernetes_cluster.cluster.kube_config.0.host}"
}
