#!/bin/bash
# Script to check CloudWatch logs for Doc-Tales Lambda functions

echo "Checking CloudWatch logs for Doc-Tales Lambda functions..."

# Function to get the latest log stream for a Lambda function
get_latest_log_stream() {
  local function_name=$1
  aws logs describe-log-streams \
    --log-group-name "/aws/lambda/$function_name" \
    --order-by LastEventTime \
    --descending \
    --limit 1 \
    --query 'logStreams[0].logStreamName' \
    --output text
}

# Function to get recent log events
get_recent_logs() {
  local function_name=$1
  local log_stream=$2
  
  echo "Recent logs for $function_name:"
  aws logs get-log-events \
    --log-group-name "/aws/lambda/$function_name" \
    --log-stream-name "$log_stream" \
    --limit 20 \
    --query 'events[*].message' \
    --output text
}

# Check Ingestion Lambda logs
echo "Checking Ingestion Lambda logs..."
INGESTION_FUNCTION=$(aws lambda list-functions --query "Functions[?starts_with(FunctionName, 'doc-tales-IngestionFunction')].FunctionName" --output text)
if [ -n "$INGESTION_FUNCTION" ]; then
  INGESTION_LOG_STREAM=$(get_latest_log_stream $INGESTION_FUNCTION)
  get_recent_logs $INGESTION_FUNCTION $INGESTION_LOG_STREAM
else
  echo "Ingestion Lambda function not found!"
fi

echo -e "\n----------------------------------------\n"

# Check Dimension Extraction Lambda logs
echo "Checking Dimension Extraction Lambda logs..."
DIMENSION_FUNCTION=$(aws lambda list-functions --query "Functions[?starts_with(FunctionName, 'doc-tales-DimensionExtractionFunction')].FunctionName" --output text)
if [ -n "$DIMENSION_FUNCTION" ]; then
  DIMENSION_LOG_STREAM=$(get_latest_log_stream $DIMENSION_FUNCTION)
  get_recent_logs $DIMENSION_FUNCTION $DIMENSION_LOG_STREAM
else
  echo "Dimension Extraction Lambda function not found!"
fi

echo -e "\n----------------------------------------\n"

# Check Notification Lambda logs
echo "Checking Notification Lambda logs..."
NOTIFICATION_FUNCTION=$(aws lambda list-functions --query "Functions[?starts_with(FunctionName, 'doc-tales-NotificationFunction')].FunctionName" --output text)
if [ -n "$NOTIFICATION_FUNCTION" ]; then
  NOTIFICATION_LOG_STREAM=$(get_latest_log_stream $NOTIFICATION_FUNCTION)
  get_recent_logs $NOTIFICATION_FUNCTION $NOTIFICATION_LOG_STREAM
else
  echo "Notification Lambda function not found!"
fi

echo -e "\n----------------------------------------\n"

# Check API Lambda logs
echo "Checking API Lambda logs..."
API_FUNCTION=$(aws lambda list-functions --query "Functions[?starts_with(FunctionName, 'doc-tales-ApiFunction')].FunctionName" --output text)
if [ -n "$API_FUNCTION" ]; then
  API_LOG_STREAM=$(get_latest_log_stream $API_FUNCTION)
  get_recent_logs $API_FUNCTION $API_LOG_STREAM
else
  echo "API Lambda function not found!"
fi

echo -e "\nLog check completed!"
