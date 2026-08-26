
data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "backend" {
  name                = var.key_vault_name
  location            = var.location
  resource_group_name = module.application_resource_group.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  rbac_authorization_enabled = true
  soft_delete_retention_days = 7
  purge_protection_enabled   = false

  tags = local.common_tags
}

