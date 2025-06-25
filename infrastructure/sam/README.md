# Doc-Tales SAM Infrastructure

This directory contains the AWS SAM (Serverless Application Model) templates and configuration for the Doc-Tales application infrastructure.

## 🏗️ **Architecture Overview**

The SAM template defines a complete serverless infrastructure:

### **Lambda Functions**
- **IngestionFunction**: Receives and normalizes communications from various sources
- **DimensionExtractionFunction**: Extracts dimensions and metadata from communications
- **NotificationFunction**: Sends alerts for high-priority communications  
- **ApiFunction**: Serves data to the frontend application
- **SetupS3EventsFunction**: Custom resource for S3 event configuration

### **Storage & Data**
- **DynamoDB Tables**: Single-table design for communications and user profiles
- **S3 Buckets**: Raw communications, processed documents, and frontend hosting
- **SNS Topics**: Notification delivery

### **API & Integration**
- **API Gateway**: REST endpoints for frontend communication
- **Event-driven Architecture**: S3 triggers, DynamoDB streams

## 🚀 **Quick Start**

### **Prerequisites**
- AWS CLI configured with appropriate permissions
- SAM CLI installed (v1.140.0+)
- Node.js 22.x

### **Deploy to Development**
```bash
# From project root
npm run deploy:backend:dev

# Or directly
./infrastructure/scripts/deploy-backend.sh dev
```

### **Deploy to Production**
```bash
npm run deploy:backend:prod
```

## 🛠️ **Development Workflow**

### **Local Development**
```bash
# Start local API Gateway
npm run start:backend

# Or directly
./infrastructure/scripts/start-local.sh
```

### **Build & Validate**
```bash
cd infrastructure/sam
sam build
sam validate
sam validate --lint  # Additional validation
```

### **Test Functions Locally**
```bash
# Invoke specific function
sam local invoke ApiFunction --event events/api-event.json

# Start local API
sam local start-api --port 3001
```

## 📋 **Environment Configuration**

### **Parameters**
- `Environment`: dev, staging, prod
- `AppName`: Application name for resource naming
- `Region`: AWS region for deployment

### **Environment Variables**
Local development uses `env.json`:
```json
{
  "Parameters": {
    "ENVIRONMENT": "local",
    "APP_NAME": "doc-tales",
    "COMMUNICATIONS_TABLE": "doc-tales-communications-local",
    "USER_PROFILES_TABLE": "doc-tales-user-profiles-local",
    "RAW_BUCKET": "doc-tales-raw-communications-local"
  }
}
```

## 🔧 **Available Scripts**

From project root:
```bash
npm run deploy:backend:dev      # Deploy to development
npm run deploy:backend:staging  # Deploy to staging  
npm run deploy:backend:prod     # Deploy to production
npm run start:backend          # Start local development
```

## 📊 **Stack Outputs**

After deployment, the stack provides:
- **ApiEndpoint**: API Gateway URL
- **FrontendWebsiteURL**: S3 website URL
- **Bucket Names**: S3 bucket identifiers
- **Table Names**: DynamoDB table identifiers

## 🔍 **Monitoring & Debugging**

### **CloudWatch Logs**
```bash
sam logs -n ApiFunction --stack-name doc-tales-dev --tail
```

### **Stack Status**
```bash
aws cloudformation describe-stacks --stack-name doc-tales-dev
```

## 🏷️ **Resource Naming Convention**

Resources follow the pattern: `{AppName}-{ResourceType}-{Environment}-{AccountId}`

Examples:
- `doc-tales-communications-dev`
- `doc-tales-raw-communications-dev-123456789012`

## 🔐 **Security & Permissions**

- Lambda functions have minimal required permissions
- S3 buckets configured with appropriate CORS
- API Gateway with configurable authorization
- DynamoDB tables with on-demand billing

## 🚨 **Troubleshooting**

### **Common Issues**
1. **Build Failures**: Ensure all Lambda functions have valid `package.json`
2. **Permission Errors**: Check AWS CLI configuration and IAM permissions
3. **Resource Conflicts**: Use unique stack names for different environments

### **Debug Commands**
```bash
# Validate template
sam validate --lint

# Check build artifacts
ls -la .aws-sam/build/

# Test function locally
sam local invoke ApiFunction
```
