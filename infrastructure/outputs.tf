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

output "key_vault_name" {
  description = "Name of the Key Vault holding backend deployment secrets."
  value       = azurerm_key_vault.backend.name
}

output "backend_container_app_name" {
  description = "Name of the backend Container App."
  value       = azurerm_container_app.backend.name
}

output "postgresql_fqdn" {
  description = "Fully qualified domain name of the backend PostgreSQL server."
  value       = azurerm_postgresql_flexible_server.backend.fqdn
}

output "postgresql_administrator_login" {
  description = "Administrator login for the backend PostgreSQL server."
  value       = var.postgresql_administrator_login
}

output "postgresql_database_name" {
  description = "Name of the backend PostgreSQL database."
  value       = azurerm_postgresql_flexible_server_database.backend.name
}

output "database_migration_job_name" {
  description = "Name of the manual job that applies pending Prisma migrations."
  value       = azurerm_container_app_job.database_migration.name
}