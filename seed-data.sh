#!/bin/bash
# seed-data.sh
# Script to seed DynamoDB tables with comprehensive sample data for Doc-Tales demo

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-dev}
COMMUNICATIONS_TABLE="doc-tales-communications-${ENVIRONMENT}"
USER_PROFILES_TABLE="doc-tales-user-profiles-${ENVIRONMENT}"
REGION="us-east-1"

echo -e "${BLUE}=== Doc-Tales Data Seeding ===${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}Communications Table: ${COMMUNICATIONS_TABLE}${NC}"
echo -e "${YELLOW}User Profiles Table: ${USER_PROFILES_TABLE}${NC}"
echo -e "${YELLOW}Region: ${REGION}${NC}"
echo

# Function to check if table exists
check_table_exists() {
    local table_name=$1
    if aws dynamodb describe-table --table-name "$table_name" --region "$REGION" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Table ${table_name} exists${NC}"
        return 0
    else
        echo -e "${RED}❌ Table ${table_name} does not exist${NC}"
        return 1
    fi
}

# Check if tables exist
echo -e "${BLUE}Checking table existence...${NC}"
if ! check_table_exists "$COMMUNICATIONS_TABLE" || ! check_table_exists "$USER_PROFILES_TABLE"; then
    echo -e "${RED}Please ensure the tables exist before running this script.${NC}"
    echo -e "${YELLOW}Run: npm run deploy:backend:${ENVIRONMENT}${NC}"
    exit 1
fi

# Clear existing data (optional)
echo -e "${BLUE}Clearing existing demo data...${NC}"
aws dynamodb scan --table-name "$USER_PROFILES_TABLE" --region "$REGION" \
    --projection-expression "PK, SK" \
    --filter-expression "begins_with(PK, :pk)" \
    --expression-attribute-values '{":pk":{"S":"USER#default-user"}}' \
    --query "Items[*].[PK.S, SK.S]" --output text | \
while read pk sk; do
    if [ -n "$pk" ] && [ -n "$sk" ]; then
        aws dynamodb delete-item --table-name "$USER_PROFILES_TABLE" --region "$REGION" \
            --key "{\"PK\":{\"S\":\"$pk\"}, \"SK\":{\"S\":\"$sk\"}}" >/dev/null 2>&1
    fi
done

aws dynamodb scan --table-name "$COMMUNICATIONS_TABLE" --region "$REGION" \
    --projection-expression "PK, SK" \
    --query "Items[*].[PK.S, SK.S]" --output text | \
while read pk sk; do
    if [ -n "$pk" ] && [ -n "$sk" ]; then
        aws dynamodb delete-item --table-name "$COMMUNICATIONS_TABLE" --region "$REGION" \
            --key "{\"PK\":{\"S\":\"$pk\"}, \"SK\":{\"S\":\"$sk\"}}" >/dev/null 2>&1
    fi
done

echo -e "${GREEN}✅ Existing demo data cleared${NC}"

# Seed user profile data
echo -e "${BLUE}Seeding user profile data...${NC}"
aws dynamodb put-item \
  --table-name "$USER_PROFILES_TABLE" \
  --item '{
    "PK": {"S": "USER#default-user"},
    "SK": {"S": "PROFILE"},
    "userId": {"S": "default-user"},
    "email": {"S": "demo@doctales.com"},
    "name": {"S": "Demo User"},
    "primaryArchetype": {"S": "prioritizer"},
    "archetypeConfidence": {
      "M": {
        "prioritizer": {"N": "0.4"},
        "connector": {"N": "0.3"},
        "visualizer": {"N": "0.2"},
        "analyst": {"N": "0.1"}
      }
    },
    "preferences": {
      "M": {
        "theme": {"S": "light"},
        "notifications": {"BOOL": true},
        "defaultView": {"S": "prioritizer"}
      }
    },
    "interactionHistory": {
      "M": {
        "totalClicks": {"N": "156"},
        "dateClicks": {"N": "45"},
        "peopleClicks": {"N": "38"},
        "visualClicks": {"N": "32"},
        "detailClicks": {"N": "41"}
      }
    },
    "createdAt": {"S": "2025-06-01T00:00:00Z"},
    "updatedAt": {"S": "2025-06-25T17:00:00Z"}
  }' \
  --region "$REGION"

echo -e "${GREEN}✅ User profile data seeded!${NC}"

# Seed communications data - Home Purchase project
echo -e "${BLUE}Seeding Home Purchase project communications...${NC}"

# Email from real estate agent - High urgency
aws dynamodb put-item \
  --table-name "$COMMUNICATIONS_TABLE" \
  --item '{
    "PK": {"S": "COMM"},
    "SK": {"S": "COMM#comm-001"},
    "GSI1PK": {"S": "PROJECT#Home Purchase"},
    "GSI1SK": {"S": "2025-06-25T10:30:00Z"},
    "GSI2PK": {"S": "ENTITY#sarah@realestate.com"},
    "GSI2SK": {"S": "2025-06-25T10:30:00Z"},
    "id": {"S": "comm-001"},
    "commType": {"S": "email"},
    "source": {"S": "Gmail"},
    "sender": {"S": "sarah@realestate.com"},
    "senderName": {"S": "Sarah Johnson"},
    "subject": {"S": "URGENT: Offer Deadline Tomorrow - 123 Oak Street"},
    "content": {"S": "Hi! The seller has received multiple offers on 123 Oak Street. If you are interested, we need to submit your offer by 5 PM tomorrow. The property is priced at $485,000 and matches all your criteria. Please call me ASAP to discuss."},
    "timestamp": {"S": "2025-06-25T10:30:00Z"},
    "project": {"S": "Home Purchase"},
    "dimensions": {
      "M": {
        "temporal": {
          "M": {
            "urgency": {"S": "high"},
            "deadline": {"S": "2025-06-26T17:00:00Z"},
            "timeToDeadline": {"N": "30.5"}
          }
        },
        "relationship": {
          "M": {
            "connectionStrength": {"N": "0.8"},
            "frequency": {"N": "12"},
            "role": {"S": "real-estate-agent"}
          }
        },
        "visual": {
          "M": {
            "hasAttachments": {"BOOL": false},
            "documentType": {"S": "email"},
            "visualElements": {"N": "0"}
          }
        },
        "analytical": {
          "M": {
            "category": {"S": "real-estate"},
            "sentiment": {"S": "urgent"},
            "tags": {"SS": ["offer", "deadline", "property"]},
            "priority": {"N": "9"}
          }
        }
      }
    },
    "metadata": {
      "M": {
        "urgency": {"S": "high"},
        "category": {"S": "real-estate"},
        "hasDeadline": {"BOOL": true},
        "peopleInvolved": {"SS": ["Sarah Johnson"]},
        "actionRequired": {"BOOL": true}
      }
    }
  }' \
  --region "$REGION"

# Document from mortgage broker
aws dynamodb put-item \
  --table-name "$COMMUNICATIONS_TABLE" \
  --item '{
    "PK": {"S": "COMM"},
    "SK": {"S": "COMM#comm-002"},
    "GSI1PK": {"S": "PROJECT#Home Purchase"},
    "GSI1SK": {"S": "2025-06-20T14:15:00Z"},
    "GSI2PK": {"S": "ENTITY#john@mortgagebrokers.com"},
    "GSI2SK": {"S": "2025-06-20T14:15:00Z"},
    "id": {"S": "comm-002"},
    "commType": {"S": "document"},
    "source": {"S": "Email Attachment"},
    "sender": {"S": "john@mortgagebrokers.com"},
    "senderName": {"S": "John Smith"},
    "subject": {"S": "Pre-Approval Letter - $500,000 Mortgage"},
    "content": {"S": "Congratulations! You have been pre-approved for a mortgage loan up to $500,000 at 6.5% interest rate. This pre-approval is valid for 90 days. Please find the official letter attached."},
    "timestamp": {"S": "2025-06-20T14:15:00Z"},
    "project": {"S": "Home Purchase"},
    "dimensions": {
      "M": {
        "temporal": {
          "M": {
            "urgency": {"S": "medium"},
            "validUntil": {"S": "2025-09-18T14:15:00Z"},
            "timeToExpiry": {"N": "85"}
          }
        },
        "relationship": {
          "M": {
            "connectionStrength": {"N": "0.7"},
            "frequency": {"N": "8"},
            "role": {"S": "mortgage-broker"}
          }
        },
        "visual": {
          "M": {
            "hasAttachments": {"BOOL": true},
            "documentType": {"S": "pdf"},
            "visualElements": {"N": "1"}
          }
        },
        "analytical": {
          "M": {
            "category": {"S": "financial"},
            "sentiment": {"S": "positive"},
            "tags": {"SS": ["mortgage", "pre-approval", "financing"]},
            "priority": {"N": "7"}
          }
        }
      }
    },
    "metadata": {
      "M": {
        "urgency": {"S": "medium"},
        "category": {"S": "financial"},
        "hasAttachments": {"BOOL": true},
        "peopleInvolved": {"SS": ["John Smith"]},
        "actionRequired": {"BOOL": false}
      }
    }
  }' \
  --region "$REGION"

# Home inspection report
aws dynamodb put-item \
  --table-name "$COMMUNICATIONS_TABLE" \
  --item '{
    "PK": {"S": "COMM"},
    "SK": {"S": "COMM#comm-003"},
    "GSI1PK": {"S": "PROJECT#Home Purchase"},
    "GSI1SK": {"S": "2025-06-18T16:45:00Z"},
    "GSI2PK": {"S": "ENTITY#mike@homeinspections.com"},
    "GSI2SK": {"S": "2025-06-18T16:45:00Z"},
    "id": {"S": "comm-003"},
    "commType": {"S": "document"},
    "source": {"S": "Email Attachment"},
    "sender": {"S": "mike@homeinspections.com"},
    "senderName": {"S": "Mike Wilson"},
    "subject": {"S": "Home Inspection Report - 456 Maple Avenue"},
    "content": {"S": "Inspection completed for 456 Maple Avenue. Overall condition is good with minor issues noted. Full report attached with photos and recommendations."},
    "timestamp": {"S": "2025-06-18T16:45:00Z"},
    "project": {"S": "Home Purchase"},
    "dimensions": {
      "M": {
        "temporal": {
          "M": {
            "urgency": {"S": "medium"},
            "inspectionDate": {"S": "2025-06-18T09:00:00Z"}
          }
        },
        "relationship": {
          "M": {
            "connectionStrength": {"N": "0.6"},
            "frequency": {"N": "3"},
            "role": {"S": "home-inspector"}
          }
        },
        "visual": {
          "M": {
            "hasAttachments": {"BOOL": true},
            "documentType": {"S": "pdf"},
            "visualElements": {"N": "15"},
            "hasPhotos": {"BOOL": true}
          }
        },
        "analytical": {
          "M": {
            "category": {"S": "inspection"},
            "sentiment": {"S": "neutral"},
            "tags": {"SS": ["inspection", "property", "report"]},
            "priority": {"N": "6"}
          }
        }
      }
    },
    "metadata": {
      "M": {
        "urgency": {"S": "medium"},
        "category": {"S": "inspection"},
        "hasAttachments": {"BOOL": true},
        "peopleInvolved": {"SS": ["Mike Wilson"]},
        "actionRequired": {"BOOL": true}
      }
    }
  }' \
  --region "$REGION"

echo -e "${GREEN}✅ Home Purchase communications seeded!${NC}"

# Seed communications data - Career Change project
echo -e "${BLUE}Seeding Career Change project communications...${NC}"

# Email from recruiter - High urgency interview
aws dynamodb put-item \
  --table-name "$COMMUNICATIONS_TABLE" \
  --item '{
    "PK": {"S": "COMM"},
    "SK": {"S": "COMM#comm-004"},
    "GSI1PK": {"S": "PROJECT#Career Change"},
    "GSI1SK": {"S": "2025-06-24T09:15:00Z"},
    "GSI2PK": {"S": "ENTITY#alex@techcorp.com"},
    "GSI2SK": {"S": "2025-06-24T09:15:00Z"},
    "id": {"S": "comm-004"},
    "commType": {"S": "email"},
    "source": {"S": "Gmail"},
    "sender": {"S": "alex@techcorp.com"},
    "senderName": {"S": "Alex Rodriguez"},
    "subject": {"S": "Final Interview Tomorrow - Senior Developer Position"},
    "content": {"S": "Hi! This is a reminder about your final interview tomorrow at 2 PM with our CTO. Please bring your portfolio and be prepared to discuss the technical challenge. The office is located at 123 Tech Plaza, Suite 500. Looking forward to meeting you!"},
    "timestamp": {"S": "2025-06-24T09:15:00Z"},
    "project": {"S": "Career Change"},
    "dimensions": {
      "M": {
        "temporal": {
          "M": {
            "urgency": {"S": "high"},
            "deadline": {"S": "2025-06-25T14:00:00Z"},
            "timeToDeadline": {"N": "4.75"}
          }
        },
        "relationship": {
          "M": {
            "connectionStrength": {"N": "0.9"},
            "frequency": {"N": "15"},
            "role": {"S": "recruiter"}
          }
        },
        "visual": {
          "M": {
            "hasAttachments": {"BOOL": false},
            "documentType": {"S": "email"},
            "visualElements": {"N": "0"}
          }
        },
        "analytical": {
          "M": {
            "category": {"S": "career"},
            "sentiment": {"S": "positive"},
            "tags": {"SS": ["interview", "final-round", "senior-developer"]},
            "priority": {"N": "10"}
          }
        }
      }
    },
    "metadata": {
      "M": {
        "urgency": {"S": "high"},
        "category": {"S": "career"},
        "hasDeadline": {"BOOL": true},
        "peopleInvolved": {"SS": ["Alex Rodriguez", "CTO"]},
        "actionRequired": {"BOOL": true}
      }
    }
  }' \
  --region "$REGION"

# LinkedIn message from connection
aws dynamodb put-item \
  --table-name "$COMMUNICATIONS_TABLE" \
  --item '{
    "PK": {"S": "COMM"},
    "SK": {"S": "COMM#comm-005"},
    "GSI1PK": {"S": "PROJECT#Career Change"},
    "GSI1SK": {"S": "2025-06-22T11:30:00Z"},
    "GSI2PK": {"S": "ENTITY#jennifer.chen@linkedin.com"},
    "GSI2SK": {"S": "2025-06-22T11:30:00Z"},
    "id": {"S": "comm-005"},
    "commType": {"S": "social"},
    "source": {"S": "LinkedIn"},
    "sender": {"S": "jennifer.chen@linkedin.com"},
    "senderName": {"S": "Jennifer Chen"},
    "subject": {"S": "Referral Opportunity at StartupXYZ"},
    "content": {"S": "Hey! I saw you are looking for new opportunities. We have an opening for a Senior Full-Stack Developer at my company. The team is amazing and the tech stack is modern. Would you be interested in a referral? Let me know!"},
    "timestamp": {"S": "2025-06-22T11:30:00Z"},
    "project": {"S": "Career Change"},
    "dimensions": {
      "M": {
        "temporal": {
          "M": {
            "urgency": {"S": "medium"},
            "responseExpected": {"S": "2025-06-29T11:30:00Z"}
          }
        },
        "relationship": {
          "M": {
            "connectionStrength": {"N": "0.7"},
            "frequency": {"N": "6"},
            "role": {"S": "professional-contact"},
            "networkValue": {"N": "0.8"}
          }
        },
        "visual": {
          "M": {
            "hasAttachments": {"BOOL": false},
            "documentType": {"S": "message"},
            "platform": {"S": "linkedin"}
          }
        },
        "analytical": {
          "M": {
            "category": {"S": "networking"},
            "sentiment": {"S": "positive"},
            "tags": {"SS": ["referral", "opportunity", "startup"]},
            "priority": {"N": "7"}
          }
        }
      }
    },
    "metadata": {
      "M": {
        "urgency": {"S": "medium"},
        "category": {"S": "networking"},
        "platform": {"S": "LinkedIn"},
        "peopleInvolved": {"SS": ["Jennifer Chen"]},
        "actionRequired": {"BOOL": true}
      }
    }
  }' \
  --region "$REGION"

echo -e "${GREEN}✅ Career Change communications seeded!${NC}"

# Seed communications data - Family Event project
echo -e "${BLUE}Seeding Family Event project communications...${NC}"

# Email about family reunion planning
aws dynamodb put-item \
  --table-name "$COMMUNICATIONS_TABLE" \
  --item '{
    "PK": {"S": "COMM"},
    "SK": {"S": "COMM#comm-006"},
    "GSI1PK": {"S": "PROJECT#Family Event"},
    "GSI1SK": {"S": "2025-06-21T11:20:00Z"},
    "GSI2PK": {"S": "ENTITY#susan@family.com"},
    "GSI2SK": {"S": "2025-06-21T11:20:00Z"},
    "id": {"S": "comm-006"},
    "commType": {"S": "email"},
    "source": {"S": "Gmail"},
    "sender": {"S": "susan@family.com"},
    "senderName": {"S": "Aunt Susan"},
    "subject": {"S": "Family Reunion Update - July 15th at Riverside Park"},
    "content": {"S": "Hi everyone! The family reunion is confirmed for July 15th at Riverside Park. We have reserved the large pavilion from 11 AM to 6 PM. Please bring a dish to share and let me know how many people from your family will attend. We are expecting about 45 people total!"},
    "timestamp": {"S": "2025-06-21T11:20:00Z"},
    "project": {"S": "Family Event"},
    "dimensions": {
      "M": {
        "temporal": {
          "M": {
            "urgency": {"S": "low"},
            "eventDate": {"S": "2025-07-15T11:00:00Z"},
            "daysUntilEvent": {"N": "24"}
          }
        },
        "relationship": {
          "M": {
            "connectionStrength": {"N": "0.9"},
            "frequency": {"N": "20"},
            "role": {"S": "family"},
            "familyRole": {"S": "aunt"}
          }
        },
        "visual": {
          "M": {
            "hasAttachments": {"BOOL": false},
            "documentType": {"S": "email"},
            "visualElements": {"N": "0"}
          }
        },
        "analytical": {
          "M": {
            "category": {"S": "family"},
            "sentiment": {"S": "positive"},
            "tags": {"SS": ["reunion", "family", "event-planning"]},
            "priority": {"N": "5"}
          }
        }
      }
    },
    "metadata": {
      "M": {
        "urgency": {"S": "low"},
        "category": {"S": "family"},
        "eventType": {"S": "reunion"},
        "peopleInvolved": {"SS": ["Aunt Susan"]},
        "actionRequired": {"BOOL": true}
      }
    }
  }' \
  --region "$REGION"

# WhatsApp message from cousin
aws dynamodb put-item \
  --table-name "$COMMUNICATIONS_TABLE" \
  --item '{
    "PK": {"S": "COMM"},
    "SK": {"S": "COMM#comm-007"},
    "GSI1PK": {"S": "PROJECT#Family Event"},
    "GSI1SK": {"S": "2025-06-23T19:45:00Z"},
    "GSI2PK": {"S": "ENTITY#mike.family@whatsapp.com"},
    "GSI2SK": {"S": "2025-06-23T19:45:00Z"},
    "id": {"S": "comm-007"},
    "commType": {"S": "social"},
    "source": {"S": "WhatsApp"},
    "sender": {"S": "mike.family@whatsapp.com"},
    "senderName": {"S": "Cousin Mike"},
    "subject": {"S": "Family Reunion - Can you help with music?"},
    "content": {"S": "Hey! Aunt Susan mentioned you might be able to help with music for the reunion. I have a good speaker system we can use. Want to collaborate on a playlist? I was thinking mix of oldies for the grandparents and some current hits for the kids."},
    "timestamp": {"S": "2025-06-23T19:45:00Z"},
    "project": {"S": "Family Event"},
    "dimensions": {
      "M": {
        "temporal": {
          "M": {
            "urgency": {"S": "low"},
            "eventDate": {"S": "2025-07-15T11:00:00Z"},
            "daysUntilEvent": {"N": "22"}
          }
        },
        "relationship": {
          "M": {
            "connectionStrength": {"N": "0.8"},
            "frequency": {"N": "25"},
            "role": {"S": "family"},
            "familyRole": {"S": "cousin"}
          }
        },
        "visual": {
          "M": {
            "hasAttachments": {"BOOL": false},
            "documentType": {"S": "message"},
            "platform": {"S": "whatsapp"}
          }
        },
        "analytical": {
          "M": {
            "category": {"S": "family"},
            "sentiment": {"S": "positive"},
            "tags": {"SS": ["music", "collaboration", "reunion"]},
            "priority": {"N": "4"}
          }
        }
      }
    },
    "metadata": {
      "M": {
        "urgency": {"S": "low"},
        "category": {"S": "family"},
        "platform": {"S": "WhatsApp"},
        "peopleInvolved": {"SS": ["Cousin Mike"]},
        "actionRequired": {"BOOL": true}
      }
    }
  }' \
  --region "$REGION"

echo -e "${GREEN}✅ Family Event communications seeded!${NC}"

# Add some additional cross-project communications
echo -e "${BLUE}Seeding cross-project communications...${NC}"

# Insurance agent email (affects both home and family)
aws dynamodb put-item \
  --table-name "$COMMUNICATIONS_TABLE" \
  --item '{
    "PK": {"S": "COMM"},
    "SK": {"S": "COMM#comm-008"},
    "GSI1PK": {"S": "PROJECT#Home Purchase"},
    "GSI1SK": {"S": "2025-06-19T13:30:00Z"},
    "GSI2PK": {"S": "ENTITY#agent@insurance.com"},
    "GSI2SK": {"S": "2025-06-19T13:30:00Z"},
    "id": {"S": "comm-008"},
    "commType": {"S": "email"},
    "source": {"S": "Gmail"},
    "sender": {"S": "agent@insurance.com"},
    "senderName": {"S": "Lisa Thompson"},
    "subject": {"S": "Home Insurance Quote - Bundle Discount Available"},
    "content": {"S": "I have prepared your home insurance quote for the new property. Since you mentioned the family reunion, I also included information about event liability coverage. You can save 15% by bundling with your auto insurance."},
    "timestamp": {"S": "2025-06-19T13:30:00Z"},
    "project": {"S": "Home Purchase"},
    "relatedProjects": {"SS": ["Family Event"]},
    "dimensions": {
      "M": {
        "temporal": {
          "M": {
            "urgency": {"S": "medium"},
            "quoteValidUntil": {"S": "2025-07-19T13:30:00Z"}
          }
        },
        "relationship": {
          "M": {
            "connectionStrength": {"N": "0.6"},
            "frequency": {"N": "4"},
            "role": {"S": "insurance-agent"}
          }
        },
        "visual": {
          "M": {
            "hasAttachments": {"BOOL": true},
            "documentType": {"S": "pdf"},
            "visualElements": {"N": "2"}
          }
        },
        "analytical": {
          "M": {
            "category": {"S": "insurance"},
            "sentiment": {"S": "neutral"},
            "tags": {"SS": ["insurance", "quote", "bundle", "discount"]},
            "priority": {"N": "6"}
          }
        }
      }
    },
    "metadata": {
      "M": {
        "urgency": {"S": "medium"},
        "category": {"S": "insurance"},
        "hasAttachments": {"BOOL": true},
        "peopleInvolved": {"SS": ["Lisa Thompson"]},
        "actionRequired": {"BOOL": true},
        "crossProject": {"BOOL": true}
      }
    }
  }' \
  --region "$REGION"

echo -e "${GREEN}✅ Cross-project communications seeded!${NC}"

# Summary
echo
echo -e "${BLUE}=== Data Seeding Summary ===${NC}"
echo -e "${GREEN}✅ User Profile: 1 record${NC}"
echo -e "${GREEN}✅ Home Purchase: 4 communications${NC}"
echo -e "${GREEN}✅ Career Change: 2 communications${NC}"
echo -e "${GREEN}✅ Family Event: 2 communications${NC}"
echo -e "${GREEN}✅ Cross-project: 1 communication${NC}"
echo -e "${GREEN}✅ Total Communications: 9 records${NC}"
echo
echo -e "${BLUE}Sample data includes:${NC}"
echo -e "${YELLOW}• Multiple communication types (email, document, social)${NC}"
echo -e "${YELLOW}• Various urgency levels and deadlines${NC}"
echo -e "${YELLOW}• Rich dimensional data for archetype testing${NC}"
echo -e "${YELLOW}• Cross-project relationships${NC}"
echo -e "${YELLOW}• Realistic content and metadata${NC}"
echo
echo -e "${GREEN}🎉 Doc-Tales demo data seeding complete!${NC}"
echo -e "${BLUE}You can now test the application with realistic data.${NC}"
echo

exit 0
