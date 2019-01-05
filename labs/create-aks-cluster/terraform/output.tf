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