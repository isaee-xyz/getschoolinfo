#!/bin/bash

# deploy_with_local_build.sh
# Usage: ./scripts/deploy_with_local_build.sh <DROPLET_IP>

TARGET_IP=$1
USER="root"
PROJECT_DIR="getschoolinfo"

if [ -z "$TARGET_IP" ]; then
  echo "Usage: $0 <DROPLET_IP>"
  exit 1
fi

echo "🚀 Starting Local Build Strategy..."
echo "This uses your computer to build the app, then sends it to the server."

# 1. Build Backend (for Linux x86_64)
echo "------------------------------------------------"
echo "📦 Building Backend (targeting linux/amd64)..."
docker buildx build --platform linux/amd64 -t getschoolinfo-backend:latest -f backend/Dockerfile.prod backend
if [ $? -ne 0 ]; then echo "❌ Backend build failed"; exit 1; fi

# 2. Build Frontend (for Linux x86_64)
echo "------------------------------------------------"
echo "📦 Building Frontend (targeting linux/amd64)..."
docker buildx build --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API_URL=https://getschoolsinfo.com/api \
  -t getschoolinfo-frontend:latest -f frontend/Dockerfile.prod frontend
if [ $? -ne 0 ]; then echo "❌ Frontend build failed"; exit 1; fi

# 3. Save and Compress Images
echo "------------------------------------------------"
echo "💾 Saving and Compressing Images..."
# We combine them into one tarball for a single transfer
docker save getschoolinfo-backend:latest getschoolinfo-frontend:latest | gzip > deployment_images.tar.gz

echo "✅ Images saved to deployment_images.tar.gz"

# 4. Transfer Images and Essentials
echo "------------------------------------------------"
echo "📤 Transferring files to $TARGET_IP..."

# Transfer Images
scp -i ~/.ssh/id_ed25519_howtohelp deployment_images.tar.gz "$USER@$TARGET_IP:/root/"

# Transfer Configs
scp -i ~/.ssh/id_ed25519_howtohelp docker-compose.prod.yml "$USER@$TARGET_IP:/root/$PROJECT_DIR/"
scp -i ~/.ssh/id_ed25519_howtohelp Caddyfile "$USER@$TARGET_IP:/root/$PROJECT_DIR/"
if [ -f "backend/service-account.json" ]; then
    scp -i ~/.ssh/id_ed25519_howtohelp "backend/service-account.json" "$USER@$TARGET_IP:/root/$PROJECT_DIR/backend/"
fi
if [ -f "All District Data.json" ]; then
     scp -i ~/.ssh/id_ed25519_howtohelp "All District Data.json" "$USER@$TARGET_IP:/root/"
fi

# 5. Remote Execution
echo "------------------------------------------------"
echo "🚀 Executing Remote Deployment..."

ssh -i ~/.ssh/id_ed25519_howtohelp -o StrictHostKeyChecking=no "$USER@$TARGET_IP" << EOF
  set -e
  cd /root

  echo "unpacking and loading images (this takes a moment)..."
  gunzip -c deployment_images.tar.gz | docker load

  cd $PROJECT_DIR

  echo "Restarting services..."
  # Use the images we just loaded. The docker-compose.prod.yml needs to reference these image names directly
  # OR we can just tag them.
  # Let's ensure env vars are set properly. assuming .env exists from previous attempts.
  
  # Update docker-compose to use these specific local images if needed, 
  # BUT docker-compose.prod.yml likely uses 'build'. 
  # We should override it or ensure it uses the 'image' property.
  
  # FORCE RECREATE using the loaded images
  # We need to tag them to match what compose expects or just force compose to use them.
  # If compose has 'build: .', it might try to build. 
  # WE WILL USE 'docker compose up' but with changes to avoid rebuild.
  
  # Strategy: Tag the loaded images to what docker compose might expect?
  # Actually, easier to just update compose file on the fly or rely on 'image' name.
  # Let's check docker-compose.prod.yml content first.
  
  docker compose -f docker-compose.prod.yml up -d --no-build

  echo "Waiting for Database..."
  sleep 10

  # Seeding
  if [ -f "/root/All District Data.json" ]; then
       docker cp "/root/All District Data.json" school-portal-backend-prod:/All_District_Data.json
       docker exec school-portal-backend-prod npx ts-node seed.ts /All_District_Data.json
  fi
  
  # Clean up huge tar file
  rm /root/deployment_images.tar.gz
EOF

echo "✅ SUCCESS! Deployment finished."
