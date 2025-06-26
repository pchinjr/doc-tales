// Quick test script for ML enhancements
const testCommunication = {
  id: "demo-001",
  timestamp: new Date().toISOString(),
  type: "email",
  subject: "URGENT: Client presentation moved to tomorrow 9am",
  content: "Hi team, the Johnson & Associates presentation has been moved to tomorrow at 9am. We need the final slides, budget projections, and Sarah needs to prepare the demo. This is a $2M deal - we cannot miss this. Please confirm you can attend and bring all necessary materials.",
  metadata: {
    urgency: "high"
  },
  sender: "project.manager@company.com",
  recipients: ["team@company.com"]
};

console.log("Test Communication:", JSON.stringify(testCommunication, null, 2));
console.log("\nExpected ML Results:");
console.log("- Priority Score: 85-95 (HIGH)");
console.log("- Sentiment: NEUTRAL/NEGATIVE");
console.log("- Action Items: 'confirm attendance', 'bring materials', 'prepare demo'");
console.log("- People: Sarah, Johnson & Associates");
console.log("- Topics: Meeting, Finance");
console.log("- Urgency Score: 90+ (tomorrow deadline)");
