#!/bin/bash
set -e

echo "Building Swift CLI..."

# Change to peepit-cli directory
cd "$(dirname "$0")/../peepit-cli"

# Build the Swift CLI in release mode
swift build --configuration release

# Copy the binary to the root directory
cp .build/release/peepit ../peepit

# Make it executable
chmod +x ../peepit

echo "Swift CLI built successfully and copied to ./peepit"