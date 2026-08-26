terraform {
  required_version = ">= 1.9.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }

  backend "azurerm" {}
}

provider "azurerm" {
  features {}
}

locals {
  resource_group_name = "${var.project_name}-${var.environment}-rg"
  common_tags = {
    environment = var.environment
    managed_by  = "terraform"
    project     = var.project_name
  }
}

module "application_resource_group" {
  source = "./modules/resource-group"

  name     = local.resource_group_name
  location = var.location
  tags     = local.common_tags
}