# Sample Dataset for Doc-Tales

## Overview

This document outlines the sample dataset creation for Doc-Tales, focusing on a realistic scenario where a user is managing multiple life projects simultaneously. The dataset will demonstrate how different archetype views can organize the same information to match different cognitive styles.

## Core Scenario: Life Transition Period

Our sample user is going through several major life changes simultaneously:

1. **Home Purchase**: Looking for a new home in a different city
2. **Career Change**: Interviewing for new positions in their field
3. **Family Event**: Planning a family reunion/celebration

## Dataset Structure

```json
{
  "communications": [
    {
      "id": "unique-id",
      "type": "email|document|social",
      "source": "gmail|dropbox|twitter|etc",
      "timestamp": "2025-06-01T10:30:00Z",
      "sender": {
        "name": "John Smith",
        "email": "john@example.com",
        "id": "contact-123"
      },
      "recipients": [
        {
          "name": "Jane Doe",
          "email": "jane@example.com",
          "id": "contact-456"
        }
      ],
      "subject": "Subject line",
      "content": "Main content text",
      "attachments": [
        {
          "id": "attachment-123",
          "name": "document.pdf",
          "type": "pdf",
          "size": 1024000
        }
      ],
      "metadata": {
        "urgency": "high|medium|low",
        "category": "home-purchase|career-change|family-event",
        "read": true|false,
        "flagged": true|false
      },
      "entities": [
        {
          "type": "person|organization|location|date|etc",
          "text": "John Smith",
          "position": [10, 20],
          "id": "entity-123"
        }
      ],
      "relationships": [
        {
          "type": "reply-to|references|same-thread|etc",
          "target_id": "another-communication-id"
        }
      ],
      "project": "home-purchase|career-change|family-event"
    }
  ],
  "contacts": [
    {
      "id": "contact-123",
      "name": "John Smith",
      "email": "john@example.com",
      "organization": "Acme Corp",
      "role": "Real Estate Agent",
      "projects": ["home-purchase"]
    }
  ],
  "projects": [
    {
      "id": "home-purchase",
      "name": "Home Purchase",
      "description": "Communications related to buying a new home",
      "timeline_start": "2025-05-15T00:00:00Z",
      "timeline_end": "2025-06-15T23:59:59Z",
      "key_dates": [
        {
          "name": "Mortgage Application Deadline",
          "date": "2025-06-05T23:59:59Z",
          "urgency": "high"
        }
      ]
    }
  ]
}
```

## Project Details

### 1. Home Purchase Project

**Timeline**: May 15 - June 15, 2025

**Key Communications**:
- Emails with real estate agent about property listings
- Mortgage pre-approval document from bank
- Home inspection report
- Property comparison spreadsheet
- Insurance quotes
- Closing date confirmation

**Key Contacts**:
- Sarah Johnson (Real Estate Agent)
- Michael Chen (Mortgage Broker)
- Westside Home Inspections
- First National Bank
- Reliable Home Insurance

**Key Dates**:
- May 20: Initial property viewings
- May 28: Second round of viewings
- June 5: Mortgage application deadline
- June 10: Home inspection
- June 15: Decision deadline

### 2. Career Change Project

**Timeline**: May 18 - June 20, 2025

**Key Communications**:
- Job descriptions from potential employers
- Resume and cover letter documents
- Interview scheduling emails
- Thank you emails post-interview
- Salary negotiation communications
- Reference request emails

**Key Contacts**:
- TechCorp Recruiting Team
- Innovate Inc. HR Department
- Future Systems Hiring Manager
- Professional references
- Career coach

**Key Dates**:
- May 25: Phone screening with TechCorp
- June 2: In-person interview with Innovate Inc.
- June 8: Technical assessment for Future Systems
- June 12: Follow-up interview with TechCorp
- June 18: Decision deadline for first offer

### 3. Family Event Project

**Timeline**: May 22 - June 25, 2025

**Key Communications**:
- Venue booking confirmation
- Guest list spreadsheet
- Catering quotes
- Travel arrangements for out-of-town relatives
- RSVP tracking
- Event planning checklist

**Key Contacts**:
- Lakeside Venue coordinator
- Family members
- Delicious Catering Company
- Memorable Moments Photography
- Transportation service

**Key Dates**:
- May 30: Venue confirmation deadline
- June 1: Save-the-date notifications
- June 10: Catering selection deadline
- June 15: RSVP deadline
- June 25: Event date

## Cross-Project Elements

To demonstrate the value of different archetype views, we'll include:

1. **Scheduling Overlaps**: Interview scheduled on the same day as venue visit
2. **Shared Contacts**: A family member who also works at a target company
3. **Location Relationships**: Potential homes near potential job locations
4. **Budget Considerations**: Financial decisions that span multiple projects

## Archetype-Specific Views of the Data

### Prioritizer View Highlights

- Timeline visualization with all deadlines across projects
- Urgency indicators for approaching deadlines
- Task completion tracking
- Conflict flagging for overlapping commitments

### Connector View Highlights

- People-centric organization showing who is involved in which projects
- Communication frequency visualization
- Relationship mapping between contacts
- Contact importance indicators

### Visualizer View Highlights

- Map showing geographical relationships between homes, jobs, and venue
- Visual calendar with color-coded events
- Image galleries for homes and venue options
- Visual budget allocation across projects

### Analyst View Highlights

- Detailed comparison tables for homes, jobs, and venues
- Cost breakdown analysis across all projects
- Decision criteria matrices
- Comprehensive metadata and filtering options

## Implementation Steps

1. **Create base JSON structure** for the dataset
2. **Develop realistic content** for each communication
3. **Establish relationships** between communications within each project
4. **Add cross-project relationships** to demonstrate archetype value
5. **Generate metadata** for classification and organization
6. **Create sample visualizations** for each archetype view
7. **Validate dataset** for completeness and realism

## Next Actions

1. Create the base JSON file structure
2. Develop detailed timelines for each project
3. Write content for the Home Purchase project communications
4. Establish relationships within the project
5. Repeat for remaining projects
6. Add cross-project relationships
7. Validate and finalize the dataset
