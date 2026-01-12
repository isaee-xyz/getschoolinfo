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
    scp -i ~/.ssh/id_ed25519_howtohelp "All District Data.json" "$USER@$TARGET_IP:/root/"
fi

# Check for DB_PASSWORD env var or arg
if [ -z "$DB_PASSWORD" ]; then
    if [ ! -z "$2" ]; then
        DB_PASSWORD="$2"
    else
        echo "Auto-generating database password..."
        DB_PASSWORD=$(openssl rand -base64 16)
    fi
fi

ssh -i ~/.ssh/id_ed25519_howtohelp -o StrictHostKeyChecking=no "$USER@$TARGET_IP" << EOF
  set -e
  # Clone or Pull
  if [ -d "$PROJECT_DIR" ]; then
      cd $PROJECT_DIR
      git pull origin main
  else
      git clone $REPO_URL
      cd $PROJECT_DIR
  fi
EOF

# Copy Secrets
if [ -f "backend/service-account.json" ]; then
    echo "Transferring service account..."
    scp -i ~/.ssh/id_ed25519_howtohelp "backend/service-account.json" "$USER@$TARGET_IP:/root/$PROJECT_DIR/backend/"
fi

ssh -i ~/.ssh/id_ed25519_howtohelp -o StrictHostKeyChecking=no "$USER@$TARGET_IP" << EOF
  cd $PROJECT_DIR


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
