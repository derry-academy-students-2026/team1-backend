output "resource_group_name" {
  description = "Resource group containing the Terraform state storage account."
  value       = azurerm_resource_group.terraform_state.name
}

output "storage_account_name" {
  description = "Storage account used by the Terraform remote backend."
  value       = azurerm_storage_account.terraform_state.name
}

output "container_name" {
  description = "Blob container used by the Terraform remote backend."
  value       = azurerm_storage_container.terraform_state.name
}