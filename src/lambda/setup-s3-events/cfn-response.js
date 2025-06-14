/**
 * Send response to CloudFormation custom resource
 */

const https = require("https");
const url = require("url");

// Response status values
exports.SUCCESS = "SUCCESS";
exports.FAILED = "FAILED";

/**
 * Send response to CloudFormation
 */
exports.send = function(event, context, responseStatus, responseData, physicalResourceId, noEcho) {
  return new Promise((resolve, reject) => {
    const responseBody = JSON.stringify({
      Status: responseStatus,
      Reason: responseStatus === exports.FAILED ? "See the details in CloudWatch Log Stream: " + context.logStreamName : "See the details in CloudWatch Log Stream: " + context.logStreamName,
      PhysicalResourceId: physicalResourceId || context.logStreamName,
      StackId: event.StackId,
      RequestId: event.RequestId,
      LogicalResourceId: event.LogicalResourceId,
      NoEcho: noEcho || false,
      Data: responseData || {}
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
    
    const request = https.request(options, (response) => {
      console.log(`Status code: ${response.statusCode}`);
      console.log(`Status message: ${response.statusMessage}`);
      resolve();
    });
    
    request.on("error", (error) => {
      console.log(`Send response failed: ${error}`);
      reject(error);
    });
    
    request.write(responseBody);
    request.end();
  });
};
