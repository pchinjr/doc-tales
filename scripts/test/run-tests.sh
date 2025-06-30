#!/bin/bash

# Consolidated test runner for Doc-Tales
# Runs unit tests, integration tests, and validation

set -e

# Get script directory and source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../common.sh"

# Configuration
ENVIRONMENT=${1:-dev}
REGION=${2:-$DEFAULT_REGION}
TEST_TYPE=${3:-all}

print_header "Doc-Tales Test Runner" "$ENVIRONMENT" "$REGION"

# Function to run unit tests
run_unit_tests() {
    log_info "Running unit tests..."
    setup_test_env
    
    cd "$(dirname "$SCRIPT_DIR")/.."
    
    # Suppress expected error output from invalid-region tests
    export NODE_OPTIONS="--no-warnings"
    
    # Redirect stderr to filter out expected AWS errors
    npx tape 'packages/backend/src/lambda/tests/*.test.js' 2> >(grep -v "comprehend.invalid-region.amazonaws.com" >&2) | npx tap-spec
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log_success "Unit tests passed"
    else
        log_error "Unit tests failed"
        return $exit_code
    fi
}

# Function to run integration tests
run_integration_tests() {
    log_info "Running integration tests against AWS infrastructure..."
    
    check_aws_cli
    setup_integration_env "$ENVIRONMENT" "$REGION"
    
    cd "$(dirname "$SCRIPT_DIR")/.."
    
    # Run each integration test
    local tests=(
        "packages/backend/src/lambda/tests/integration/api-health.test.js"
        "packages/backend/src/lambda/tests/integration/communication-pipeline.test.js"
        "packages/backend/src/lambda/tests/integration/ml-enhancement.test.js"
        "packages/backend/src/lambda/tests/integration/user-profile.test.js"
        "packages/backend/src/lambda/tests/integration/demo-scenario.test.js"
    )
    
    for test in "${tests[@]}"; do
        if [ -f "$test" ]; then
            log_info "Running $(basename "$test")..."
            node "$test"
        else
            log_warning "Test file not found: $test"
        fi
    done
    
    log_success "Integration tests completed"
}

# Function to run ML validation
run_ml_validation() {
    log_info "Running ML implementation validation..."
    
    cd "$(dirname "$SCRIPT_DIR")/.."
    node scripts/validate-ml-implementation.js
    node scripts/validate-ml-performance.js
    
    log_success "ML validation completed"
}

# Main execution
case "$TEST_TYPE" in
    "unit")
        run_unit_tests
        ;;
    "integration")
        run_integration_tests
        ;;
    "ml")
        run_ml_validation
        ;;
    "all"|*)
        run_unit_tests
        run_integration_tests
        run_ml_validation
        ;;
esac

log_success "All requested tests completed successfully!"
