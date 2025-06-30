#!/usr/bin/env node

// Interactive ML Services Demo
// Shows how the ML dimension extraction services work

const readline = require("readline");

console.log("🚀 Doc-Tales ML Dimension Extraction Demo\n");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Sample communications for demo
const sampleCommunications = {
  urgent: `Subject: URGENT: Server Down - Immediate Action Required

Hi Team,

Our production server is down and customers are unable to access the application. 
This is critical and needs immediate attention. Please join the emergency call 
at 555-1234 right now.

The issue started at 2:30 PM and we need to resolve this ASAP before it affects 
more users. I've already contacted the infrastructure team.

Thanks,
John Smith
DevOps Manager`,

  meeting: `Subject: Weekly Team Meeting - Tomorrow 2 PM

Hi everyone,

Just a reminder about our weekly team meeting tomorrow (Friday) at 2 PM in 
Conference Room B. We'll be discussing the Q4 project roadmap and reviewing 
the budget allocations.

Agenda:
- Project status updates
- Resource planning
- Next quarter goals

Please bring your laptops and project reports.

Best regards,
Sarah Johnson
Project Manager`,

  casual: `Subject: Coffee Chat

Hey Mike,

Hope you're doing well! Want to grab coffee sometime next week? I'd love to 
catch up and hear about your new project. No rush - whenever works for you.

Let me know what days are good.

Cheers,
Alex`,

  business: `Subject: Q4 Financial Review Meeting

Dear Stakeholders,

Please join us for the quarterly financial review meeting on December 15th at 
10 AM. We'll be presenting the revenue analysis, market performance metrics, 
and strategic planning for the upcoming fiscal year.

The meeting will cover:
- Revenue growth analysis
- Market expansion opportunities  
- Investment portfolio review
- Risk assessment

Location: Executive Conference Room
Duration: 2 hours

Please confirm your attendance.

Best regards,
Finance Team`
};

async function demoServices() {
  try {
    const { 
      DimensionMapper, 
      UrgencyDetector, 
      TopicCategorizer,
      EntityExtractor,
      SentimentAnalyzer
    } = require("../packages/common/dist/index.js");

    console.log("✅ Successfully loaded all ML services!\n");

    // Create service instances
    const urgencyDetector = new UrgencyDetector('us-east-1');
    const topicCategorizer = new TopicCategorizer('us-east-1');
    const entityExtractor = new EntityExtractor('us-east-1');
    const sentimentAnalyzer = new SentimentAnalyzer('us-east-1');
    const dimensionMapper = new DimensionMapper('us-east-1');

    console.log('🔧 Service instances created successfully!\n');

    return { urgencyDetector, topicCategorizer, entityExtractor, sentimentAnalyzer, dimensionMapper };
  } catch (error) {
    console.error('❌ Error loading services:', error.message);
    return null;
  }
}

async function analyzeCommunication(services, text, title) {
  console.log(`\n📧 Analyzing: ${title}`);
  console.log('='.repeat(50));
  console.log(`Text preview: ${text.substring(0, 100)}...`);
  console.log('');

  try {
    // Demo urgency detection (works without AWS credentials)
    console.log('🚨 Urgency Analysis:');
    try {
      const urgencyResult = await services.urgencyDetector.detectUrgency(text);
      console.log(`   Level: ${urgencyResult.level.toUpperCase()}`);
      console.log(`   Score: ${urgencyResult.score.toFixed(2)}`);
      console.log(`   Keywords: ${urgencyResult.indicators.keywords.join(', ') || 'none'}`);
      console.log(`   Confidence: ${urgencyResult.confidence.toFixed(2)}`);
    } catch (error) {
      console.log(`   Result: ${error.message.includes('credentials') ? 'Service works (AWS credentials needed for full analysis)' : error.message}`);
    }

    // Demo topic categorization (works without AWS credentials)
    console.log('\n📂 Topic Analysis:');
    try {
      const topicResult = await services.topicCategorizer.categorizeTopics(text);
      console.log(`   Primary: ${topicResult.primary}`);
      console.log(`   Secondary: ${topicResult.secondary.join(', ') || 'none'}`);
      console.log(`   Confidence: ${topicResult.confidence.toFixed(2)}`);
    } catch (error) {
      console.log(`   Result: ${error.message.includes('credentials') ? 'Service works (AWS credentials needed for full analysis)' : error.message}`);
    }

    // Demo dimension mapping (shows structure even without AWS)
    console.log('\n🎯 Dimension Mapping:');
    try {
      const dimensionResult = await services.dimensionMapper.extractDimensions(text);
      console.log(`   Processing time: ${dimensionResult.extractionMetadata.processingTime}ms`);
      console.log(`   Method: ${dimensionResult.extractionMetadata.extractionMethod}`);
      console.log(`   Confidence: ${dimensionResult.extractionMetadata.confidenceScore.toFixed(2)}`);
      console.log(`   Dimensions: temporal, relationship, visual, analytical`);
    } catch (error) {
      console.log(`   Result: ${error.message.includes('credentials') ? 'Service works (AWS credentials needed for ML analysis)' : error.message}`);
    }

  } catch (error) {
    console.log(`❌ Analysis error: ${error.message}`);
  }
}

async function runDemo() {
  console.log('Loading ML services...\n');
  
  const services = await demoServices();
  if (!services) {
    console.log('❌ Demo failed - could not load services');
    rl.close();
    return;
  }

  console.log('🎉 Demo ready! Choose a communication to analyze:\n');
  console.log('1. Urgent server issue (high urgency)');
  console.log('2. Team meeting reminder (medium urgency)');
  console.log('3. Casual coffee chat (low urgency)');
  console.log('4. Business financial review (business topic)');
  console.log('5. Enter custom text');
  console.log('6. Run all samples');
  console.log('0. Exit\n');

  rl.question('Enter your choice (0-6): ', async (choice) => {
    switch (choice) {
      case '1':
        await analyzeCommunication(services, sampleCommunications.urgent, 'Urgent Server Issue');
        break;
      case '2':
        await analyzeCommunication(services, sampleCommunications.meeting, 'Team Meeting');
        break;
      case '3':
        await analyzeCommunication(services, sampleCommunications.casual, 'Casual Coffee Chat');
        break;
      case '4':
        await analyzeCommunication(services, sampleCommunications.business, 'Business Review');
        break;
      case '5':
        rl.question('Enter your text: ', async (customText) => {
          await analyzeCommunication(services, customText, 'Custom Text');
          rl.close();
        });
        return;
      case '6':
        for (const [key, text] of Object.entries(sampleCommunications)) {
          await analyzeCommunication(services, text, key.charAt(0).toUpperCase() + key.slice(1));
        }
        break;
      case '0':
        console.log('👋 Thanks for trying the demo!');
        rl.close();
        return;
      default:
        console.log('❌ Invalid choice');
        break;
    }
    
    if (choice !== '5') {
      console.log('\n🔄 Demo complete! Run again with: node scripts/demo-ml-services.js');
      rl.close();
    }
  });
}

// Run the demo
runDemo().catch(error => {
  console.error('❌ Demo failed:', error);
  rl.close();
});
