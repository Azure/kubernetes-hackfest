resource "azurerm_resource_group" "rg" {
  name     = "${var.RGNAME}"
  location = "${var.location}"
}

resource "azurerm_kubernetes_cluster" "cluster" {
  name                = "${TF_VAR_CLUSTERNAME}"
  resource_group_name = "${var.RGNAME}"
  location            = "${var.location}"
  dns_prefix          = "${TF_VAR_DNSNAME}"
  kubernetes_version  = "${var.kubernetes_version}"

  agent_pool_profile {
    name            = "default"
    count           = "${var.node_count}"
    vm_size         = "${var.vm_size}"
    os_type         = "Linux"
    os_disk_size_gb = 30
  }

  service_principal {
    client_id     = "${TF_VAR_APPID}"
    client_secret = "${TF_VAR_CLIENTSECRET}"
  }
}

resource "azurerm_container_registry" "registry" {
  name                = "${TF_VAR_ACRNAME}"
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
  value = "${azurerm_container_registry.registry.id}"
}

output "login_server" {
  value = "${azurerm_container_registry.registry.login_server}"
}

output "admin_username" {
  value = "${azurerm_container_registry.registry.admin_password}"
}

output "admin_password" {
  value = "${azurerm_container_registry.registry.admin_password}"
}

