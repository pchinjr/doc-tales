# Doc-Tales Hackathon Demo Script

## Setup (30 seconds)
**Scene**: Multiple browser tabs open showing email, Slack, documents
**Narrator**: "Meet Sarah, a project manager drowning in communications. 47 emails, 23 Slack messages, 12 documents - all demanding attention. Which ones actually matter?"

## Act 1: The Problem (30 seconds)
**Show**: Cluttered inbox, missed deadlines, important messages buried
**Narrator**: "Traditional solutions require dedicated servers, manual sorting, and still miss the context that makes communications truly important."

## Act 2: Lambda-Powered Intelligence (2 minutes)

### Real-Time Processing Demo
**Action**: Upload a document, send an email, post a message
**Show**: CloudWatch dashboard with Lambda functions firing
**Narrator**: "Watch as AWS Lambda functions process each communication in real-time - no servers to manage, infinite scale."

**Lambda Functions in Action:**
1. **Ingestion Lambda** - "Normalizes data from any source"
2. **Dimension Extraction Lambda** - "Uses AWS Comprehend to understand content, sentiment, and urgency"
3. **ML Enhancement Lambda** - "Extracts key insights, action items, and priority scores"
4. **Personalization Lambda** - "Adapts presentation to user's cognitive style"

### ML Transformations Showcase
**Show**: Side-by-side before/after
- **Before**: Raw email about "Budget review meeting tomorrow at 2pm. Please bring Q3 numbers and Sarah's analysis."
- **After**: 
  - Priority Score: 85/100 (HIGH)
  - Sentiment: NEUTRAL
  - Key People: Sarah
  - Action Items: "Bring Q3 numbers", "Bring Sarah's analysis"
  - Topic: Finance/Meeting
  - Deadline: Tomorrow 2pm

## Act 3: Archetype Magic (1 minute)

### Same Data, Three Presentations
**Communication**: "Project Alpha is 2 weeks behind schedule. Budget overrun of $15K. Need immediate action plan."

**Analytical User View:**
- Priority Score: 92/100
- Budget Impact: +$15,000 (15% over)
- Timeline Delay: 14 days
- Risk Level: HIGH
- Trend Analysis: Declining performance

**Creative User View:**
- Mood: ⚠️ Urgent Attention Needed
- Visual: Red warning indicators
- Story: "Project Alpha needs rescue"
- Emotional Context: Stress/Urgency
- Visual Summary: Progress bar at 70%

**Practical User View:**
- ✅ Immediate Actions:
  - [ ] Create action plan
  - [ ] Review budget allocation
  - [ ] Schedule team meeting
- 👥 Key Contacts: Project Alpha team
- ⏰ Deadline: ASAP
- 📊 Next Steps: Budget review → Action plan → Team alignment

## Act 4: Business Impact (45 seconds)

### Cost Comparison
**Traditional Solution:**
- Always-on servers: $500/month
- Manual processing: 2 hours/day
- Missed priorities: Countless

**Doc-Tales with Lambda:**
- Serverless cost: $15/month
- Automated processing: Real-time
- Zero missed priorities: Priceless

### Scale Demonstration
**Show**: CloudWatch metrics
- "From 1 user to 10,000 users"
- "Lambda automatically scales"
- "Pay only for what you use"

## Closing Hook (15 seconds)
**Show**: Clean, organized dashboard with intelligent priorities
**Narrator**: "Doc-Tales: Where AWS Lambda meets human intelligence. Transform information chaos into actionable clarity."

---

## Technical Demo Points to Emphasize:

1. **Event-Driven Architecture**: Show S3 → Lambda → DynamoDB flow
2. **AWS Service Integration**: Comprehend, Bedrock, CloudWatch
3. **Real-Time Processing**: Sub-second response times
4. **Intelligent Automation**: ML-powered insights without human intervention
5. **Cost Efficiency**: Serverless economics vs traditional infrastructure
6. **Scalability**: Auto-scaling demonstration

## Demo Data Suggestions:

### High-Priority Email:
```
Subject: URGENT: Client presentation moved to tomorrow 9am
Body: Hi team, the Johnson & Associates presentation has been moved to tomorrow at 9am. We need the final slides, budget projections, and Sarah needs to prepare the demo. This is a $2M deal - we cannot miss this.
```

### Medium-Priority Document:
```
Title: Q3 Performance Review
Content: Overall performance metrics show 15% growth in user engagement. Revenue targets met at 102%. Areas for improvement include customer support response times and mobile app stability.
```

### Low-Priority Social:
```
Platform: Slack
Message: Great job everyone on the product launch! Pizza party Friday at 5pm to celebrate. 🍕
```

Each will demonstrate different ML processing results and archetype adaptations.
