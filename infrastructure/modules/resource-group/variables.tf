variable "name" {
  type        = string
  description = "Name of the Azure resource group."
}

variable "location" {
  type        = string
  description = "Azure region in which to create the resource group."
}

variable "tags" {
  type        = map(string)
  description = "Tags applied to the resource group."
  default     = {}
}