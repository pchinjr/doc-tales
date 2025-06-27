/**
 * Custom resource Lambda function to set up S3 event notifications
 * This function is used to break the circular dependency between S3 bucket and Lambda function
 * Updated to use AWS SDK v3 for better performance.
 */

const { 
  S3Client, 
  PutBucketNotificationConfigurationCommand, 
  GetBucketNotificationConfigurationCommand 
} = require("@aws-sdk/client-s3");
const https = require("https");
const url = require("url");

const s3 = new S3Client({ 
  region: process.env.AWS_REGION || "us-east-1" 
});

exports.handler = async (event, context) => {
  console.log("Received event:", JSON.stringify(event, null, 2));
  
  try {
    // Always respond to CloudFormation
    let responseStatus = "SUCCESS";
    let responseData = {};
    
    // Only process if this is a Create or Update event
    if (event.RequestType === "Create" || event.RequestType === "Update") {
      const { BucketName, LambdaArn, Events, KeyPrefix } = event.ResourceProperties;
      
      // Configure bucket notification with optional key prefix filtering
      const lambdaConfig = {
        LambdaFunctionArn: LambdaArn,
        Events: Events
      };
      
      // Add key prefix filter if specified
      if (KeyPrefix) {
        lambdaConfig.Filter = {
          Key: {
            FilterRules: [
              {
                Name: "prefix",
                Value: KeyPrefix
              }
            ]
          }
        };
      }
      
      const notificationConfiguration = {
        LambdaFunctionConfigurations: [lambdaConfig]
      };
      
      const command = new PutBucketNotificationConfigurationCommand({
        Bucket: BucketName,
        NotificationConfiguration: notificationConfiguration
      });
      await s3.send(command);
      
      console.log(`Successfully configured S3 event notification for bucket ${BucketName}`);
    }
    
    // Send response back to CloudFormation
    await sendResponse(event, context, responseStatus, responseData);
  } catch (error) {
    console.error("Error:", error);
    await sendResponse(event, context, "FAILED", { Error: error.message });
  }
};

// Function to send response back to CloudFormation
async function sendResponse(event, context, responseStatus, responseData) {
  const responseBody = JSON.stringify({
    Status: responseStatus,
    Reason: responseStatus === "FAILED" ? 
      `Error: ${JSON.stringify(responseData)}` : 
      "See CloudWatch logs for details",
    PhysicalResourceId: context.logStreamName,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    Data: responseData
  });
  
  console.log("Response body:", responseBody);
  
  const parsedUrl = url.parse(event.ResponseURL);
  const options = {
    hostname: parsedUrl.hostname,
    port: 443,
    path: parsedUrl.path,
    method: "PUT",
    headers: {
      "content-type": "",
      "content-length": responseBody.length
    }
  };
  
  return new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      console.log(`Status code: ${response.statusCode}`);
      resolve();
    });
    
    request.on("error", (error) => {
      console.log(`Send response failed: ${error}`);
      reject(error);
    });
    
    request.write(responseBody);
    request.end();
  });
}
