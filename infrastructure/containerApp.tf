resource "azurerm_container_app" "backend" {
  name                         = "${var.project_name}-${var.environment}-app"
  container_app_environment_id = azurerm_container_app_environment.backend.id
  resource_group_name          = module.application_resource_group.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.backend.id]
  }

  registry {
    server   = data.azurerm_container_registry.backend.login_server
    identity = azurerm_user_assigned_identity.backend.id
  }

  template {
    min_replicas = 1
    max_replicas = 1

    container {
      name   = "backend"
      image  = "${data.azurerm_container_registry.backend.login_server}/team1-backend:${var.backend_image_tag}"
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "PORT"
        value = "4000"
      }

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url-ref"
      }

      env {
        name        = "JWT_SECRET"
        secret_name = "jwt-secret-ref"
      }

      env {
        name  = "FEATURE_JOB_ROLES_ENABLED"
        value = tostring(var.feature_job_roles_enabled)
      }
    }
  }

  ingress {
    external_enabled = false
    target_port      = 4000
    transport        = "auto"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  secret {
    name                = "database-url-ref"
    key_vault_secret_id = "${azurerm_key_vault.backend.vault_uri}secrets/DatabaseUrlString"
    identity            = azurerm_user_assigned_identity.backend.id
  }

  secret {
    name                = "jwt-secret-ref"
    key_vault_secret_id = "${azurerm_key_vault.backend.vault_uri}secrets/JwtSecret"
    identity            = azurerm_user_assigned_identity.backend.id
  }

  tags = local.common_tags

  depends_on = [
    azurerm_role_assignment.backend_acr_pull,
    azurerm_role_assignment.backend_key_vault_secrets,
  ]
}

resource "azurerm_container_app_job" "database_migration" {
  name                         = "${var.project_name}-${var.environment}-database-migration"
  container_app_environment_id = azurerm_container_app_environment.backend.id
  location                     = var.location
  resource_group_name          = module.application_resource_group.name
  replica_timeout_in_seconds   = 600
  replica_retry_limit          = 0

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.backend.id]
  }

  registry {
    server   = data.azurerm_container_registry.backend.login_server
    identity = azurerm_user_assigned_identity.backend.id
  }

  manual_trigger_config {
    parallelism              = 1
    replica_completion_count = 1
  }

  template {
    container {
      name    = "database-migration"
      image   = "${data.azurerm_container_registry.backend.login_server}/team1-backend-migration:${var.backend_image_tag}"
      cpu     = 0.25
      memory  = "0.5Gi"
      command = ["npm", "run", "db:migrate"]

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url-ref"
      }
    }
  }

  secret {
    name                = "database-url-ref"
    key_vault_secret_id = "${azurerm_key_vault.backend.vault_uri}secrets/DatabaseUrlString"
    identity            = azurerm_user_assigned_identity.backend.id
  }

  tags = local.common_tags

  depends_on = [
    azurerm_postgresql_flexible_server_firewall_rule.allow_azure_services,
    azurerm_role_assignment.backend_acr_pull,
    azurerm_role_assignment.backend_key_vault_secrets,
  ]
}