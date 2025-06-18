#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');
require('dotenv').config();

// Configuration
const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';
const REGION = process.env.AWS_REGION || 'us-east-1';
const STACK_NAME = process.env.STACK_NAME || 'doc-tales';
const PROJECT_ROOT = path.resolve(__dirname, '..');
const FRONTEND_BUILD_DIR = path.join(PROJECT_ROOT, 'packages/frontend/build');

// AWS SDK setup
AWS.config.update({ region: REGION });
const cloudformation = new AWS.CloudFormation();

async function deploy() {
  try {
    console.log(`Deploying frontend to ${ENVIRONMENT} environment in ${REGION}...`);
    
    // Get CloudFormation outputs
    console.log('Getting CloudFormation outputs...');
    const { Stacks } = await cloudformation.describeStacks({ StackName: STACK_NAME }).promise();
    const outputs = Stacks[0].Outputs;
    
    const frontendBucket = outputs.find(o => o.OutputKey === 'FrontendBucketName').OutputValue;
    const apiEndpoint = outputs.find(o => o.OutputKey === 'ApiEndpoint').OutputValue;
    const websiteUrl = outputs.find(o => o.OutputKey === 'FrontendWebsiteURL').OutputValue;
    
    if (!frontendBucket || !apiEndpoint) {
      throw new Error('Could not retrieve required CloudFormation outputs');
    }
    
    console.log(`Frontend bucket: ${frontendBucket}`);
    console.log(`API endpoint: ${apiEndpoint}`);
    
    // Create .env file for React app
    const envFilePath = path.join(PROJECT_ROOT, 'packages/frontend/.env');
    fs.writeFileSync(envFilePath, `REACT_APP_API_ENDPOINT=${apiEndpoint}\n`);
    console.log('Created .env file with API endpoint');
    
    // Build the React app
    console.log('Building React app...');
    execSync('npm run build:frontend', { stdio: 'inherit', cwd: PROJECT_ROOT });
    
    // Upload to S3
    console.log(`Uploading build to S3 bucket: ${frontendBucket}`);
    execSync(`aws s3 sync ${FRONTEND_BUILD_DIR} s3://${frontendBucket} --delete --region ${REGION}`, 
      { stdio: 'inherit', cwd: PROJECT_ROOT });
    
    console.log('Deployment complete!');
    console.log(`Frontend website URL: ${websiteUrl}`);
    
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

deploy();
