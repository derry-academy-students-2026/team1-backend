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