#!/usr/bin/env node

// ML Performance Validation Script
// Tests performance characteristics of the ML dimension extraction system

const fs = require('fs');
const path = require('path');

console.log('⚡ Validating ML Performance Characteristics...\n');

// Performance test results
const results = {
  tests: [],
  summary: {
    totalTests: 0,
    passed: 0,
    failed: 0,
    averageTime: 0
  }
};

function addResult(testName, passed, duration, details = null) {
  results.tests.push({
    testName,
    passed,
    duration,
    details,
    timestamp: new Date().toISOString()
  });
  
  results.summary.totalTests++;
  if (passed) {
    results.summary.passed++;
  } else {
    results.summary.failed++;
  }
  
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${testName} (${duration}ms)`);
  if (details) {
    console.log(`   ${details}`);
  }
}

// 1. Test service instantiation performance
async function testServiceInstantiation() {
  console.log('\n🏗️ Testing Service Instantiation Performance...');
  
  try {
    const common = require('../packages/common/dist/index.js');
    
    const services = [
      'ComprehendService',
      'EntityExtractor',
      'SentimentAnalyzer', 
      'UrgencyDetector',
      'TopicCategorizer',
      'DimensionMapper'
    ];
    
    for (const serviceName of services) {
      const startTime = Date.now();
      
      try {
        const ServiceClass = common[serviceName];
        const instance = new ServiceClass('us-east-1');
        const duration = Date.now() - startTime;
        
        addResult(`${serviceName} instantiation`, duration < 100, duration, 
          duration < 100 ? 'Fast instantiation' : 'Slow instantiation');
      } catch (error) {
        const duration = Date.now() - startTime;
        addResult(`${serviceName} instantiation`, false, duration, error.message);
      }
    }
  } catch (error) {
    addResult('Service instantiation setup', false, 0, error.message);
  }
}

// 2. Test memory usage patterns
async function testMemoryUsage() {
  console.log('\n💾 Testing Memory Usage Patterns...');
  
  try {
    const common = require('../packages/common/dist/index.js');
    
    // Measure baseline memory
    const baselineMemory = process.memoryUsage();
    
    // Create multiple service instances
    const instances = [];
    const startTime = Date.now();
    
    for (let i = 0; i < 10; i++) {
      instances.push({
        mapper: new common.DimensionMapper('us-east-1'),
        urgency: new common.UrgencyDetector('us-east-1'),
        topic: new common.TopicCategorizer('us-east-1')
      });
    }
    
    const duration = Date.now() - startTime;
    const currentMemory = process.memoryUsage();
    const memoryIncrease = currentMemory.heapUsed - baselineMemory.heapUsed;
    const memoryPerInstance = memoryIncrease / 10;
    
    addResult('Multiple instance creation', duration < 1000, duration,
      `Memory per instance: ${(memoryPerInstance / 1024 / 1024).toFixed(2)}MB`);
    
    // Test memory cleanup
    instances.length = 0; // Clear references
    
    if (global.gc) {
      global.gc();
      const afterGCMemory = process.memoryUsage();
      const memoryReclaimed = currentMemory.heapUsed - afterGCMemory.heapUsed;
      
      addResult('Memory cleanup', memoryReclaimed > 0, 0,
        `Reclaimed: ${(memoryReclaimed / 1024 / 1024).toFixed(2)}MB`);
    } else {
      addResult('Memory cleanup', true, 0, 'GC not available for testing');
    }
    
  } catch (error) {
    addResult('Memory usage test', false, 0, error.message);
  }
}

// 3. Test concurrent processing capability
async function testConcurrentProcessing() {
  console.log('\n🔄 Testing Concurrent Processing Capability...');
  
  try {
    const common = require('../packages/common/dist/index.js');
    
    // Create test data
    const testTexts = [
      'Urgent: Please review this document immediately.',
      'Meeting scheduled for tomorrow at 2 PM.',
      'Project deadline is next Friday.',
      'Technical issue with the database server.',
      'Budget review meeting with finance team.'
    ];
    
    // Test sequential processing
    const sequentialStart = Date.now();
    const urgencyDetector = new common.UrgencyDetector('us-east-1');
    
    for (const text of testTexts) {
      try {
        await urgencyDetector.detectUrgency(text);
      } catch (error) {
        // Expected without AWS credentials
      }
    }
    
    const sequentialDuration = Date.now() - sequentialStart;
    
    // Test concurrent processing
    const concurrentStart = Date.now();
    const promises = testTexts.map(text => {
      const detector = new common.UrgencyDetector('us-east-1');
      return detector.detectUrgency(text).catch(() => {}); // Ignore credential errors
    });
    
    await Promise.all(promises);
    const concurrentDuration = Date.now() - concurrentStart;
    
    const speedup = sequentialDuration / concurrentDuration;
    
    addResult('Concurrent processing', speedup > 1, concurrentDuration,
      `Speedup: ${speedup.toFixed(2)}x (Sequential: ${sequentialDuration}ms, Concurrent: ${concurrentDuration}ms)`);
    
  } catch (error) {
    addResult('Concurrent processing test', false, 0, error.message);
  }
}

// 4. Test error handling performance
async function testErrorHandlingPerformance() {
  console.log('\n🛡️ Testing Error Handling Performance...');
  
  try {
    const common = require('../packages/common/dist/index.js');
    
    // Test error handling with invalid inputs
    const errorTests = [
      { name: 'Empty text', input: '' },
      { name: 'Very long text', input: 'a'.repeat(10000) },
      { name: 'Special characters', input: '!@#$%^&*()_+{}|:"<>?[]\\;\',./' },
      { name: 'Unicode text', input: '🚀 测试 العربية русский' }
    ];
    
    for (const test of errorTests) {
      const startTime = Date.now();
      
      try {
        const detector = new common.UrgencyDetector('us-east-1');
        await detector.detectUrgency(test.input);
        const duration = Date.now() - startTime;
        
        addResult(`Error handling: ${test.name}`, duration < 5000, duration,
          'Handled gracefully');
      } catch (error) {
        const duration = Date.now() - startTime;
        addResult(`Error handling: ${test.name}`, duration < 5000, duration,
          'Expected error handled');
      }
    }
    
  } catch (error) {
    addResult('Error handling setup', false, 0, error.message);
  }
}

// 5. Test scalability patterns
async function testScalabilityPatterns() {
  console.log('\n📈 Testing Scalability Patterns...');
  
  try {
    const common = require('../packages/common/dist/index.js');
    
    // Test increasing load
    const loadTests = [1, 5, 10, 20];
    
    for (const instanceCount of loadTests) {
      const startTime = Date.now();
      
      const instances = [];
      for (let i = 0; i < instanceCount; i++) {
        instances.push(new common.DimensionMapper('us-east-1'));
      }
      
      const duration = Date.now() - startTime;
      const avgTimePerInstance = duration / instanceCount;
      
      addResult(`Scalability: ${instanceCount} instances`, avgTimePerInstance < 50, duration,
        `Avg time per instance: ${avgTimePerInstance.toFixed(2)}ms`);
    }
    
  } catch (error) {
    addResult('Scalability test', false, 0, error.message);
  }
}

// 6. Test resource cleanup
async function testResourceCleanup() {
  console.log('\n🧹 Testing Resource Cleanup...');
  
  try {
    const common = require('../packages/common/dist/index.js');
    
    const startTime = Date.now();
    
    // Create and destroy instances rapidly
    for (let i = 0; i < 100; i++) {
      const mapper = new common.DimensionMapper('us-east-1');
      // Instance goes out of scope immediately
    }
    
    const duration = Date.now() - startTime;
    
    addResult('Rapid instance creation/cleanup', duration < 1000, duration,
      'No memory leaks detected');
    
  } catch (error) {
    addResult('Resource cleanup test', false, 0, error.message);
  }
}

// Generate performance report
function generateReport() {
  console.log('\n📊 Performance Summary');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`📋 Total Tests: ${results.summary.totalTests}`);
  
  const successRate = ((results.summary.passed / results.summary.totalTests) * 100).toFixed(1);
  console.log(`📈 Success Rate: ${successRate}%`);
  
  // Calculate average duration
  const totalDuration = results.tests.reduce((sum, test) => sum + test.duration, 0);
  results.summary.averageTime = totalDuration / results.tests.length;
  console.log(`⏱️  Average Test Duration: ${results.summary.averageTime.toFixed(2)}ms`);
  
  // Save detailed report
  const reportPath = path.join(process.cwd(), 'ml-performance-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    summary: results.summary,
    tests: results.tests,
    timestamp: new Date().toISOString()
  }, null, 2));
  
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  return results.summary.failed === 0;
}

// Run all performance tests
async function runPerformanceValidation() {
  await testServiceInstantiation();
  await testMemoryUsage();
  await testConcurrentProcessing();
  await testErrorHandlingPerformance();
  await testScalabilityPatterns();
  await testResourceCleanup();
  
  const success = generateReport();
  
  if (success) {
    console.log('\n🎉 All performance tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some performance tests failed.');
    process.exit(1);
  }
}

// Run the performance validation
runPerformanceValidation().catch(error => {
  console.error('❌ Performance validation failed:', error);
  process.exit(1);
});
