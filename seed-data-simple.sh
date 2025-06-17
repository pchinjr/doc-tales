#!/bin/bash
# seed-data-simple.sh
# Simplified script to seed DynamoDB tables with sample data for Doc-Tales

# Exit on error
set -e

# Configuration
COMMUNICATIONS_TABLE="doc-tales-communications-dev"
USER_PROFILES_TABLE="doc-tales-user-profiles-dev"
REGION="us-east-1"

echo "=== Doc-Tales Data Seeding ==="
echo "Communications Table: $COMMUNICATIONS_TABLE"
echo "User Profiles Table: $USER_PROFILES_TABLE"
echo "Region: $REGION"
echo

# Seed user profile data
echo "Seeding user profile data..."
aws dynamodb put-item \
  --table-name $USER_PROFILES_TABLE \
  --item '{
    "PK": {"S": "USER#demo-user"},
    "SK": {"S": "PROFILE"},
    "userId": {"S": "demo-user"},
    "email": {"S": "demo@example.com"},
    "name": {"S": "Demo User"},
    "archetypeConfidence": {
      "M": {
        "prioritizer": {"N": "0.25"},
        "connector": {"N": "0.25"},
        "visualizer": {"N": "0.25"},
        "analyst": {"N": "0.25"}
      }
    }
  }' \
  --region $REGION

echo "✅ User profile data seeded!"

# Seed communications data - Home Purchase project
echo "Seeding communications data for Home Purchase project..."

# Email from real estate agent
aws dynamodb put-item \
  --table-name $COMMUNICATIONS_TABLE \
  --item '{
    "PK": {"S": "USER#demo-user"},
    "SK": {"S": "COMM#comm-001"},
    "GSI1PK": {"S": "USER#demo-user"},
    "GSI1SK": {"S": "PROJECT#Home Purchase#COMM#comm-001"},
    "GSI2PK": {"S": "USER#demo-user"},
    "GSI2SK": {"S": "2025-06-15T10:30:00Z"},
    "id": {"S": "comm-001"},
    "userId": {"S": "demo-user"},
    "project": {"S": "Home Purchase"},
    "type": {"S": "email"},
    "source": {"S": "Gmail"},
    "sender": {"S": "sarah@realestate.com"},
    "senderName": {"S": "Sarah Johnson"},
    "subject": {"S": "New Property Listings in Your Area"},
    "content": {"S": "Hi there! I found 3 properties that match your criteria."},
    "timestamp": {"S": "2025-06-15T10:30:00Z"}
  }' \
  --region $REGION

# Document from mortgage broker
aws dynamodb put-item \
  --table-name $COMMUNICATIONS_TABLE \
  --item '{
    "PK": {"S": "USER#demo-user"},
    "SK": {"S": "COMM#comm-002"},
    "GSI1PK": {"S": "USER#demo-user"},
    "GSI1SK": {"S": "PROJECT#Home Purchase#COMM#comm-002"},
    "GSI2PK": {"S": "USER#demo-user"},
    "GSI2SK": {"S": "2025-06-10T14:15:00Z"},
    "id": {"S": "comm-002"},
    "userId": {"S": "demo-user"},
    "project": {"S": "Home Purchase"},
    "type": {"S": "document"},
    "source": {"S": "Email Attachment"},
    "sender": {"S": "john@mortgagebrokers.com"},
    "senderName": {"S": "John Smith"},
    "subject": {"S": "Pre-Approval Letter"},
    "content": {"S": "This letter confirms you are pre-approved for a mortgage loan."},
    "timestamp": {"S": "2025-06-10T14:15:00Z"}
  }' \
  --region $REGION

# Seed communications data - Career Change project
echo "Seeding communications data for Career Change project..."

# Email from recruiter
aws dynamodb put-item \
  --table-name $COMMUNICATIONS_TABLE \
  --item '{
    "PK": {"S": "USER#demo-user"},
    "SK": {"S": "COMM#comm-004"},
    "GSI1PK": {"S": "USER#demo-user"},
    "GSI1SK": {"S": "PROJECT#Career Change#COMM#comm-004"},
    "GSI2PK": {"S": "USER#demo-user"},
    "GSI2SK": {"S": "2025-06-14T09:15:00Z"},
    "id": {"S": "comm-004"},
    "userId": {"S": "demo-user"},
    "project": {"S": "Career Change"},
    "type": {"S": "email"},
    "source": {"S": "Gmail"},
    "sender": {"S": "recruiter@techcorp.com"},
    "senderName": {"S": "Alex Recruiter"},
    "subject": {"S": "Interview Invitation - Senior Developer Position"},
    "content": {"S": "We were impressed with your application and would like to invite you for an interview."},
    "timestamp": {"S": "2025-06-14T09:15:00Z"}
  }' \
  --region $REGION

# Seed communications data - Family Event project
echo "Seeding communications data for Family Event project..."

# Email about family reunion
aws dynamodb put-item \
  --table-name $COMMUNICATIONS_TABLE \
  --item '{
    "PK": {"S": "USER#demo-user"},
    "SK": {"S": "COMM#comm-006"},
    "GSI1PK": {"S": "USER#demo-user"},
    "GSI1SK": {"S": "PROJECT#Family Event#COMM#comm-006"},
    "GSI2PK": {"S": "USER#demo-user"},
    "GSI2SK": {"S": "2025-06-12T11:20:00Z"},
    "id": {"S": "comm-006"},
    "userId": {"S": "demo-user"},
    "project": {"S": "Family Event"},
    "type": {"S": "email"},
    "source": {"S": "Gmail"},
    "sender": {"S": "aunt@family.com"},
    "senderName": {"S": "Aunt Susan"},
    "subject": {"S": "Family Reunion Planning"},
    "content": {"S": "We are planning the family reunion for July 15th."},
    "timestamp": {"S": "2025-06-12T11:20:00Z"}
  }' \
  --region $REGION

echo
echo "=== Data Seeding Complete! ==="
echo "Successfully seeded sample data for Doc-Tales demo."
echo

exit 0
