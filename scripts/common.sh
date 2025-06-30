#!/bin/bash

# Common functions and utilities for Doc-Tales scripts
# Source this file in other scripts: source scripts/common.sh

# Colors for output
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export BLUE='\033[0;34m'
export PURPLE='\033[0;35m'
export NC='\033[0m' # No Color

# Default configuration
export DEFAULT_REGION="us-east-1"
export DEFAULT_ENVIRONMENT="dev"
export APP_NAME="doc-tales"

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_header() {
    echo -e "${PURPLE}🎯 $1${NC}"
}

# AWS utilities
check_aws_cli() {
    if ! aws sts get-caller-identity > /dev/null 2>&1; then
        log_error "AWS CLI not configured or no valid credentials"
        exit 1
    fi
    log_success "AWS CLI configured"
}

get_stack_output() {
    local stack_name="$1"
    local output_key="$2"
    local region="${3:-$DEFAULT_REGION}"
    
    aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --region "$region" \
        --query "Stacks[0].Outputs[?OutputKey=='$output_key'].OutputValue" \
        --output text 2>/dev/null || echo ""
}

get_infrastructure_info() {
    local environment="${1:-$DEFAULT_ENVIRONMENT}"
    local region="${2:-$DEFAULT_REGION}"
    local stack_name="${APP_NAME}-${environment}"
    
    log_info "Getting infrastructure information for $stack_name..."
    
    export API_ENDPOINT=$(get_stack_output "$stack_name" "ApiEndpoint" "$region")
    export COMMUNICATIONS_TABLE=$(get_stack_output "$stack_name" "CommunicationsTableName" "$region")
    export USER_PROFILES_TABLE=$(get_stack_output "$stack_name" "UserProfilesTableName" "$region")
    export RAW_BUCKET=$(get_stack_output "$stack_name" "RawCommunicationsBucketName" "$region")
    export PROCESSED_BUCKET=$(get_stack_output "$stack_name" "ProcessedDocumentsBucketName" "$region")
    export FRONTEND_BUCKET=$(get_stack_output "$stack_name" "FrontendBucketName" "$region")
    export FRONTEND_URL=$(get_stack_output "$stack_name" "FrontendWebsiteURL" "$region")
    
    if [ -z "$API_ENDPOINT" ]; then
        log_error "Could not find API endpoint. Is the stack deployed?"
        return 1
    fi
    
    log_success "Infrastructure found:"
    echo "  API Endpoint: $API_ENDPOINT"
    echo "  Communications Table: $COMMUNICATIONS_TABLE"
    echo "  User Profiles Table: $USER_PROFILES_TABLE"
    echo "  Raw Bucket: $RAW_BUCKET"
    echo "  Frontend URL: $FRONTEND_URL"
    
    return 0
}

# Test environment setup
setup_test_env() {
    export NODE_ENV=test
    export AWS_SDK_LOAD_CONFIG=0
    export AWS_ACCESS_KEY_ID=test-key
    export AWS_SECRET_ACCESS_KEY=test-secret
    export NODE_OPTIONS="--no-warnings"
}

setup_integration_env() {
    local environment="${1:-$DEFAULT_ENVIRONMENT}"
    local region="${2:-$DEFAULT_REGION}"
    
    export NODE_ENV=integration
    export AWS_REGION="$region"
    export AWS_SDK_LOAD_CONFIG=1
    
    get_infrastructure_info "$environment" "$region"
}

# Utility functions
confirm_action() {
    local message="$1"
    local default="${2:-n}"
    
    if [ "$default" = "y" ]; then
        read -p "$message [Y/n]: " -n 1 -r
        echo
        [[ $REPLY =~ ^[Nn]$ ]] && return 1
    else
        read -p "$message [y/N]: " -n 1 -r
        echo
        [[ ! $REPLY =~ ^[Yy]$ ]] && return 1
    fi
    return 0
}

# Script header
print_header() {
    local title="$1"
    local environment="${2:-$DEFAULT_ENVIRONMENT}"
    local region="${3:-$DEFAULT_REGION}"
    
    log_header "$title"
    log_info "Environment: $environment"
    log_info "Region: $region"
    log_info "$(date)"
    echo
}
