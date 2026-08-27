variable "project_name" {
  type        = string
  description = "Short project name used in Azure resource names."
  default     = "team1-backend"
}

variable "environment" {
  type        = string
  description = "Deployment environment used in resource naming and tags."
  default     = "dev"

  validation {
    condition     = contains(["dev", "test", "prod"], var.environment)
    error_message = "Environment must be dev, test, or prod."
  }
}

variable "location" {
  type        = string
  description = "Azure region in which application infrastructure is created."
  default     = "uksouth"
}

variable "key_vault_name" {
  type        = string
  description = "Globally unique name for the backend Key Vault."
  default     = "team1-backend-dev-kv"

  validation {
    condition     = can(regex("^[0-9a-z-]{3,24}$", var.key_vault_name))
    error_message = "Key Vault names must be 3-24 characters of lowercase letters, digits, and hyphens."
  }
}

variable "backend_image_tag" {
  type        = string
  description = "Tag of the backend image to deploy from Azure Container Registry."
  default     = "latest"
}

variable "feature_job_roles_enabled" {
  type        = bool
  description = "Whether the job roles feature is enabled in the backend deployment."
  default     = true
}