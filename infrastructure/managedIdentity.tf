resource "azurerm_user_assigned_identity" "backend" {
  name                = "${var.project_name}-${var.environment}-identity"
  location            = var.location
  resource_group_name = module.application_resource_group.name

  tags = local.common_tags
}