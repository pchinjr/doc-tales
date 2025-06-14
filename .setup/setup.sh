#!/bin/bash
set -e

echo "Installing dependencies..."
npm ci

echo "Setting up AWS mock environment..."
mkdir -p ~/.aws
echo "[default]" > ~/.aws/config
echo "region = us-east-1" >> ~/.aws/config
echo "[default]" > ~/.aws/credentials
echo "aws_access_key_id = test-key" >> ~/.aws/credentials
echo "aws_secret_access_key = test-secret" >> ~/.aws/credentials

echo "Setup complete."
