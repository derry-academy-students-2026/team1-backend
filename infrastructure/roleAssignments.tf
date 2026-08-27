data "azurerm_container_registry" "backend" {
  name                = "team1backendsam2026"
  resource_group_name = module.application_resource_group.name
}

resource "azurerm_role_assignment" "backend_key_vault_secrets" {
  scope                = azurerm_key_vault.backend.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_user_assigned_identity.backend.principal_id
}

resource "azurerm_role_assignment" "backend_acr_pull" {
  scope                = data.azurerm_container_registry.backend.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.backend.principal_id
}