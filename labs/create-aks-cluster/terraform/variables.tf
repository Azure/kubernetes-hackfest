variable "appid" {}
variable "clientsecret" {}
variable "rgname" {}
variable "unique_suffix" {}
variable "clustername" {}
variable "dnsname" {}
variable "acrname" {}


variable "location" {
  description = "location of cluster"
  default     = "eastus"
}

variable "RGNAME" {
  description = "Resource Group Name"
  default     = "kubernetes-hackfest"
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
