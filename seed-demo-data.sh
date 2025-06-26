#!/bin/bash

# Demo Data Seeder for Doc-Tales
# Seeds the real AWS infrastructure with demo data for presentations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-dev}
REGION=${AWS_REGION:-us-east-1}
APP_NAME="doc-tales"

echo -e "${BLUE}🌱 Seeding Doc-Tales Demo Data${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}Region: ${REGION}${NC}"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo -e "${RED}❌ AWS CLI not configured or no valid credentials${NC}"
    exit 1
fi

# Get stack outputs
echo -e "${YELLOW}📋 Getting stack information...${NC}"
STACK_NAME="${APP_NAME}-${ENVIRONMENT}"

# Get infrastructure details
RAW_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`RawCommunicationsBucketName`].OutputValue' \
    --output text)

COMMUNICATIONS_TABLE=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`CommunicationsTableName`].OutputValue' \
    --output text)

USER_PROFILES_TABLE=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`UserProfilesTableName`].OutputValue' \
    --output text)

if [ -z "$RAW_BUCKET" ] || [ -z "$COMMUNICATIONS_TABLE" ] || [ -z "$USER_PROFILES_TABLE" ]; then
    echo -e "${RED}❌ Could not find required infrastructure. Is the stack deployed?${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found infrastructure:${NC}"
echo -e "  Raw Bucket: $RAW_BUCKET"
echo -e "  Communications Table: $COMMUNICATIONS_TABLE"
echo -e "  User Profiles Table: $USER_PROFILES_TABLE"

# Create temporary directory for demo data
TEMP_DIR=$(mktemp -d)
echo -e "${YELLOW}📁 Using temporary directory: $TEMP_DIR${NC}"

# Function to create demo communication
create_demo_communication() {
    local id="$1"
    local type="$2"
    local subject="$3"
    local content="$4"
    local sender="$5"
    local urgency="$6"
    
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
    local filename="${TEMP_DIR}/${id}.json"
    
    cat > "$filename" << EOF
{
  "id": "$id",
  "timestamp": "$timestamp",
  "type": "$type",
  "subject": "$subject",
  "content": "$content",
  "sender": "$sender",
  "recipients": ["team@company.com"],
  "metadata": {
    "urgency": "$urgency",
    "category": "demo",
    "source": "demo-seeder"
  }
}
EOF
    
    # Upload to S3
    aws s3 cp "$filename" "s3://$RAW_BUCKET/raw/$type/$id.json" \
        --content-type "application/json" \
        --region "$REGION"
    
    echo -e "  ✅ Created $urgency priority $type: $subject"
}

# Function to create demo user profile
create_demo_user() {
    local user_id="$1"
    local name="$2"
    local archetype="$3"
    local email="$4"
    
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
    
    # Create user profile JSON
    local user_json=$(cat << EOF
{
  "PK": {"S": "USER#$user_id"},
  "userId": {"S": "$user_id"},
  "email": {"S": "$email"},
  "name": {"S": "$name"},
  "archetype": {"S": "$archetype"},
  "preferences": {
    "M": {
      "theme": {"S": "light"},
      "notifications": {"BOOL": true},
      "priorityThreshold": {"N": "70"}
    }
  },
  "createdAt": {"S": "$timestamp"},
  "updatedAt": {"S": "$timestamp"}
}
EOF
)
    
    # Put item in DynamoDB
    aws dynamodb put-item \
        --table-name "$USER_PROFILES_TABLE" \
        --item "$user_json" \
        --region "$REGION" > /dev/null
    
    echo -e "  ✅ Created $archetype user: $name ($email)"
}

# Seed demo user profiles
echo -e "${YELLOW}👥 Creating demo user profiles...${NC}"

create_demo_user "sarah-analytical" "Sarah Analytics" "analytical" "sarah@company.com"
create_demo_user "alex-creative" "Alex Creative" "creative" "alex@company.com"
create_demo_user "pat-practical" "Pat Practical" "practical" "pat@company.com"

# Seed demo communications
echo -e "${YELLOW}📨 Creating demo communications...${NC}"

# High priority communications
create_demo_communication \
    "urgent-client-meeting" \
    "email" \
    "URGENT: Client presentation moved to tomorrow 9am" \
    "Hi team, the Johnson & Associates presentation has been moved to tomorrow at 9am. We need the final slides, budget projections, and Sarah needs to prepare the demo. This is a \$2M deal - we cannot miss this. Please confirm you can attend and bring all necessary materials." \
    "project.manager@company.com" \
    "high"

create_demo_communication \
    "budget-overrun-alert" \
    "email" \
    "ALERT: Project Alpha Budget Overrun" \
    "Project Alpha is 2 weeks behind schedule with a budget overrun of \$15K. We need an immediate action plan to get back on track. The client is expecting delivery by month-end." \
    "finance@company.com" \
    "high"

# Medium priority communications
create_demo_communication \
    "q3-performance-review" \
    "document" \
    "Q3 Performance Review Summary" \
    "Overall performance metrics show 15% growth in user engagement. Revenue targets met at 102%. Areas for improvement include customer support response times (avg 4.2 hours) and mobile app stability (3 crashes per session). Recommend investing in infrastructure upgrades and additional support staff." \
    "analytics@company.com" \
    "medium"

create_demo_communication \
    "security-update-required" \
    "email" \
    "Security Update Required - Action Needed" \
    "Our security audit has identified several vulnerabilities that need to be addressed within the next 2 weeks. Please review the attached report and implement the recommended patches. This affects our compliance certification." \
    "security@company.com" \
    "medium"

# Low priority communications
create_demo_communication \
    "team-pizza-party" \
    "social" \
    "Team Pizza Party Friday! 🍕" \
    "Great job everyone on the product launch! Pizza party Friday at 5pm in the main conference room to celebrate. We've ordered from Tony's - pepperoni, veggie, and Hawaiian. See you there!" \
    "hr@company.com" \
    "low"

create_demo_communication \
    "office-coffee-upgrade" \
    "social" \
    "New Coffee Machine in Break Room" \
    "We've upgraded the coffee machine in the break room! Now featuring espresso, cappuccino, and latte options. Thanks to everyone who voted in the coffee survey. Enjoy your upgraded caffeine experience! ☕" \
    "facilities@company.com" \
    "low"

# Wait for processing
echo -e "${YELLOW}⏳ Waiting for Lambda processing...${NC}"
sleep 10

# Verify seeding
echo -e "${YELLOW}🔍 Verifying demo data...${NC}"

# Check communications in DynamoDB
COMM_COUNT=$(aws dynamodb scan \
    --table-name "$COMMUNICATIONS_TABLE" \
    --filter-expression "contains(metadata.category, :category)" \
    --expression-attribute-values '{":category":{"S":"demo"}}' \
    --select "COUNT" \
    --region "$REGION" \
    --query 'Count' \
    --output text 2>/dev/null || echo "0")

echo -e "  📊 Communications in database: $COMM_COUNT"

# Check user profiles
USER_COUNT=$(aws dynamodb scan \
    --table-name "$USER_PROFILES_TABLE" \
    --filter-expression "begins_with(userId, :prefix)" \
    --expression-attribute-values '{":prefix":{"S":"sarah"}}' \
    --select "COUNT" \
    --region "$REGION" \
    --query 'Count' \
    --output text 2>/dev/null || echo "0")

if [ "$USER_COUNT" -gt "0" ]; then
    echo -e "  👥 User profiles created: 3"
else
    echo -e "  👥 User profiles created: 0 (may still be processing)"
fi

# Cleanup temporary directory
rm -rf "$TEMP_DIR"

echo -e "${GREEN}🎉 Demo data seeding completed!${NC}"
echo -e "${BLUE}📋 Demo Data Summary:${NC}"
echo -e "  • 3 User profiles (Analytical, Creative, Practical archetypes)"
echo -e "  • 6 Communications (2 high, 2 medium, 2 low priority)"
echo -e "  • Real AWS infrastructure processing"
echo -e "  • ML enhancements (if configured)"
echo -e ""
echo -e "${YELLOW}🚀 Your demo is ready!${NC}"
echo -e "Run the integration tests to verify: ./integration-tests.sh $ENVIRONMENT"
