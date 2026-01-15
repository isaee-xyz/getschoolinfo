#!/bin/bash

# Configuration
SERVER="root@64.227.169.147"
LOCAL_FILE="Schools get.json"
REMOTE_PATH="/root/getschoolinfo/backend/schools_temp.json"
CONTAINER_NAME="school-portal-backend-prod"
CONTAINER_PATH="/app/schools_temp.json"

echo "🚀 Starting Transient Seeding Process..."

# 1. Check if local file exists
if [ ! -f "$LOCAL_FILE" ]; then
    echo "❌ Error: '$LOCAL_FILE' not found in current directory."
    exit 1
fi

# 2. Upload File (SCP)
echo "📦 Uploading 270MB data file to Production Server (This is temporary)..."
scp "$LOCAL_FILE" "$SERVER:$REMOTE_PATH"
if [ $? -ne 0 ]; then
    echo "❌ Upload failed. Check your SSH connection."
    exit 1
fi

# 3. Copy into Container & Execute
echo "🌱 Injecting data into running container and seeding DB..."
ssh "$SERVER" "
    # Move file into container
    docker cp '$REMOTE_PATH' '$CONTAINER_NAME:$CONTAINER_PATH'
    
    # Run Seeding
    echo '...Running seed script (this may take a minute)...'
    docker exec '$CONTAINER_NAME' node dist/seed.js schools_temp.json
    
    # Cleanup Container File
    docker exec '$CONTAINER_NAME' rm '$CONTAINER_PATH'
    echo '✅ Container cleaned.'
    
    # Cleanup Host File
    rm '$REMOTE_PATH'
    echo '✅ Host server cleaned.'
"

echo "🎉 DONE! Database updated and all temporary files deleted."
