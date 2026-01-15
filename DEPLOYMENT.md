# Deployment Guide

This repository uses a **Universal GitHub Actions Workflow** to automate deployments to Production and Staging environments.

## How it Works

The workflow `.github/workflows/deploy.yml` is triggered by pushes to specific branches:

*   **`main` Branch** -> Deploys to **Production**.
*   **`staging` Branch** -> Deploys to **Staging**.

It builds the Docker images, pushes them to GitHub Container Registry (GHCR), and then SSHs into the server to pull and restart the application.

## Setup Requirements

To deploy this project (or any project using this workflow), you must set the following **GitHub Secrets** in the repository settings (`Settings` -> `Secrets and variables` -> `Actions`).

### Production Secrets
Used when pushing to `main`.

| Secret Name | Description | Example |
| :--- | :--- | :--- |
| `PROD_HOST` | The IP address of the Production Server. | `64.227.169.147` |
| `PROD_SSH_KEY` | Private SSH Key for root access. | `-----BEGIN OPENSSH PRIVATE KEY...` |
| `PROD_ENV` | Full content of the `.env` file for Production. | `PORT=4000\nDB_HOST=postgres...` |

### Staging Secrets
Used when pushing to `staging`.

| Secret Name | Description | Example |
| :--- | :--- | :--- |
| `STAGING_HOST` | The IP address of the Staging Server. | `192.168.1.50` |
| `STAGING_SSH_KEY` | Private SSH Key for root access. | `-----BEGIN OPENSSH PRIVATE KEY...` |
| `STAGING_ENV` | Full content of the `.env` file for Staging. | `IS_STAGING=true...` |

## Deployment Steps

1.  **Configure Secrets**: Ensure the secrets above are set in the GitHub Repository.
2.  **Push Code**: 
    *   `git checkout main && git push origin main` triggers a Production deploy.
    *   `git checkout staging && git push origin staging` triggers a Staging deploy.
3.  **Monitor**: Go to the "Actions" tab in GitHub to see the deployment progress.
