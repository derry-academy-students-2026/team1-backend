resource "azurerm_log_analytics_workspace" "backend" {
  name                = "${var.project_name}-${var.environment}-logs"
  location            = var.location
  resource_group_name = module.application_resource_group.name
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = local.common_tags
}