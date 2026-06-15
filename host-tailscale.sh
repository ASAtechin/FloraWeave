#!/bin/bash

# Configuration
PORT=3000
USE_FUNNEL=true

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --funnel) USE_FUNNEL=true ;;
        --no-funnel|--private) USE_FUNNEL=false ;;
        --port) PORT="$2"; shift ;;
        --help)
            echo "Usage: ./host-tailscale.sh [OPTIONS]"
            echo "Options:"
            echo "  --no-funnel, --private  Expose the application privately (only to Tailnet devices)"
            echo "  --port <num>            Set the local port to run the app on (default: 3000)"
            echo "  --help                  Show this help message"
            exit 0
            ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

echo "======================================================"
echo "    Chochete Tailscale Hosting Script"
echo "======================================================"

echo "📦 Installing dependencies..."
npm install
npx prisma generate

# Check database status
echo "🔍 Checking database connectivity..."
if ! node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.product.findFirst()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Connection error details:', err.message || err);
    process.exit(1);
  });
"; then
    echo "❌ Database connectivity check failed."
    echo "Please ensure that:"
    echo "  1. Your DATABASE_URL in .env has the correct password (currently it has <db_password>)."
    echo "  2. Your IP address is whitelisted in your MongoDB Atlas dashboard (Network Access)."
    exit 1
fi
echo "✅ Database is online and accepting connections."

echo "🧹 Checking if port $PORT is already in use..."
fuser -k $PORT/tcp 2>/dev/null || true

echo "🚀 Starting Next.js development server on port $PORT in the background..."
npm run dev -- -p $PORT &
NEXT_PID=$!

# Wait for Next.js to initialize
echo "⏳ Waiting 5 seconds for the server to spin up..."
sleep 5

echo "🔗 Configuring Tailscale..."

if [ "$USE_FUNNEL" = true ]; then
    echo "🌍 Enabling Tailscale Funnel (Public Internet Exposure)..."
    # To use Funnel, you must have it enabled in your Tailnet Admin Console
    sudo tailscale funnel --bg $PORT
    echo "✅ App is now exposed PUBLICLY."
else
    echo "🔒 Enabling Tailscale Serve (Private Tailnet Exposure)..."
    sudo tailscale serve --bg $PORT
    echo "✅ App is now exposed ONLY to your Tailnet devices."
fi

echo "======================================================"
echo "🌐 Your active Tailscale endpoints:"
tailscale serve status
echo "======================================================"
echo "⚠️ Press Ctrl+C to stop the server and disconnect."

# Handle graceful shutdown
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    
    echo "Killing Next.js server (PID: $NEXT_PID)..."
    kill $NEXT_PID 2>/dev/null
    
    echo "Turning off Tailscale routing..."
    if [ "$USE_FUNNEL" = true ]; then
        sudo tailscale funnel --bg off
    else
        sudo tailscale serve --bg off
    fi
    
    echo "✅ Shutdown complete."
    exit 0
}

# Trap termination signals
trap cleanup SIGINT SIGTERM

# Keep the script alive while the Node process runs
wait $NEXT_PID
