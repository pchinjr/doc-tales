/**
 * Enhanced ML Transformations for Doc-Tales Demo
 * 
 * This module adds impressive ML capabilities to showcase AWS Lambda + AI services
 */

const AWS = require("aws-sdk");
const comprehend = new AWS.Comprehend();

/**
 * Enhanced sentiment analysis with priority scoring
 */
async function analyzeSentimentAndPriority(content, metadata) {
  try {
    // Get sentiment analysis from AWS Comprehend
    const sentimentResult = await comprehend.detectSentiment({
      Text: content.substring(0, 5000), // Comprehend has text limits
      LanguageCode: 'en'
    }).promise();

    // Calculate priority score (0-100)
    let priorityScore = 50; // Base score

    // Sentiment impact
    if (sentimentResult.Sentiment === 'NEGATIVE') {
      priorityScore += 20; // Negative sentiment increases priority
    } else if (sentimentResult.Sentiment === 'POSITIVE') {
      priorityScore += 5; // Slight boost for positive
    }

    // Urgency impact
    if (metadata.urgency === 'high') {
      priorityScore += 25;
    } else if (metadata.urgency === 'low') {
      priorityScore -= 15;
    }

    // Content-based priority indicators
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'deadline', 'critical'];
    const actionKeywords = ['please', 'need', 'required', 'must', 'should'];
    
    urgentKeywords.forEach(keyword => {
      if (content.toLowerCase().includes(keyword)) {
        priorityScore += 10;
      }
    });

    actionKeywords.forEach(keyword => {
      if (content.toLowerCase().includes(keyword)) {
        priorityScore += 5;
      }
    });

    // Cap at 100
    priorityScore = Math.min(100, Math.max(0, priorityScore));

    return {
      sentiment: sentimentResult.Sentiment,
      sentimentScores: sentimentResult.SentimentScore,
      priorityScore,
      priorityLevel: priorityScore > 75 ? 'HIGH' : priorityScore > 50 ? 'MEDIUM' : 'LOW',
      mlConfidence: sentimentResult.SentimentScore[sentimentResult.Sentiment]
    };
  } catch (error) {
    console.error('Error in sentiment analysis:', error);
    return {
      sentiment: 'NEUTRAL',
      priorityScore: 50,
      priorityLevel: 'MEDIUM',
      error: error.message
    };
  }
}

/**
 * Extract key phrases and topics for better categorization
 */
async function extractKeyInsights(content) {
  try {
    // Extract key phrases
    const keyPhrasesResult = await comprehend.detectKeyPhrases({
      Text: content.substring(0, 5000),
      LanguageCode: 'en'
    }).promise();

    // Extract entities (people, places, organizations, etc.)
    const entitiesResult = await comprehend.detectEntities({
      Text: content.substring(0, 5000),
      LanguageCode: 'en'
    }).promise();

    // Categorize entities
    const insights = {
      keyPhrases: keyPhrasesResult.KeyPhrases
        .filter(phrase => phrase.Score > 0.8)
        .map(phrase => phrase.Text)
        .slice(0, 10), // Top 10 key phrases
      
      people: entitiesResult.Entities
        .filter(entity => entity.Type === 'PERSON' && entity.Score > 0.8)
        .map(entity => entity.Text),
      
      organizations: entitiesResult.Entities
        .filter(entity => entity.Type === 'ORGANIZATION' && entity.Score > 0.8)
        .map(entity => entity.Text),
      
      locations: entitiesResult.Entities
        .filter(entity => entity.Type === 'LOCATION' && entity.Score > 0.8)
        .map(entity => entity.Text),
      
      dates: entitiesResult.Entities
        .filter(entity => entity.Type === 'DATE' && entity.Score > 0.8)
        .map(entity => entity.Text),
      
      // Infer topics from key phrases
      topics: inferTopics(keyPhrasesResult.KeyPhrases),
      
      // Action items detection
      actionItems: extractActionItems(content)
    };

    return insights;
  } catch (error) {
    console.error('Error extracting insights:', error);
    return {
      keyPhrases: [],
      people: [],
      organizations: [],
      locations: [],
      dates: [],
      topics: [],
      actionItems: [],
      error: error.message
    };
  }
}

/**
 * Infer topics from key phrases using simple categorization
 */
function inferTopics(keyPhrases) {
  const topicCategories = {
    'finance': ['budget', 'money', 'cost', 'payment', 'invoice', 'financial', 'bank'],
    'project': ['project', 'task', 'deadline', 'milestone', 'deliverable', 'timeline'],
    'meeting': ['meeting', 'call', 'conference', 'discussion', 'agenda', 'schedule'],
    'travel': ['travel', 'flight', 'hotel', 'trip', 'vacation', 'booking'],
    'legal': ['contract', 'agreement', 'legal', 'terms', 'conditions', 'compliance'],
    'hr': ['employee', 'hiring', 'interview', 'performance', 'review', 'benefits']
  };

  const detectedTopics = [];
  const content = keyPhrases.map(phrase => phrase.Text.toLowerCase()).join(' ');

  Object.entries(topicCategories).forEach(([topic, keywords]) => {
    const matches = keywords.filter(keyword => content.includes(keyword));
    if (matches.length > 0) {
      detectedTopics.push({
        topic,
        confidence: matches.length / keywords.length,
        matchedKeywords: matches
      });
    }
  });

  return detectedTopics.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Extract potential action items from content
 */
function extractActionItems(content) {
  const actionPatterns = [
    /please\s+([^.!?]+)/gi,
    /need\s+to\s+([^.!?]+)/gi,
    /should\s+([^.!?]+)/gi,
    /must\s+([^.!?]+)/gi,
    /action\s+required:?\s*([^.!?]+)/gi,
    /todo:?\s*([^.!?]+)/gi
  ];

  const actionItems = [];
  
  actionPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      actionItems.push({
        text: match[1].trim(),
        type: 'extracted',
        confidence: 0.8
      });
    }
  });

  return actionItems.slice(0, 5); // Limit to top 5 action items
}

/**
 * Generate archetype-specific presentation data
 */
function generateArchetypeAdaptation(communication, insights, archetype) {
  const baseData = {
    id: communication.id,
    title: communication.subject || communication.title,
    content: communication.content,
    insights
  };

  switch (archetype) {
    case 'analytical':
      return {
        ...baseData,
        presentation: {
          style: 'data-focused',
          showMetrics: true,
          showTimeline: true,
          prioritizeNumbers: true,
          layout: 'structured'
        },
        summary: generateAnalyticalSummary(insights),
        visualElements: ['charts', 'timelines', 'metrics']
      };

    case 'creative':
      return {
        ...baseData,
        presentation: {
          style: 'visual-focused',
          showMoodBoard: true,
          showColorCoding: true,
          prioritizeVisuals: true,
          layout: 'flexible'
        },
        summary: generateCreativeSummary(insights),
        visualElements: ['mood-indicators', 'color-themes', 'visual-summaries']
      };

    case 'practical':
      return {
        ...baseData,
        presentation: {
          style: 'action-focused',
          showActionItems: true,
          showNextSteps: true,
          prioritizeActions: true,
          layout: 'checklist'
        },
        summary: generatePracticalSummary(insights),
        visualElements: ['checklists', 'progress-bars', 'action-buttons']
      };

    default:
      return baseData;
  }
}

function generateAnalyticalSummary(insights) {
  return {
    keyMetrics: {
      priorityScore: insights.priorityScore,
      entityCount: insights.people.length + insights.organizations.length,
      topicRelevance: insights.topics.length > 0 ? insights.topics[0].confidence : 0
    },
    dataPoints: insights.keyPhrases.slice(0, 5),
    trends: insights.topics
  };
}

function generateCreativeSummary(insights) {
  return {
    mood: insights.sentiment,
    themes: insights.topics.map(t => t.topic),
    visualCues: {
      colorScheme: insights.sentiment === 'POSITIVE' ? 'warm' : 
                   insights.sentiment === 'NEGATIVE' ? 'cool' : 'neutral',
      intensity: insights.priorityScore > 75 ? 'high' : 'medium'
    },
    storyElements: insights.keyPhrases.slice(0, 3)
  };
}

function generatePracticalSummary(insights) {
  return {
    immediateActions: insights.actionItems,
    nextSteps: generateNextSteps(insights),
    deadlines: insights.dates,
    keyContacts: insights.people.slice(0, 3)
  };
}

function generateNextSteps(insights) {
  const steps = [];
  
  if (insights.actionItems.length > 0) {
    steps.push(`Complete: ${insights.actionItems[0].text}`);
  }
  
  if (insights.people.length > 0) {
    steps.push(`Follow up with: ${insights.people[0]}`);
  }
  
  if (insights.dates.length > 0) {
    steps.push(`Check deadline: ${insights.dates[0]}`);
  }
  
  return steps;
}

module.exports = {
  analyzeSentimentAndPriority,
  extractKeyInsights,
  generateArchetypeAdaptation,
  inferTopics,
  extractActionItems
};
