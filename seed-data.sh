#!/bin/bash
# seed-data.sh
# Script to seed DynamoDB tables with sample data for Doc-Tales

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
    },
    "preferences": {
      "M": {
        "theme": {"S": "light"},
        "notifications": {"BOOL": true}
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
    "content": {"S": "Hi there! I found 3 properties that match your criteria. We should schedule viewings this week if possible. The market is moving fast!"},
    "timestamp": {"S": "2025-06-15T10:30:00Z"},
    "dimensions": {
      "M": {
        "temporal": {
          "M": {
            "urgency": {"N": "0.8"},
            "deadline": {"S": "2025-06-22T00:00:00Z"},
            "followUpDate": {"S": "2025-06-18T00:00:00Z"}
          }
        },
        "relationship": {
          "M": {
            "strength": {"N": "0.7"},
            "frequency": {"N": "0.6"},
            "networkPosition": {"S": "primary"}
          }
        },
        "visual": {
          "M": {
            "hasAttachments": {"BOOL": true},
            "documentType": {"S": "text/html"},
            "colorScheme": {"S": "professional"}
          }
        },
        "analytical": {
          "M": {
            "category": {"S": "real-estate"},
            "sentiment": {"N": "0.6"},
            "tags": {"L": [{"S": "viewing"}, {"S": "property"}, {"S": "urgent"}]}
          }
        }
      }
    }
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
    "content": {"S": "This letter confirms you are pre-approved for a mortgage loan up to $500,000 with an interest rate of 4.5% for a 30-year fixed term."},
    "timestamp": {"S": "2025-06-10T14:15:00Z"},
    "dimensions": {
      "M": {
        "temporal": {
          "M": {
            "urgency": {"N": "0.5"},
            "deadline": {"S": "2025-07-10T00:00:00Z"},
            "followUpDate": {"S": "2025-06-20T00:00:00Z"}
          }
        },
        "relationship": {
          "M": {
            "strength": {"N": "0.6"},
            "frequency": {"N": "0.3"},
            "networkPosition": {"S": "secondary"}
          }
        },
        "visual": {
          "M": {
            "hasAttachments": {"BOOL": false},
            "documentType": {"S": "application/pdf"},
            "colorScheme": {"S": "formal"}
          }
        },
        "analytical": {
          "M": {
            "category": {"S": "financial"},
            "sentiment": {"N": "0.7"},
            "tags": {"L": [{"S": "mortgage"}, {"S": "pre-approval"}, {"S": "financial"}]}
          }
        }
      }
    }
  }' \
  --region $REGION

# Social media message from friend
aws dynamodb put-item \
  --table-name $COMMUNICATIONS_TABLE \
  --item '{
    "PK": {"S": "USER#demo-user"},
    "SK": {"S": "COMM#comm-003"},
    "GSI1PK": {"S": "USER#demo-user"},
    "GSI1SK": {"S": "PROJECT#Home Purchase#COMM#comm-003"},
    "GSI2PK": {"S": "USER#demo-user"},
    "GSI2SK": {"S": "2025-06-16T20:45:00Z"},
    "id": {"S": "comm-003"},
    "userId": {"S": "demo-user"},
    "project": {"S": "Home Purchase"},
    "type": {"S": "social"},
    "source": {"S": "Facebook"},
    "sender": {"S": "mike.friend"},
    "senderName": {"S": "Mike Wilson"},
    "subject": {"S": ""},
    "content": {"S": "Hey! I heard you're looking for a house. My neighbor is selling their place and hasn't listed it yet. Let me know if you want me to connect you!"},
    "timestamp": {"S": "2025-06-16T20:45:00Z"},
    "dimensions": {
      "M": {
        "temporal": {
          "M": {
            "urgency": {"N": "0.7"},
            "deadline": {"S": "2025-06-23T00:00:00Z"},
            "followUpDate": {"S": "2025-06-17T00:00:00Z"}
          }
        },
        "relationship": {
          "M": {
            "strength": {"N": "0.9"},
            "frequency": {"N": "0.8"},
            "networkPosition": {"S": "personal"}
          }
        },
        "visual": {
          "M": {
            "hasAttachments": {"BOOL": false},
            "documentType": {"S": "text/plain"},
            "colorScheme": {"S": "casual"}
          }
        },
        "analytical": {
          "M": {
            "category": {"S": "personal"},
            "sentiment": {"N": "0.8"},
            "tags": {"L": [{"S": "friend"}, {"S": "referral"}, {"S": "opportunity"}]}
          }
        }
      }
    }
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
    "content": {"S": "We were impressed with your application and would like to invite you for an interview next Tuesday at 2 PM. Please confirm if this time works for you."},
    "timestamp": {"S": "2025-06-14T09:15:00Z"},
    "dimensions": {
      "M": {
        "temporal": {
          "M": {
            "urgency": {"N": "0.9"},
            "deadline": {"S": "2025-06-18T00:00:00Z"},
            "followUpDate": {"S": "2025-06-17T00:00:00Z"}
          }
        },
        "relationship": {
          "M": {
            "strength": {"N": "0.4"},
            "frequency": {"N": "0.2"},
            "networkPosition": {"S": "professional"}
          }
        },
        "visual": {
          "M": {
            "hasAttachments": {"BOOL": false},
            "documentType": {"S": "text/html"},
            "colorScheme": {"S": "corporate"}
          }
        },
        "analytical": {
          "M": {
            "category": {"S": "career"},
            "sentiment": {"N": "0.8"},
            "tags": {"L": [{"S": "interview"}, {"S": "job"}, {"S": "opportunity"}]}
          }
        }
      }
    }
  }' \
  --region $REGION

# Document from online course
aws dynamodb put-item \
  --table-name $COMMUNICATIONS_TABLE \
  --item '{
    "PK": {"S": "USER#demo-user"},
    "SK": {"S": "COMM#comm-005"},
    "GSI1PK": {"S": "USER#demo-user"},
    "GSI1SK": {"S": "PROJECT#Career Change#COMM#comm-005"},
    "GSI2PK": {"S": "USER#demo-user"},
    "GSI2SK": {"S": "2025-06-05T16:30:00Z"},
    "id": {"S": "comm-005"},
    "userId": {"S": "demo-user"},
    "project": {"S": "Career Change"},
    "type": {"S": "document"},
    "source": {"S": "Coursera"},
    "sender": {"S": "courses@coursera.org"},
    "senderName": {"S": "Coursera"},
    "subject": {"S": "Certificate of Completion - AWS Cloud Architect"},
    "content": {"S": "Congratulations on completing the AWS Cloud Architect certification course! Your certificate is attached."},
    "timestamp": {"S": "2025-06-05T16:30:00Z"},
    "dimensions": {
      "M": {
        "temporal": {
          "M": {
            "urgency": {"N": "0.1"},
            "deadline": {"S": "2025-06-05T00:00:00Z"},
            "followUpDate": {"S": "2025-06-20T00:00:00Z"}
          }
        },
        "relationship": {
          "M": {
            "strength": {"N": "0.3"},
            "frequency": {"N": "0.4"},
            "networkPosition": {"S": "educational"}
          }
        },
        "visual": {
          "M": {
            "hasAttachments": {"BOOL": true},
            "documentType": {"S": "application/pdf"},
            "colorScheme": {"S": "educational"}
          }
        },
        "analytical": {
          "M": {
            "category": {"S": "education"},
            "sentiment": {"N": "0.9"},
            "tags": {"L": [{"S": "certificate"}, {"S": "course"}, {"S": "aws"}]}
          }
        }
      }
    }
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
    "content": {"S": "We're planning the family reunion for July 15th. Can you help coordinate activities for the kids? Also, please let me know if you have dietary restrictions."},
    "timestamp": {"S": "2025-06-12T11:20:00Z"},
    "dimensions": {
      "M": {
        "temporal": {
          "M": {
            "urgency": {"N": "0.6"},
            "deadline": {"S": "2025-07-01T00:00:00Z"},
            "followUpDate": {"S": "2025-06-19T00:00:00Z"}
          }
        },
        "relationship": {
          "M": {
            "strength": {"N": "0.8"},
            "frequency": {"N": "0.5"},
            "networkPosition": {"S": "family"}
          }
        },
        "visual": {
          "M": {
            "hasAttachments": {"BOOL": false},
            "documentType": {"S": "text/plain"},
            "colorScheme": {"S": "personal"}
          }
        },
        "analytical": {
          "M": {
            "category": {"S": "family"},
            "sentiment": {"N": "0.7"},
            "tags": {"L": [{"S": "reunion"}, {"S": "planning"}, {"S": "family"}]}
          }
        }
      }
    }
  }' \
  --region $REGION

# Social media event invitation
aws dynamodb put-item \
  --table-name $COMMUNICATIONS_TABLE \
  --item '{
    "PK": {"S": "USER#demo-user"},
    "SK": {"S": "COMM#comm-007"},
    "GSI1PK": {"S": "USER#demo-user"},
    "GSI1SK": {"S": "PROJECT#Family Event#COMM#comm-007"},
    "GSI2PK": {"S": "USER#demo-user"},
    "GSI2SK": {"S": "2025-06-13T14:50:00Z"},
    "id": {"S": "comm-007"},
    "userId": {"S": "demo-user"},
    "project": {"S": "Family Event"},
    "type": {"S": "social"},
    "source": {"S": "Facebook"},
    "sender": {"S": "events@facebook.com"},
    "senderName": {"S": "Facebook Events"},
    "subject": {"S": "Family Reunion 2025"},
    "content": {"S": "You've been invited to 'Family Reunion 2025' on July 15th at Golden Gate Park. 25 people are attending."},
    "timestamp": {"S": "2025-06-13T14:50:00Z"},
    "dimensions": {
      "M": {
        "temporal": {
          "M": {
            "urgency": {"N": "0.5"},
            "deadline": {"S": "2025-07-10T00:00:00Z"},
            "followUpDate": {"S": "2025-06-30T00:00:00Z"}
          }
        },
        "relationship": {
          "M": {
            "strength": {"N": "0.7"},
            "frequency": {"N": "0.3"},
            "networkPosition": {"S": "social"}
          }
        },
        "visual": {
          "M": {
            "hasAttachments": {"BOOL": true},
            "documentType": {"S": "application/event"},
            "colorScheme": {"S": "social"}
          }
        },
        "analytical": {
          "M": {
            "category": {"S": "event"},
            "sentiment": {"N": "0.8"},
            "tags": {"L": [{"S": "event"}, {"S": "invitation"}, {"S": "family"}]}
          }
        }
      }
    }
  }' \
  --region $REGION

echo
echo "=== Data Seeding Complete! ==="
echo "Successfully seeded sample data for Doc-Tales demo."
echo

exit 0
