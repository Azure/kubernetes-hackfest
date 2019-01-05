resource "azurerm_resource_group" "rg" {
  name     = "${var.RGNAME}"
  location = "${var.location}"
}

resource "azurerm_log_analytics_workspace" "test" {
  name                = "${var.UNIQUE_SUFFIX}-k8"
  location            = "${azurerm_resource_group.rg.location}"
  resource_group_name = "${azurerm_resource_group.rg.name}"
  sku                 = "PerGB2018"
}

resource "azurerm_log_analytics_solution" "test" {
  solution_name         = "ContainerInsights"
  location              = "${azurerm_resource_group.rg.location}"
  resource_group_name   = "${azurerm_resource_group.rg.name}"
  workspace_resource_id = "${azurerm_log_analytics_workspace.test.id}"
  workspace_name        = "${azurerm_log_analytics_workspace.test.name}"

  plan {
    publisher = "Microsoft"
    product   = "OMSGallery/ContainerInsights"
  }
}
resource "azurerm_kubernetes_cluster" "cluster" {
  name                = "${var.CLUSTERNAME}"
  resource_group_name = "${azurerm_resource_group.rg.name}"
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
  addon_profile {
    oms_agent {
      enabled                    = true
      log_analytics_workspace_id = "${azurerm_log_analytics_workspace.test.id}"
    }
    http_application_routing {
      enabled                    = true
    }
  }
}

resource "azurerm_container_registry" "registry" {
  name                = "${var.ACRNAME}"
  resource_group_name = "${azurerm_resource_group.rg.name}"
  location            = "${var.location}"
  admin_enabled       = true
  sku                 = "basic"
}