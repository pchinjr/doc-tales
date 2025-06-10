/**
 * Custom resource Lambda function to set up S3 event notifications
 * This function is used to break the circular dependency between S3 bucket and Lambda function
 */

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const response = require('./cfn-response');

exports.handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  // For Delete events, just send success response
  if (event.RequestType === 'Delete') {
    await response.send(event, context, response.SUCCESS);
    return;
  }
  
  const { BucketName, LambdaArn, Events } = event.ResourceProperties;
  
  try {
    // Configure bucket notification
    const notificationConfiguration = {
      LambdaFunctionConfigurations: [
        {
          LambdaFunctionArn: LambdaArn,
          Events: Events
        }
      ]
    };
    
    await s3.putBucketNotificationConfiguration({
      Bucket: BucketName,
      NotificationConfiguration: notificationConfiguration
    }).promise();
    
    console.log(`Successfully configured S3 event notification for bucket ${BucketName}`);
    await response.send(event, context, response.SUCCESS);
  } catch (error) {
    console.error('Error configuring S3 event notification:', error);
    await response.send(event, context, response.FAILED, { Error: error.message });
  }
};
