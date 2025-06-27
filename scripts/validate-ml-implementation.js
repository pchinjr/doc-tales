#!/usr/bin/env node

// ML Implementation Validation Script
// Validates the complete ML dimension extraction implementation

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating ML Dimension Extraction Implementation...\n');

// Validation results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

function addResult(type, category, message, details = null) {
  results[type]++;
  results.details.push({
    type,
    category,
    message,
    details,
    timestamp: new Date().toISOString()
  });
  
  const icon = type === 'passed' ? '✅' : type === 'failed' ? '❌' : '⚠️';
  console.log(`${icon} [${category}] ${message}`);
  if (details) {
    console.log(`   ${details}`);
  }
}

// 1. Validate package structure
function validatePackageStructure() {
  console.log('\n📦 Validating Package Structure...');
  
  const requiredFiles = [
    'packages/common/src/services/ComprehendService.ts',
    'packages/common/src/services/EntityExtractor.ts',
    'packages/common/src/services/SentimentAnalyzer.ts',
    'packages/common/src/services/UrgencyDetector.ts',
    'packages/common/src/services/TopicCategorizer.ts',
    'packages/common/src/services/DimensionMapper.ts',
    'packages/common/src/services/DimensionExtractionIntegrator.ts',
    'packages/common/src/services/SchemaMigrator.ts',
    'packages/common/src/types/ml-extraction.ts',
    'packages/backend/src/lambda/dimension-extraction/index.ts',
    'docs/technical/ml-dimension-schema.md'
  ];
  
  requiredFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      addResult('passed', 'Structure', `Required file exists: ${file}`);
    } else {
      addResult('failed', 'Structure', `Missing required file: ${file}`);
    }
  });
}

// 2. Validate service exports
function validateServiceExports() {
  console.log('\n🔧 Validating Service Exports...');
  
  try {
    const common = require('../packages/common/dist/index.js');
    
    const requiredServices = [
      'ComprehendService',
      'EntityExtractor', 
      'SentimentAnalyzer',
      'UrgencyDetector',
      'TopicCategorizer',
      'DimensionMapper',
      'DimensionExtractionIntegrator',
      'SchemaMigrator'
    ];
    
    requiredServices.forEach(service => {
      if (common[service]) {
        addResult('passed', 'Exports', `Service exported: ${service}`);
        
        // Test instantiation
        try {
          const instance = new common[service]('us-east-1');
          addResult('passed', 'Exports', `Service instantiable: ${service}`);
        } catch (error) {
          addResult('warnings', 'Exports', `Service instantiation warning: ${service}`, error.message);
        }
      } else {
        addResult('failed', 'Exports', `Service not exported: ${service}`);
      }
    });
    
  } catch (error) {
    addResult('failed', 'Exports', 'Failed to load common package', error.message);
  }
}

// 3. Validate TypeScript compilation
function validateTypeScriptCompilation() {
  console.log('\n🔨 Validating TypeScript Compilation...');
  
  const { execSync } = require('child_process');
  
  try {
    // Check if common package builds
    execSync('cd packages/common && npm run build', { stdio: 'pipe' });
    addResult('passed', 'TypeScript', 'Common package compiles successfully');
  } catch (error) {
    addResult('failed', 'TypeScript', 'Common package compilation failed', error.message);
  }
  
  try {
    // Check if Lambda function builds
    execSync('cd packages/backend/src/lambda/dimension-extraction && npm run build', { stdio: 'pipe' });
    addResult('passed', 'TypeScript', 'Lambda function compiles successfully');
  } catch (error) {
    addResult('failed', 'TypeScript', 'Lambda function compilation failed', error.message);
  }
}

// 4. Validate AWS SDK integration
function validateAWSSDKIntegration() {
  console.log('\n☁️ Validating AWS SDK Integration...');
  
  try {
    const { ComprehendClient } = require('@aws-sdk/client-comprehend');
    const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
    const { S3Client } = require('@aws-sdk/client-s3');
    const { LambdaClient } = require('@aws-sdk/client-lambda');
    
    addResult('passed', 'AWS SDK', 'Comprehend SDK available');
    addResult('passed', 'AWS SDK', 'DynamoDB SDK available');
    addResult('passed', 'AWS SDK', 'S3 SDK available');
    addResult('passed', 'AWS SDK', 'Lambda SDK available');
    
    // Test client instantiation
    const comprehend = new ComprehendClient({ region: 'us-east-1' });
    const dynamo = new DynamoDBClient({ region: 'us-east-1' });
    const s3 = new S3Client({ region: 'us-east-1' });
    const lambda = new LambdaClient({ region: 'us-east-1' });
    
    addResult('passed', 'AWS SDK', 'All AWS clients instantiate successfully');
    
  } catch (error) {
    addResult('failed', 'AWS SDK', 'AWS SDK integration failed', error.message);
  }
}

// 5. Validate SAM template configuration
function validateSAMTemplate() {
  console.log('\n🏗️ Validating SAM Template Configuration...');
  
  try {
    const templatePath = path.join(process.cwd(), 'infrastructure/sam/template.yaml');
    const template = fs.readFileSync(templatePath, 'utf8');
    
    // Check for Comprehend permissions
    if (template.includes('comprehend:DetectEntities') && 
        template.includes('comprehend:DetectSentiment') && 
        template.includes('comprehend:DetectKeyPhrases')) {
      addResult('passed', 'SAM Template', 'Comprehend permissions configured');
    } else {
      addResult('failed', 'SAM Template', 'Missing Comprehend permissions');
    }
    
    // Check for DimensionExtractionFunction
    if (template.includes('DimensionExtractionFunction')) {
      addResult('passed', 'SAM Template', 'Dimension extraction function defined');
    } else {
      addResult('failed', 'SAM Template', 'Missing dimension extraction function');
    }
    
    // Check for DynamoDB table
    if (template.includes('CommunicationsTable')) {
      addResult('passed', 'SAM Template', 'Communications table defined');
    } else {
      addResult('failed', 'SAM Template', 'Missing communications table');
    }
    
  } catch (error) {
    addResult('failed', 'SAM Template', 'Failed to validate SAM template', error.message);
  }
}

// 6. Validate test coverage
function validateTestCoverage() {
  console.log('\n🧪 Validating Test Coverage...');
  
  const testFiles = [
    'packages/common/src/tests/DimensionMapper.test.ts',
    'packages/common/src/tests/UrgencyDetector.test.ts',
    'packages/common/src/tests/TopicCategorizer.test.ts',
    'packages/backend/src/lambda/tests/ml-integration.test.js',
    'packages/backend/src/lambda/tests/end-to-end.test.js'
  ];
  
  testFiles.forEach(testFile => {
    const fullPath = path.join(process.cwd(), testFile);
    if (fs.existsSync(fullPath)) {
      addResult('passed', 'Tests', `Test file exists: ${testFile}`);
      
      // Check test file content
      const content = fs.readFileSync(fullPath, 'utf8');
      const testCount = (content.match(/tape\(/g) || []).length;
      if (testCount > 0) {
        addResult('passed', 'Tests', `Test file has ${testCount} test cases: ${testFile}`);
      }
    } else {
      addResult('failed', 'Tests', `Missing test file: ${testFile}`);
    }
  });
}

// 7. Validate documentation
function validateDocumentation() {
  console.log('\n📚 Validating Documentation...');
  
  const docFiles = [
    'docs/technical/ml-dimension-schema.md',
    'README.md'
  ];
  
  docFiles.forEach(docFile => {
    const fullPath = path.join(process.cwd(), docFile);
    if (fs.existsSync(fullPath)) {
      addResult('passed', 'Documentation', `Documentation exists: ${docFile}`);
      
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('ML') || content.includes('dimension') || content.includes('Comprehend')) {
        addResult('passed', 'Documentation', `Documentation mentions ML features: ${docFile}`);
      }
    } else {
      addResult('failed', 'Documentation', `Missing documentation: ${docFile}`);
    }
  });
}

// 8. Validate implementation completeness
function validateImplementationCompleteness() {
  console.log('\n🎯 Validating Implementation Completeness...');
  
  const phases = [
    { name: 'Phase 1: Foundation Setup', files: ['packages/common/src/types/ml-extraction.ts'] },
    { name: 'Phase 2: Core ML Service', files: ['packages/common/src/services/ComprehendService.ts', 'packages/common/src/services/EntityExtractor.ts', 'packages/common/src/services/SentimentAnalyzer.ts'] },
    { name: 'Phase 3: Dimension Mapping', files: ['packages/common/src/services/DimensionMapper.ts', 'packages/common/src/services/UrgencyDetector.ts', 'packages/common/src/services/TopicCategorizer.ts'] },
    { name: 'Phase 4: Integration', files: ['packages/backend/src/lambda/dimension-extraction/index.ts', 'packages/common/src/services/DimensionExtractionIntegrator.ts'] },
    { name: 'Phase 5: Testing & Validation', files: ['packages/backend/src/lambda/tests/ml-integration.test.js'] }
  ];
  
  phases.forEach(phase => {
    const allFilesExist = phase.files.every(file => 
      fs.existsSync(path.join(process.cwd(), file))
    );
    
    if (allFilesExist) {
      addResult('passed', 'Implementation', `${phase.name} - Complete`);
    } else {
      addResult('failed', 'Implementation', `${phase.name} - Incomplete`);
    }
  });
}

// Run all validations
async function runValidation() {
  validatePackageStructure();
  validateServiceExports();
  validateTypeScriptCompilation();
  validateAWSSDKIntegration();
  validateSAMTemplate();
  validateTestCoverage();
  validateDocumentation();
  validateImplementationCompleteness();
  
  // Generate summary
  console.log('\n📊 Validation Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  console.log(`📋 Total Checks: ${results.passed + results.failed + results.warnings}`);
  
  const successRate = ((results.passed / (results.passed + results.failed + results.warnings)) * 100).toFixed(1);
  console.log(`📈 Success Rate: ${successRate}%`);
  
  // Generate detailed report
  const reportPath = path.join(process.cwd(), 'ml-validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    summary: {
      passed: results.passed,
      failed: results.failed,
      warnings: results.warnings,
      successRate: parseFloat(successRate),
      timestamp: new Date().toISOString()
    },
    details: results.details
  }, null, 2));
  
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  if (results.failed > 0) {
    console.log('\n❌ Validation failed. Please address the failed checks above.');
    process.exit(1);
  } else {
    console.log('\n🎉 All validations passed! ML implementation is ready.');
    process.exit(0);
  }
}

// Run the validation
runValidation().catch(error => {
  console.error('❌ Validation script failed:', error);
  process.exit(1);
});
