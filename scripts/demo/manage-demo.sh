#!/bin/bash

# Consolidated demo management script for Doc-Tales
# Handles seeding, cleanup, and validation of demo data

set -e

# Get script directory and source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../common.sh"

# Configuration
ACTION=${1:-help}
ENVIRONMENT=${2:-dev}
REGION=${3:-$DEFAULT_REGION}

print_header "Doc-Tales Demo Manager" "$ENVIRONMENT" "$REGION"

# Function to seed demo data
seed_demo_data() {
    log_info "Seeding demo data to AWS infrastructure..."
    
    check_aws_cli
    get_infrastructure_info "$ENVIRONMENT" "$REGION"
    
    # Create sample communications
    log_info "Creating sample communications..."
    
    # Sample email communication
    local email_data='{
        "id": "demo-email-001",
        "type": "email",
        "source": "demo",
        "sender": "manager@company.com",
        "subject": "Q3 Budget Review - Urgent",
        "content": "Please review the Q3 budget proposal by Friday. This is critical for our planning meeting next week.",
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
        "metadata": {
            "urgency": "high",
            "project": "budget-review",
            "category": "business"
        }
    }'
    
    # Put item in DynamoDB
    aws dynamodb put-item \
        --table-name "$COMMUNICATIONS_TABLE" \
        --item '{
            "PK": {"S": "COMM"},
            "SK": {"S": "demo-email-001"},
            "commType": {"S": "email"},
            "sender": {"S": "manager@company.com"},
            "subject": {"S": "Q3 Budget Review - Urgent"},
            "timestamp": {"S": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"},
            "GSI1PK": {"S": "PROJ#budget-review"},
            "GSI1SK": {"S": "COMM#demo-email-001"},
            "GSI2PK": {"S": "ENTITY#manager@company.com"},
            "GSI2SK": {"S": "COMM#demo-email-001"},
            "metadata": {"M": {
                "urgency": {"S": "high"},
                "project": {"S": "budget-review"},
                "category": {"S": "business"}
            }}
        }' \
        --region "$REGION"
    
    # Upload content to S3
    echo "Please review the Q3 budget proposal by Friday. This is critical for our planning meeting next week." | \
    aws s3 cp - "s3://$RAW_BUCKET/raw/email/demo-email-001.json" \
        --region "$REGION" \
        --content-type "application/json"
    
    # Create sample user profiles
    log_info "Creating sample user profiles..."
    
    local archetypes=("analyst" "connector" "prioritizer" "visualizer")
    for archetype in "${archetypes[@]}"; do
        aws dynamodb put-item \
            --table-name "$USER_PROFILES_TABLE" \
            --item '{
                "PK": {"S": "USER"},
                "SK": {"S": "demo-'$archetype'"},
                "userId": {"S": "demo-'$archetype'"},
                "archetype": {"S": "'$archetype'"},
                "preferences": {"M": {
                    "theme": {"S": "default"},
                    "notifications": {"BOOL": true}
                }},
                "createdAt": {"S": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}
            }' \
            --region "$REGION"
    done
    
    log_success "Demo data seeded successfully"
    log_info "Sample communications and user profiles created"
}

# Function to clean demo data
cleanup_demo_data() {
    log_info "Cleaning up demo data from AWS infrastructure..."
    
    check_aws_cli
    get_infrastructure_info "$ENVIRONMENT" "$REGION"
    
    # Clean DynamoDB communications
    log_info "Removing demo communications..."
    
    # Scan for demo items and delete them
    local demo_items=$(aws dynamodb scan \
        --table-name "$COMMUNICATIONS_TABLE" \
        --filter-expression "begins_with(SK, :demo)" \
        --expression-attribute-values '{":demo": {"S": "demo-"}}' \
        --projection-expression "PK, SK" \
        --region "$REGION" \
        --output json)
    
    echo "$demo_items" | jq -r '.Items[] | "\(.PK.S) \(.SK.S)"' | while read pk sk; do
        if [ -n "$pk" ] && [ -n "$sk" ]; then
            aws dynamodb delete-item \
                --table-name "$COMMUNICATIONS_TABLE" \
                --key '{"PK": {"S": "'$pk'"}, "SK": {"S": "'$sk'"}}' \
                --region "$REGION"
        fi
    done
    
    # Clean user profiles
    log_info "Removing demo user profiles..."
    
    local demo_users=$(aws dynamodb scan \
        --table-name "$USER_PROFILES_TABLE" \
        --filter-expression "begins_with(SK, :demo)" \
        --expression-attribute-values '{":demo": {"S": "demo-"}}' \
        --projection-expression "PK, SK" \
        --region "$REGION" \
        --output json)
    
    echo "$demo_users" | jq -r '.Items[] | "\(.PK.S) \(.SK.S)"' | while read pk sk; do
        if [ -n "$pk" ] && [ -n "$sk" ]; then
            aws dynamodb delete-item \
                --table-name "$USER_PROFILES_TABLE" \
                --key '{"PK": {"S": "'$pk'"}, "SK": {"S": "'$sk'"}}' \
                --region "$REGION"
        fi
    done
    
    # Clean S3 demo objects
    log_info "Removing demo objects from S3..."
    aws s3 rm "s3://$RAW_BUCKET/raw/" --recursive --exclude "*" --include "demo-*" --region "$REGION" || true
    
    log_success "Demo data cleanup completed"
}

# Function to validate demo environment
validate_demo() {
    log_info "Validating demo environment..."
    
    check_aws_cli
    get_infrastructure_info "$ENVIRONMENT" "$REGION"
    
    local validation_passed=true
    local warnings=0
    
    # Check API endpoint
    log_info "Testing API endpoint..."
    if curl -s -f "$API_ENDPOINT/health" > /dev/null 2>&1; then
        log_success "API endpoint is accessible"
    else
        log_warning "API endpoint health check failed"
        warnings=$((warnings + 1))
    fi
    
    # Check DynamoDB tables
    log_info "Checking DynamoDB tables..."
    for table in "$COMMUNICATIONS_TABLE" "$USER_PROFILES_TABLE"; do
        if aws dynamodb describe-table --table-name "$table" --region "$REGION" > /dev/null 2>&1; then
            log_success "Table $table exists and is accessible"
        else
            log_error "Table $table is not accessible"
            validation_passed=false
        fi
    done
    
    # Check S3 buckets
    log_info "Checking S3 buckets..."
    for bucket in "$RAW_BUCKET" "$FRONTEND_BUCKET"; do
        if aws s3 ls "s3://$bucket" --region "$REGION" > /dev/null 2>&1; then
            log_success "Bucket $bucket exists and is accessible"
        else
            log_error "Bucket $bucket is not accessible"
            validation_passed=false
        fi
    done
    
    # Check demo data
    log_info "Checking demo data..."
    local demo_count=$(aws dynamodb scan \
        --table-name "$COMMUNICATIONS_TABLE" \
        --filter-expression "begins_with(SK, :demo)" \
        --expression-attribute-values '{":demo": {"S": "demo-"}}' \
        --select "COUNT" \
        --region "$REGION" \
        --output text --query "Count")
    
    if [ "$demo_count" -gt 0 ]; then
        log_success "Found $demo_count demo communications"
    else
        log_warning "No demo data found - run 'seed' to create demo data"
        warnings=$((warnings + 1))
    fi
    
    # Summary
    echo
    if [ "$validation_passed" = true ]; then
        log_success "Demo validation completed successfully"
        if [ $warnings -gt 0 ]; then
            log_warning "$warnings warnings found"
        fi
    else
        log_error "Demo validation failed"
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "Usage: $0 <action> [environment] [region]"
    echo
    echo "Actions:"
    echo "  seed      - Seed demo data to AWS infrastructure"
    echo "  cleanup   - Remove demo data from AWS infrastructure"
    echo "  validate  - Validate demo environment is ready"
    echo "  prepare   - Full demo preparation (cleanup + seed + validate)"
    echo "  help      - Show this help message"
    echo
    echo "Parameters:"
    echo "  environment - AWS environment (default: dev)"
    echo "  region      - AWS region (default: us-east-1)"
    echo
    echo "Examples:"
    echo "  $0 seed dev us-east-1"
    echo "  $0 cleanup staging"
    echo "  $0 validate"
    echo "  $0 prepare dev"
}

# Main execution
case "$ACTION" in
    "seed")
        seed_demo_data
        ;;
    "cleanup")
        cleanup_demo_data
        ;;
    "validate")
        validate_demo
        ;;
    "prepare")
        cleanup_demo_data
        seed_demo_data
        validate_demo
        log_success "Demo environment fully prepared!"
        ;;
    "help"|*)
        show_help
        ;;
esac
