# Demo Implementation Guide

## Overview

This document provides a comprehensive guide for implementing the Doc-Tales demo for the AWS Lambda Hackathon. It covers the sample dataset design, demo flow, and technical implementation details.

## Sample Dataset Design

### Core Scenario: Life Transition Period

Our sample user is managing three simultaneous life projects:

1. **Home Purchase Project**
   - Timeline: May 15 - June 15, 2025
   - Key Communications:
     - Emails with real estate agent about property listings
     - Mortgage pre-approval document from bank
     - Home inspection report
     - Property comparison spreadsheet
     - Insurance quotes
   - Key Contacts:
     - Sarah Johnson (Real Estate Agent)
     - Michael Chen (Mortgage Broker)
     - Westside Home Inspections
   - Key Dates:
     - May 20: Initial property viewings
     - June 5: Mortgage application deadline
     - June 10: Home inspection

2. **Career Change Project**
   - Timeline: May 18 - June 20, 2025
   - Key Communications:
     - Job descriptions from potential employers
     - Resume and cover letter documents
     - Interview scheduling emails
     - Thank you emails post-interview
     - Salary negotiation communications
   - Key Contacts:
     - TechCorp Recruiting Team
     - Innovate Inc. HR Department
     - Future Systems Hiring Manager
   - Key Dates:
     - May 25: Phone screening with TechCorp
     - June 2: In-person interview with Innovate Inc.
     - June 8: Technical assessment for Future Systems

3. **Family Event Project**
   - Timeline: May 22 - June 25, 2025
   - Key Communications:
     - Venue booking confirmation
     - Guest list spreadsheet
     - Catering quotes
     - Travel arrangements for out-of-town relatives
     - RSVP tracking
   - Key Contacts:
     - Lakeside Venue coordinator
     - Family members
     - Delicious Catering Company
   - Key Dates:
     - May 30: Venue confirmation deadline
     - June 10: Catering selection deadline
     - June 15: RSVP deadline

### Cross-Project Elements

To demonstrate the value of different archetype views, we'll include:
- Scheduling overlaps (interview on same day as venue visit)
- Shared contacts (family member who works at target company)
- Location relationships (potential homes near potential job locations)
- Budget considerations (financial decisions spanning multiple projects)

## Demo Flow Implementation

### 1. Initial State: Information Overload

**UI Components:**
- Chronological list of all communications
- Basic filtering options (unused)
- Simple search functionality
- Overwhelming amount of information

**Technical Implementation:**
- Load all communications from the sample dataset
- Display in simple chronological order
- Minimal organization or categorization
- No relationship indicators

### 2. Archetype Detection Phase

**UI Components:**
- Interactive communications list
- Clickable items with detailed view
- Subtle tracking indicator
- Archetype confidence display

**Technical Implementation:**
- Track user interactions:
  - Which items they open
  - How they sort/filter
  - What details they focus on
- Apply rule-based classification:
  - Prioritizer: Focuses on dates, deadlines, urgency
  - Connector: Focuses on people, relationships, networks
  - Visualizer: Focuses on images, locations, visual elements
  - Analyst: Focuses on details, categories, comparisons
- Update archetype confidence display in real-time

### 3. Personalized Transformation

**UI Components:**
- Transformation animation
- Archetype-specific layout
- Reorganized information
- New navigation options

**Technical Implementation:**
- Apply archetype-specific template:
  - Prioritizer: Timeline view with urgency indicators
  - Connector: People-centric view with relationship maps
  - Visualizer: Visual boards with spatial organization
  - Analyst: Detailed tables with comprehensive metadata
- Reorganize the same data according to archetype preferences
- Highlight key elements based on archetype

### 4. Project Management Enhancement

**UI Components:**
- Project organization tools
- Cross-project visualization
- Scheduling conflict indicators
- Budget allocation view

**Technical Implementation:**
- Implement project-based organization
- Create cross-project visualizations:
  - Prioritizer: Timeline with all project deadlines
  - Connector: Network showing people involved in multiple projects
  - Visualizer: Map showing locations across projects
  - Analyst: Comparison tables for project elements
- Highlight scheduling conflicts and overlaps

### 5. Comparative View

**UI Components:**
- Archetype switcher
- Split-screen comparison
- Task-specific view recommendations
- Personalization controls

**Technical Implementation:**
- Allow manual switching between archetype views
- Implement split-screen comparison mode
- Create task-specific view recommendations
- Provide personalization options

## Technical Implementation

### 1. Sample Dataset Creation

**Implementation Steps:**
1. Create JSON structure for communications, contacts, and projects
2. Develop realistic content for each communication
3. Establish relationships within and across projects
4. Generate metadata for classification and organization
5. Store in S3 for easy access

**Initial API for Data Ingestion**
1. Define Dimension Schema - Create TypeScript interfaces for temporal, relationship, visual, and analytical dimensions
2. Build Unified Communication Model - Extend current model to include dimension fields and source-specific attributes
3. Implement Source Adapters - Create adapters for email, documents, and social media with dimension extraction
4. Develop Dimension Extraction Utilities - Build simple rules-based extractors for each dimension type
5. Create Mock Data Service - Implement a service that provides dimension-rich sample data for all sources
6. Connect to Archetype Views - Update UI components to leverage dimension data in archetype-specific ways
7. Add Simple Configuration UI - Create minimal UI for enabling/disabling sources and viewing extracted dimensions
8. Build Demo Flow - Create a guided tour showing how the same data appears differently based on dimensions and archetypes

**AWS Services:**
- S3 for dataset storage
- Lambda for dataset loading and processing

### 2. User Interface Development

**Implementation Steps:**
1. Create base React application
2. Implement communication list and detail views
3. Develop archetype-specific templates
4. Build interaction tracking components
5. Create transformation animations

**Key Components:**
- React for frontend framework
- Material UI for component library
- D3.js for visualizations
- React Router for navigation

### 3. Interaction Tracking

**Implementation Steps:**
1. Create event listeners for user interactions
2. Implement tracking API with API Gateway and Lambda
3. Develop rule-based archetype classification
4. Build real-time confidence display

**AWS Services:**
- API Gateway for tracking API
- Lambda for processing interactions
- DynamoDB for storing user profiles

### 4. Archetype-Based Organization

**Implementation Steps:**
1. Implement archetype-specific data transformations
2. Create visualization components for each archetype
3. Build project organization features
4. Develop cross-project visualization tools

**AWS Services:**
- Lambda for data transformation
- API Gateway for data retrieval
- DynamoDB for storing organization preferences

### 5. Demo Orchestration

**Implementation Steps:**
1. Create guided tour experience
2. Implement demo state management
3. Build fallback mechanisms for reliability
4. Develop presentation mode

**Key Components:**
- React context for state management
- Tour library for guided experience
- Local storage for demo state persistence

## Implementation Plan

### Days 1-2: Sample Dataset
- Create JSON structure
- Develop content for Home Purchase project
- Develop content for Career Change project
- Develop content for Family Event project
- Establish cross-project relationships

### Days 3-5: Base UI
- Set up React application
- Create communication list view
- Implement detail view
- Build basic navigation
- Implement search and filtering

### Days 6-8: Archetype Views
- Implement Prioritizer view
- Create Connector view
- Build Visualizer view
- Develop Analyst view
- Create archetype switching mechanism

### Days 9-11: Interaction & Adaptation
- Implement interaction tracking
- Build archetype detection
- Create transformation animations
- Develop project organization features
- Implement cross-project visualization

### Days 12-14: Polish & Presentation
- Refine UI and animations
- Optimize performance
- Create guided tour
- Develop presentation materials
- Test and debug

## Success Metrics

1. **Demo Flow Reliability**
   - Demo runs without errors
   - All features work as expected
   - Transitions are smooth and impressive

2. **Archetype Detection Accuracy**
   - System correctly identifies user archetype within 5-7 interactions
   - Classification rules work consistently
   - Confidence display accurately reflects user behavior

3. **Visual Impact**
   - Transformation creates "wow" moment
   - Archetype views are visually distinct
   - Project organization is clear and intuitive

4. **Technical Implementation**
   - AWS services are used effectively
   - Performance is responsive
   - Code is well-organized and maintainable
