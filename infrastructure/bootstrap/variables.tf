variable "location" {
  type        = string
  description = "Azure region for the Terraform state resources."
  default     = "uksouth"
}

variable "resource_group_name" {
  type        = string
  description = "Name of the resource group that holds Terraform state."
  default     = "team1-terraform-state-rg"
}

variable "storage_account_name" {
  type        = string
  description = "Globally unique, lowercase Azure Storage account name for Terraform state."

  validation {
    condition     = can(regex("^[a-z0-9]{3,24}$", var.storage_account_name))
    error_message = "Storage account names must be 3-24 lowercase alphanumeric characters."
  }
}

variable "container_name" {
  type        = string
  description = "Private blob container that holds Terraform state files."
  default     = "tfstate"
}