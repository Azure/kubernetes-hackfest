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
}

resource "azurerm_container_registry" "registry" {
  name                = "${var.ACRNAME}"
  resource_group_name = "${var.RGNAME}"
  location            = "${var.location}"
  admin_enabled       = true
  sku                 = "basic"
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

output "reg_id" {
  value = "${data.azurerm_container_registry.registry.id}"
}

output "login_server" {
  value = "${data.azurerm_container_registry.registry.login_server}"
}

output "admin_username" {
  value = "${data.azurerm_container_registry.registry.admin_password}"
}

output "admin_password" {
  value = "${data.azurerm_container_registry.registry.admin_password}"
}

