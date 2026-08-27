resource "azurerm_container_app_environment" "backend" {
  name                       = "${var.project_name}-${var.environment}-aca-env"
  location                   = var.location
  resource_group_name        = module.application_resource_group.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.backend.id

  tags = local.common_tags
}