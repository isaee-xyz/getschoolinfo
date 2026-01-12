#!/bin/bash

# deploy.sh
# Usage: ./scripts/deploy.sh <DROPLET_IP>

TARGET_IP=$1
USER="root"
PROJECT_DIR="getschoolinfo"
REPO_URL="https://github.com/isaee-xyz/getschoolinfo.git"

if [ -z "$TARGET_IP" ]; then
  echo "Usage: $0 <DROPLET_IP>"
  exit 1
fi

echo "🚀 Deploying to $TARGET_IP..."

# Copy Data File if present locally
if [ -f "All District Data.json" ]; then
    echo "Transferring data file..."
    scp "All District Data.json" "$USER@$TARGET_IP:/root/"
fi

# Create remote env file content
# NOTE: In a real scenario, you'd use a secure vault or pass this securely. 
# For now, we generate a basic one or ask user to edit it.
read -p "Enter Database Password for Production: " DB_PASSWORD

ssh -o StrictHostKeyChecking=no "$USER@$TARGET_IP" << EOF
  set -e

  # Clone or Pull
  if [ -d "$PROJECT_DIR" ]; then
      cd $PROJECT_DIR
      git pull origin main
  else
      git clone $REPO_URL
      cd $PROJECT_DIR
  fi

  # Create .env
  cat > .env << ENV
PORT=4000
DB_HOST=postgres
DB_USER=postgres
DB_PASSWORD=$DB_PASSWORD
DB_NAME=schooldb
ENV

  # Build & Deploy
  docker compose -f docker-compose.prod.yml up -d --build

  # Wait for DB
  echo "Waiting for Database to initialize..."
  sleep 10

  # Copy Data file to backend container
  if [ -f "/root/All District Data.json" ]; then
      docker cp "/root/All District Data.json" school-portal-backend-prod:/All_District_Data.json
      
      echo "Seeding Database..."
      docker exec school-portal-backend-prod npx ts-node seed.ts /All_District_Data.json
  else
      echo "⚠️ Data file not found on server. Skipping seed."
  fi

  echo "✅ Deployment Complete!"
EOF
