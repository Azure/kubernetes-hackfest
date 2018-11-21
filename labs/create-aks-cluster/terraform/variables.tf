variable "TF_VAR_APPID" {}
variable "CLIENTSECRET" {}
variable "UNIQUE_SUFFIX" {}
variable "CLUSTERNAME" {}
variable "DNSNAME" {}
variable "ACRNAME" {}


variable "location" {
  description = "location of cluster"
  default     = "eastus"
}

variable "RGNAME" {
  description = "Resource Group Name"
  default     = "kubernetes-hackfest"
}
variable "appid" {
  description = "name of cluster"
  default     = "akstf01"
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
