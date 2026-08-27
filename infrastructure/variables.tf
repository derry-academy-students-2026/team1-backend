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

variable "postgresql_server_name" {
  type        = string
  description = "Globally unique Azure Database for PostgreSQL Flexible Server name."
  default     = "team1backenddevpg2026"

  validation {
    condition     = can(regex("^[a-z0-9-]{3,63}$", var.postgresql_server_name))
    error_message = "PostgreSQL server names must contain 3-63 lowercase letters, numbers, or hyphens."
  }
}

variable "postgresql_database_name" {
  type        = string
  description = "Name of the PostgreSQL database used by the backend."
  default     = "jobrole"
}

variable "postgresql_administrator_login" {
  type        = string
  description = "Administrator login used to provision the demonstration PostgreSQL server."
  default     = "team1admin"
}

variable "postgresql_administrator_password" {
  type        = string
  description = "Administrator password supplied through TF_VAR_postgresql_administrator_password."
  sensitive   = true

  validation {
    condition     = length(var.postgresql_administrator_password) >= 8
    error_message = "The PostgreSQL administrator password must be at least 8 characters long."
  }
}