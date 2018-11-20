variable "RGNAME" {}
variable "APPID" {}
variable "CLIENTSECRET" {}
variable "UNIQUE_SUFFIX" {}
variable "CLUSTERNAME" {}
variable "DNSNAME" {}

variable "location" {
  description = "location of cluster"
  default     = "eastus"
}

variable "appid" {
  description = "name of cluster"
  default     = "akstf01"
}

variable "dns_prefix" {
  description = "dns prefix of cluster"
  default     = "aks-tf-cluster"
}

variable "kubernetes_version" {
  description = "Kubernetes Version"
  default     = "1.11.3"
}

variable "node_count" {
  description = "Number of worker nodes in cluster"
  default     = "3"
}

variable "vm_size" {
  description = "Size Of worker Node VM"
  default     = "Standard_DS2_v2"
}
