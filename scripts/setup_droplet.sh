#!/bin/bash

# setup_droplet.sh
# Usage: ./scripts/setup_droplet.sh <DROPLET_IP>

TARGET_IP=$1
USER="root"

if [ -z "$TARGET_IP" ]; then
  echo "Usage: $0 <DROPLET_IP>"
  exit 1
fi

echo "🚀 Connecting to $TARGET_IP to set up Docker and Nginx..."

ssh -i ~/.ssh/id_ed25519_howtohelp -o StrictHostKeyChecking=no "$USER@$TARGET_IP" << 'EOF'
  set -e

  echo "Updating system..."
  apt-get update && apt-get upgrade -y

  echo "Installing Docker..."
  if ! command -v docker &> /dev/null; then
      curl -fsSL https://get.docker.com -o get-docker.sh
      sh get-docker.sh
      rm get-docker.sh
  else
      echo "Docker already installed."
  fi

  echo "Installing Docker Compose..."
  apt-get install -y docker-compose-plugin

  echo "Installing Nginx & Certbot..."
  apt-get install -y nginx certbot python3-certbot-nginx

  echo "Configuring Nginx..."
  cat > /etc/nginx/sites-available/school-portal << 'NGINX'
server {
    listen 80;
    server_name getschoolinfo.com www.getschoolinfo.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

  ln -sf /etc/nginx/sites-available/school-portal /etc/nginx/sites-enabled/
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  systemctl restart nginx

  echo "✅ Server setup complete!"
EOF
