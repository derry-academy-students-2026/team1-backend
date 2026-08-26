# Backend Infrastructure and Delivery Setup

This repository now contains the work required by the four platform tasks:

- `Dockerfile` builds the Express API image.
- `infrastructure/bootstrap` creates the Terraform remote-state storage once.
- `infrastructure/modules/resource-group` is the reusable resource-group module.
- `infrastructure` creates the `dev` application resource group using that module.
- `.github/workflows/ci.yml` tests, builds, plans, pushes the image, and applies infrastructure.

## 1. Install and verify local tools

Install Terraform and the Azure CLI, then authenticate:

```sh
brew install hashicorp/tap/terraform azure-cli
terraform version
az login
az account show
```

Select the intended subscription when necessary:

```sh
az account set --subscription "<subscription-id-or-name>"
```

## 2. Build and test the container locally

The image needs `DATABASE_URL` when it starts, but not when it builds.

```sh
docker build --tag team1-backend:local .
docker run --rm --env DATABASE_URL="postgresql://postgres:password@host.docker.internal:4432/jobRole" --publish 4000:4000 team1-backend:local
```

Visit `http://localhost:4000/health` in a separate terminal or browser. On Linux, replace `host.docker.internal` with a reachable database host or add the appropriate host gateway.

On a Kainos-managed macOS device, first export the corporate proxy certificate from the System keychain:

```sh
npm run certs:export
```

This writes `certs/KAINOS-ZSCALER G2_2026.pem`, which Docker trusts for npm and Prisma HTTPS access through the Kainos Zscaler proxy. The certificate is ignored by Git; re-export it when the corporate certificate is renewed.

If `prisma generate` still reports `unable to get local issuer certificate`, export the relevant organization root CA from Keychain Access as a PEM file and provide it only for the build:

```sh
docker build --secret id=prisma_ca,src=/absolute/path/to/organization-root-ca.pem --tag team1-backend:local .
```

The certificate is a BuildKit secret: it is not copied into the image or committed to the repository. Do not disable TLS verification to work around this error.

## 3. Bootstrap the remote Terraform state

Terraform cannot store its state in a storage account that it has not yet created, so the `bootstrap` configuration has a short-lived local state. Choose a globally unique lowercase storage account name, then run:

```sh
cd infrastructure/bootstrap
terraform init
terraform fmt
terraform validate
terraform apply -var='storage_account_name=<globally-unique-name>'
terraform output
```

Record the three outputs. Do not commit the local `terraform.tfstate` created in this directory. The repository ignores it.

## 4. Give yourself and GitHub state access

The Azure identity running Terraform needs `Storage Blob Data Contributor` on the state storage account for locking and state reads/writes. The GitHub identity also needs `Contributor` on the subscription or on the resource groups it will manage.

For local use, assign the data-plane role to your signed-in user:

```sh
STATE_ACCOUNT_ID=$(az storage account show --resource-group team1-terraform-state-rg --name <state-storage-account> --query id --output tsv)
az role assignment create --assignee "$(az ad signed-in-user show --query id --output tsv)" --role "Storage Blob Data Contributor" --scope "$STATE_ACCOUNT_ID"
```

## 5. Migrate the application state to Azure Storage

Run this from the repository root, substituting the bootstrap outputs. The backend uses Microsoft Entra ID and enables Azure Blob leases for state locking.

```sh
terraform -chdir=infrastructure init -migrate-state -input=false \
  -backend-config="resource_group_name=team1-terraform-state-rg" \
  -backend-config="storage_account_name=<state-storage-account>" \
  -backend-config="container_name=tfstate" \
  -backend-config="key=team1-backend-dev.tfstate" \
  -backend-config="use_azuread_auth=true"
terraform -chdir=infrastructure fmt -recursive
terraform -chdir=infrastructure validate
terraform -chdir=infrastructure plan
terraform -chdir=infrastructure apply
terraform -chdir=infrastructure output
```

The first run creates `team1-backend-dev-rg` in `uksouth`. To verify the remote state, run `terraform -chdir=infrastructure state list` and inspect the `tfstate` container in Azure Portal. Start a second `terraform plan` while an `apply` is running to observe blob lease locking.

## 6. Create Azure Container Registry

Choose a globally unique lowercase name, then create the registry:

```sh
az acr create --resource-group team1-backend-dev-rg --name <acr-name> --sku Basic
az acr show --name <acr-name> --query loginServer --output tsv
```

The ACR is deliberately created manually for this exercise; the current Terraform task provisions only the resource group. Add ACR to `infrastructure` in the next iteration to make it fully managed.

## 7. Configure GitHub Actions with OpenID Connect

In Azure, create an Entra application/service principal, then add a federated credential for the GitHub repository and `main` branch. The GitHub Actions `azure/login` documentation has the exact portal and CLI flow. Do not use an ACR password or a long-lived Azure client secret.

Grant the service principal:

- `Contributor` over the subscription, or restrict it to the state and application resource groups.
- `Storage Blob Data Contributor` over the state storage account.
- `AcrPush` over the ACR resource.

In GitHub repository **Settings > Secrets and variables > Actions**, add these secrets:

| Secret | Value |
| --- | --- |
| `AZURE_CLIENT_ID` | Entra application/client ID |
| `AZURE_TENANT_ID` | Entra tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |

Add these repository variables:

| Variable | Value |
| --- | --- |
| `ACR_NAME` | Registry resource name, such as `team1backendacr` |
| `ACR_LOGIN_SERVER` | Registry login server, such as `team1backendacr.azurecr.io` |
| `TF_STATE_RESOURCE_GROUP` | State resource-group name |
| `TF_STATE_STORAGE_ACCOUNT` | State storage-account name |
| `TF_STATE_CONTAINER` | `tfstate` |

## 8. Exercise the pipeline

Open a pull request. It runs linting, tests, a Docker build, and Terraform plan but does not push an image or change Azure resources. Merging to `main` then pushes `team1-backend:<commit-sha>` and `team1-backend:latest` to ACR, followed by Terraform apply.

Protect `main` in GitHub and require the `test`, `build-container`, and `terraform-plan` checks before merge. For production later, create a second state key and GitHub Environment with required reviewers, then pass `environment=prod` only from that protected deployment job.