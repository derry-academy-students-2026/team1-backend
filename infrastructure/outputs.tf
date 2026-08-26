output "resource_group_name" {
  description = "Name of the application resource group."
  value       = module.application_resource_group.name
}

output "resource_group_id" {
  description = "Azure resource ID of the application resource group."
  value       = module.application_resource_group.id
}

output "location" {
  description = "Azure region of the application resource group."
  value       = var.location
}