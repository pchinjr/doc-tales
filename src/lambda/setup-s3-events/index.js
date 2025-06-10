/**
 * Custom resource Lambda function to set up S3 event notifications
 * This function is used to break the circular dependency between S3 bucket and Lambda function
 */

const AWS = require('aws-sdk');
const https = require('https');
const url = require('url');

exports.handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  try {
    // Always respond to CloudFormation
    let responseStatus = 'SUCCESS';
    let responseData = {};
    
    // Only process if this is a Create or Update event
    if (event.RequestType === 'Create' || event.RequestType === 'Update') {
      const s3 = new AWS.S3();
      const { BucketName, LambdaArn, Events } = event.ResourceProperties;
      
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
    }
    
    // Send response back to CloudFormation
    await sendResponse(event, context, responseStatus, responseData);
  } catch (error) {
    console.error('Error:', error);
    await sendResponse(event, context, 'FAILED', { Error: error.message });
  }
};

// Function to send response back to CloudFormation
async function sendResponse(event, context, responseStatus, responseData) {
  const responseBody = JSON.stringify({
    Status: responseStatus,
    Reason: responseStatus === 'FAILED' ? 
      `Error: ${JSON.stringify(responseData)}` : 
      'See CloudWatch logs for details',
    PhysicalResourceId: context.logStreamName,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    Data: responseData
  });
  
  console.log('Response body:', responseBody);
  
  const parsedUrl = url.parse(event.ResponseURL);
  const options = {
    hostname: parsedUrl.hostname,
    port: 443,
    path: parsedUrl.path,
    method: 'PUT',
    headers: {
      'content-type': '',
      'content-length': responseBody.length
    }
  };
  
  return new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      console.log(`Status code: ${response.statusCode}`);
      resolve();
    });
    
    request.on('error', (error) => {
      console.log(`Send response failed: ${error}`);
      reject(error);
    });
    
    request.write(responseBody);
    request.end();
  });
}
