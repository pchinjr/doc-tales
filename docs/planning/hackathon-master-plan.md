# Doc-Tales Hackathon Master Plan

## Project Overview

Doc-Tales is a personalized communications sorter for the intelligent document processing industry. The solution unifies and intelligently processes content from diverse sources (physical mail via scans, emails, and social media feeds) into a single dashboard with automated processing capabilities, designed with frictionless onboarding and personalized organization based on user communication archetypes.

## Core Value Proposition

- Frictionless onboarding for diverse data sources (documents, emails, social media)
- Archetype-based personalization that adapts the interface to user cognitive styles
- Unified inbox for all communications regardless of source
- Intelligent organization that adapts to user preferences
- Cross-channel context and relationship mapping to provide a complete picture

## 2-Week Hackathon Timeline

### Week 1: Foundation & Core Features

#### Days 1-2: Setup & Sample Data
- Set up AWS environment and core services
- Create sample dataset with cross-channel communications
- Implement basic S3 storage and DynamoDB schema
- Set up project repository and development environment

#### Days 3-4: Processing & Classification
- Implement basic document processing with Textract
- Create simplified entity extraction with Comprehend
- Build rule-based archetype classification
- Implement relationship mapping between communications

#### Days 5-7: Dashboard & Interaction
- Create base dashboard UI with React
- Implement the four archetype view templates
- Build simple interaction tracking system
- Create basic relationship visualization

### Week 2: Demo Experience & Polish

#### Days 8-9: Demo Flow
- Implement the "Time Travel Inbox" demo flow
- Create archetype detection visualization
- Build simplified adaptation mechanism
- Develop project organization features

#### Days 10-12: Integration & Testing
- Connect all components into cohesive experience
- Implement demo script automation
- Test across different scenarios
- Fix critical bugs and performance issues

#### Days 13-14: Polish & Presentation
- Add visual polish to the UI
- Create compelling presentation materials
- Record backup demo video
- Prepare talking points and Q&A responses

## Critical Path Tasks

1. **Sample Dataset Creation** (Days 1-2)
   - Create realistic dataset with 3 simultaneous life projects
   - Include emails, documents, and social media content
   - Establish cross-project relationships and overlaps

2. **Base Dashboard UI** (Days 2-4)
   - Create communication list/grid view
   - Implement detail view for individual communications
   - Build basic navigation and filtering

3. **Archetype View Templates** (Days 4-6)
   - Implement Prioritizer view (time-based organization)
   - Create Connector view (people-centric organization)
   - Build Visualizer view (spatial organization)
   - Develop Analyst view (detailed metadata organization)

4. **Interaction Tracking** (Days 6-7)
   - Track key user interactions
   - Implement rule-based archetype classification
   - Create visual indicator of detected archetype

5. **Project Organization** (Days 7-9)
   - Organize communications by project
   - Visualize cross-project elements
   - Highlight scheduling overlaps

6. **Demo Flow Implementation** (Days 9-11)
   - Create initial "overwhelmed" state
   - Implement guided interaction for archetype detection
   - Build dashboard transformation based on archetype

7. **AWS Lambda Integration** (Days 11-12)
   - Implement document processing Lambda
   - Create archetype detection Lambda
   - Build project organization Lambda

8. **Polish and Presentation** (Days 13-14)
   - Create smooth, error-free demo flow
   - Develop compelling presentation slides
   - Record backup demo video

## Sample Dataset

### Core Scenario: Life Transition Period

Our sample user is managing three simultaneous life projects:

1. **Home Purchase**: Looking for a new home in a different city
   - Property listings and viewings
   - Mortgage and financing communications
   - Inspection reports and negotiations

2. **Career Change**: Interviewing for new positions in their field
   - Job applications and descriptions
   - Interview scheduling and follow-ups
   - Offer negotiations and decisions

3. **Family Event**: Planning a family reunion/celebration
   - Venue selection and booking
   - Guest coordination and RSVPs
   - Vendor communications and arrangements

### Cross-Project Elements

To demonstrate the value of different archetype views, the dataset includes:
- Scheduling overlaps between projects
- Shared contacts involved in multiple projects
- Location relationships between project elements
- Budget considerations spanning multiple projects

## Archetype-Based Organization

### Prioritizer View
- Organizes by deadlines across all projects
- Highlights time-sensitive items
- Creates timeline views showing overlapping commitments
- Surfaces potential scheduling conflicts

### Connector View
- Organizes by people and relationships
- Shows which people are involved in multiple projects
- Highlights communication frequency with key contacts
- Creates network maps of who knows whom

### Visualizer View
- Organizes by spatial/visual relationships
- Maps home locations relative to potential job locations
- Creates mood boards for home styles and event themes
- Provides visual calendar of all events

### Analyst View
- Organizes by categories and details
- Provides comparative analysis of home options
- Creates detailed breakdowns of job offers
- Analyzes budget allocations across projects

## MVP Definition

### Core Features

1. **Sample Dataset Processing**
   - Pre-populated dataset with emails, documents, and social media content
   - Basic metadata extraction (dates, senders, subjects)
   - Simple relationship mapping between related communications

2. **Archetype Detection**
   - Ability to track basic user interactions
   - Simple classification into one of four archetypes
   - Visual indication of detected archetype
   - Ability to manually switch between archetypes

3. **Adaptive Dashboard**
   - Four distinct dashboard views (one per archetype)
   - Basic adaptation suggestions
   - Preview capability for dashboard changes
   - Consistent navigation across all views

4. **Project Organization**
   - Organization of communications by project
   - Visualization of cross-project elements
   - Ability to highlight scheduling overlaps
   - Basic filtering by project

### Demo Flow

1. **Introduction**
   - Present the problem of managing multiple complex projects simultaneously
   - Introduce the concept of communication archetypes
   - Show the initial "overwhelmed" state of communications

2. **Interaction Phase**
   - Guide the user through interacting with sample communications
   - Track and visualize the archetype detection process
   - Reveal the detected primary archetype

3. **Transformation**
   - Show the dashboard adapting to the detected archetype
   - Demonstrate how the organization changes to match cognitive preferences
   - Highlight key features of the archetype-specific view

4. **Project Management**
   - Show how the archetype-specific view makes managing multiple projects easier
   - Demonstrate how information is organized according to the user's cognitive style
   - Highlight cross-project elements like scheduling overlaps

5. **Comparison**
   - Briefly show how the same data would appear in other archetype views
   - Highlight the personalization aspect of the system
   - Demonstrate switching between views for different tasks

## Risk Management

### Top Risks and Contingencies

1. **AWS Integration Issues**
   - Risk: Integration problems with AWS services
   - Contingency: Create mock implementations that can be substituted

2. **UI Complexity**
   - Risk: Archetype views take longer than expected
   - Contingency: Reduce to two fully implemented archetypes (Prioritizer and Connector)

3. **Demo Reliability**
   - Risk: Live demo has technical issues
   - Contingency: Pre-record key demo segments as backup

4. **Scope Creep**
   - Risk: Adding features beyond critical path
   - Contingency: Daily scope review and ruthless prioritization

## Success Criteria

1. **Demo Impact**
   - Creates a "wow" reaction from judges
   - Clearly communicates the unique value proposition
   - Demonstrates technical feasibility

2. **Technical Implementation**
   - Uses AWS Lambda and serverless architecture effectively
   - Demonstrates integration of multiple AWS services
   - Shows technical competence and innovation

3. **Problem-Solution Fit**
   - Clearly addresses the problem of communication overload
   - Demonstrates a novel approach with archetype-based personalization
   - Shows potential business value
