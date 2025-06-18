/**
 * Notification Lambda Function
 * 
 * This function sends notifications for high-priority communications
 * based on DynamoDB stream events.
 */

const AWS = require("aws-sdk");
const sns = new AWS.SNS();

// Environment variables
const COMMUNICATIONS_TABLE = process.env.COMMUNICATIONS_TABLE;
const NOTIFICATION_TOPIC_ARN = process.env.NOTIFICATION_TOPIC_ARN || "";

/**
 * Main handler function
 */
exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));
  
  try {
    // For DynamoDB Stream events
    if (event.Records && event.Records[0].eventSource === "aws:dynamodb") {
      return await handleDynamoDBEvent(event);
    }
    
    // For direct invocation
    if (event.communicationId) {
      return await sendNotification(event.communicationId, event.message);
    }
    
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Unsupported event type" })
    };
  } catch (error) {
    console.error("Error sending notification:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send notification" })
    };
  }
};

/**
 * Handle DynamoDB Stream event
 */
async function handleDynamoDBEvent(event) {
  const processedIds = [];
  
  for (const record of event.Records) {
    // Only process INSERT and MODIFY events
    if (record.eventName !== "INSERT" && record.eventName !== "MODIFY") {
      continue;
    }
    
    // Get the new image (the current state of the item)
    const newImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
    
    // Check if this is a high-urgency communication
    if (shouldSendNotification(newImage)) {
      await sendNotificationForCommunication(newImage);
      processedIds.push(newImage.id);
    }
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Notifications processed",
      processedIds
    })
  };
}

/**
 * Determine if a notification should be sent for this communication
 */
function shouldSendNotification(communication) {
  // Check urgency
  if (communication.metadata && communication.metadata.urgency === "high") {
    return true;
  }
  
  // Check dimensions if available
  if (communication.dimensions && 
      communication.dimensions.temporal && 
      communication.dimensions.temporal.timeContext && 
      communication.dimensions.temporal.timeContext.requiresAction) {
    return true;
  }
  
  // Check if deadline is approaching
  if (communication.dimensions && 
      communication.dimensions.temporal && 
      communication.dimensions.temporal.timeContext && 
      communication.dimensions.temporal.timeContext.daysUntilDeadline !== undefined && 
      communication.dimensions.temporal.timeContext.daysUntilDeadline <= 1) {
    return true;
  }
  
  return false;
}

/**
 * Send notification for a communication
 */
async function sendNotificationForCommunication(communication) {
  // Create notification message
  const message = createNotificationMessage(communication);
  
  // Send notification
  await sendNotification(communication.id, message);
  
  console.log(`Sent notification for communication: ${communication.id}`);
}

/**
 * Create notification message
 */
function createNotificationMessage(communication) {
  let subject = "High Priority Communication";
  
  if (communication.subject) {
    subject = `High Priority: ${communication.subject}`;
  }
  
  let message = "You have a high priority communication that requires your attention.\n\n";
  
  if (communication.subject) {
    message += `Subject: ${communication.subject}\n`;
  }
  
  if (communication.sender && communication.sender.name) {
    message += `From: ${communication.sender.name}\n`;
  }
  
  if (communication.project) {
    message += `Project: ${communication.project.replace("-", " ")}\n`;
  }
  
  if (communication.dimensions && 
      communication.dimensions.temporal && 
      communication.dimensions.temporal.deadline) {
    message += `Deadline: ${communication.dimensions.temporal.deadline}\n`;
  }
  
  message += "\nPlease review this communication as soon as possible.";
  
  return {
    subject,
    message
  };
}

/**
 * Send notification via SNS
 */
async function sendNotification(communicationId, messageData) {
  // If no topic ARN is provided, just log the notification
  if (!NOTIFICATION_TOPIC_ARN) {
    console.log("No SNS topic ARN provided. Would have sent notification:", messageData);
    return {
      success: true,
      message: "Notification logged (no SNS topic configured)"
    };
  }
  
  const params = {
    TopicArn: NOTIFICATION_TOPIC_ARN,
    Subject: messageData.subject || "Doc-Tales Notification",
    Message: messageData.message,
    MessageAttributes: {
      "communicationId": {
        DataType: "String",
        StringValue: communicationId
      }
    }
  };
  
  await sns.publish(params).promise();
  
  return {
    success: true,
    message: "Notification sent successfully"
  };
}
