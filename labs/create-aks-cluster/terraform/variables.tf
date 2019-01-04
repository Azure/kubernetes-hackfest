variable "APPID" {
  type = "string" 
}
variable "CLIENTSECRET" {
  type = "string"
}
variable "UNIQUE_SUFFIX" {
  type = "string"
}
variable "CLUSTERNAME" {
  type = "string"
}
variable "DNSNAME" {
  type = "string"
}
variable "ACRNAME" {
  type = "string"
}
<<<<<<< HEAD
=======

>>>>>>> b2854977e42902a5afc62cfcb253a9bae60de5de

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
  default     = "1.11.5"
}

variable "node_count" {
  description = "Number of worker nodes in cluster"
  default     = "3"
}

variable "vm_size" {
  description = "Size Of worker Node VM"
  default     = "Standard_DS2_v2"
}
