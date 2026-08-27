resource "azurerm_postgresql_flexible_server" "backend" {
  name                = var.postgresql_server_name
  location            = var.location
  resource_group_name = module.application_resource_group.name
  version             = "16"
  sku_name            = "B_Standard_B1ms"

  administrator_login    = var.postgresql_administrator_login
  administrator_password = var.postgresql_administrator_password

  storage_mb                    = 32768
  backup_retention_days         = 7
  geo_redundant_backup_enabled  = false
  public_network_access_enabled = true

  tags = local.common_tags
}

resource "azurerm_postgresql_flexible_server_database" "backend" {
  name      = var.postgresql_database_name
  server_id = azurerm_postgresql_flexible_server.backend.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

# Azure Container Apps has no stable outbound IP for this shared environment.
# This development-only rule allows the backend app to reach the demo database.
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure_services" {
  name             = "allow-azure-services"
  server_id        = azurerm_postgresql_flexible_server.backend.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}