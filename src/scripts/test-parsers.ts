import { EmailParser, RawEmail } from '../services/parsers/EmailParser';
import { DocumentParser, RawDocument } from '../services/parsers/DocumentParser';
import { SocialParser, RawSocialPost } from '../services/parsers/SocialParser';
import * as fs from 'fs';
import * as path from 'path';

// Helper function to read test data files
const readTestFile = (filename: string): string => {
  return fs.readFileSync(path.join(__dirname, '../services/parsers/__tests__/test-data', filename), 'utf-8');
};

// Helper function to read JSON test data files
const readJsonTestFile = (filename: string): any => {
  const content = fs.readFileSync(path.join(__dirname, '../services/parsers/__tests__/test-data', filename), 'utf-8');
  return JSON.parse(content);
};

async function testEmailParser() {
  console.log('\n=== Testing Email Parser ===\n');
  const parser = new EmailParser();
  
  try {
    console.log('Testing simple email...');
    const simpleEmail: RawEmail = {
      id: 'test-email-1',
      source: 'Gmail',
      raw: readTestFile('email-simple.txt')
    };
    
    const simpleResult = await parser.parseEmail(simpleEmail);
    console.log('Simple Email Result:');
    console.log(`- Subject: ${simpleResult.subject}`);
    console.log(`- Sender: ${simpleResult.senderName} <${simpleResult.sender}>`);
    console.log(`- Urgency: ${simpleResult.metadata.urgency}`);
    console.log(`- Category: ${simpleResult.metadata.category}`);
    console.log(`- Has Attachments: ${simpleResult.metadata.hasAttachments}`);
    console.log(`- Content Preview: ${simpleResult.content.substring(0, 100)}...`);
    
    console.log('\nTesting HTML email...');
    const htmlEmail: RawEmail = {
      id: 'test-email-2',
      source: 'Gmail',
      raw: readTestFile('email-html.txt')
    };
    
    const htmlResult = await parser.parseEmail(htmlEmail);
    console.log('HTML Email Result:');
    console.log(`- Subject: ${htmlResult.subject}`);
    console.log(`- Sender: ${htmlResult.senderName} <${htmlResult.sender}>`);
    console.log(`- Urgency: ${htmlResult.metadata.urgency}`);
    console.log(`- Category: ${htmlResult.metadata.category}`);
    console.log(`- Has Images: ${htmlResult.metadata.hasImages}`);
    console.log(`- Content Preview: ${htmlResult.content.substring(0, 100)}...`);
    
    console.log('\nTesting multipart email...');
    const multipartEmail: RawEmail = {
      id: 'test-email-3',
      source: 'Gmail',
      raw: readTestFile('email-multipart.txt')
    };
    
    const multipartResult = await parser.parseEmail(multipartEmail);
    console.log('Multipart Email Result:');
    console.log(`- Subject: ${multipartResult.subject}`);
    console.log(`- Sender: ${multipartResult.senderName} <${multipartResult.sender}>`);
    console.log(`- Urgency: ${multipartResult.metadata.urgency}`);
    console.log(`- Category: ${multipartResult.metadata.category}`);
    console.log(`- Has Attachments: ${multipartResult.metadata.hasAttachments}`);
    console.log(`- Attachment Count: ${multipartResult.metadata.attachmentCount}`);
    console.log(`- Content Preview: ${multipartResult.content.substring(0, 100)}...`);
    
    console.log('\nEmail Parser Tests Completed Successfully!');
  } catch (error) {
    console.error('Email Parser Test Failed:', error);
  }
}

async function testDocumentParser() {
  console.log('\n=== Testing Document Parser ===\n');
  const parser = new DocumentParser();
  
  try {
    console.log('Testing inspection report document...');
    const inspectionDoc: RawDocument = {
      id: 'doc-001',
      filename: 'Home-Inspection-Report.pdf',
      contentType: 'application/pdf',
      size: 350000,
      content: readTestFile('document-text.txt'),
      source: 'Google Drive',
      metadata: {
        title: 'Home Inspection Report',
        author: 'Robert Williams',
        authorEmail: 'rwilliams@homeinspect.com',
        dateCreated: '2025-06-03T15:20:00Z',
        dateModified: '2025-06-03T16:45:00Z',
        pageCount: 15,
        hasImages: true,
        imageCount: 12,
        tableCount: 3,
        location: '123 Main Street, Springfield'
      }
    };
    
    const inspectionResult = await parser.parseDocument(inspectionDoc);
    console.log('Inspection Report Result:');
    console.log(`- Subject: ${inspectionResult.subject}`);
    console.log(`- Author: ${inspectionResult.senderName} <${inspectionResult.sender}>`);
    console.log(`- File Type: ${inspectionResult.metadata.fileType}`);
    console.log(`- Urgency: ${inspectionResult.metadata.urgency}`);
    console.log(`- Category: ${inspectionResult.metadata.category}`);
    console.log(`- Page Count: ${inspectionResult.metadata.pageCount}`);
    console.log(`- Has Images: ${inspectionResult.metadata.hasImages}`);
    console.log(`- Content Preview: ${inspectionResult.content.substring(0, 100)}...`);
    
    console.log('\nTesting resume document...');
    const resumeDoc: RawDocument = {
      id: 'doc-002',
      filename: 'Resume-Final-Version.docx',
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 450000,
      content: readTestFile('document-resume.txt'),
      source: 'Email Attachment',
      metadata: {
        title: 'Resume - Final Version',
        author: 'John Smith',
        authorEmail: 'john.smith@example.com',
        dateCreated: '2025-05-28T11:10:00Z',
        dateModified: '2025-06-08T20:15:00Z',
        pageCount: 2,
        hasImages: false,
        imageCount: 0,
        tableCount: 1
      }
    };
    
    const resumeResult = await parser.parseDocument(resumeDoc);
    console.log('Resume Document Result:');
    console.log(`- Subject: ${resumeResult.subject}`);
    console.log(`- Author: ${resumeResult.senderName} <${resumeResult.sender}>`);
    console.log(`- File Type: ${resumeResult.metadata.fileType}`);
    console.log(`- Urgency: ${resumeResult.metadata.urgency}`);
    console.log(`- Category: ${resumeResult.metadata.category}`);
    console.log(`- Word Count: ${resumeResult.metadata.wordCount}`);
    console.log(`- Content Preview: ${resumeResult.content.substring(0, 100)}...`);
    
    console.log('\nDocument Parser Tests Completed Successfully!');
  } catch (error) {
    console.error('Document Parser Test Failed:', error);
  }
}

async function testSocialParser() {
  console.log('\n=== Testing Social Parser ===\n');
  const parser = new SocialParser();
  
  try {
    console.log('Testing Twitter post...');
    const twitterPost: RawSocialPost = readJsonTestFile('social-twitter.json');
    
    const twitterResult = await parser.parseSocialPost(twitterPost);
    console.log('Twitter Post Result:');
    console.log(`- Subject: ${twitterResult.subject}`);
    console.log(`- Author: ${twitterResult.senderName} (${twitterResult.sender})`);
    console.log(`- Platform: ${twitterResult.metadata.platform}`);
    console.log(`- Urgency: ${twitterResult.metadata.urgency}`);
    console.log(`- Category: ${twitterResult.metadata.category}`);
    console.log(`- Likes: ${twitterResult.metadata.likes}`);
    console.log(`- Hashtags: ${twitterResult.metadata.hashtags?.join(', ')}`);
    console.log(`- Has Images: ${twitterResult.metadata.hasImages}`);
    console.log(`- Content: ${twitterResult.content}`);
    
    console.log('\nTesting LinkedIn post...');
    const linkedinPost: RawSocialPost = readJsonTestFile('social-linkedin.json');
    
    const linkedinResult = await parser.parseSocialPost(linkedinPost);
    console.log('LinkedIn Post Result:');
    console.log(`- Subject: ${linkedinResult.subject}`);
    console.log(`- Author: ${linkedinResult.senderName} (${linkedinResult.sender})`);
    console.log(`- Platform: ${linkedinResult.metadata.platform}`);
    console.log(`- Urgency: ${linkedinResult.metadata.urgency}`);
    console.log(`- Category: ${linkedinResult.metadata.category}`);
    console.log(`- Likes: ${linkedinResult.metadata.likes}`);
    console.log(`- Hashtags: ${linkedinResult.metadata.hashtags?.join(', ')}`);
    console.log(`- Content Preview: ${linkedinResult.content.substring(0, 100)}...`);
    
    console.log('\nTesting Twitter reply...');
    const twitterReply: RawSocialPost = readJsonTestFile('social-twitter-reply.json');
    
    const replyResult = await parser.parseSocialPost(twitterReply);
    console.log('Twitter Reply Result:');
    console.log(`- Subject: ${replyResult.subject}`);
    console.log(`- Author: ${replyResult.senderName} (${replyResult.sender})`);
    console.log(`- Is Reply: ${replyResult.metadata.isReply}`);
    console.log(`- Reply To: ${replyResult.metadata.replyToUser}`);
    console.log(`- Mentions: ${replyResult.metadata.mentions?.join(', ')}`);
    console.log(`- Content: ${replyResult.content}`);
    
    console.log('\nSocial Parser Tests Completed Successfully!');
  } catch (error) {
    console.error('Social Parser Test Failed:', error);
  }
}

async function runAllTests() {
  console.log('=== Starting Parser Tests ===');
  
  await testEmailParser();
  await testDocumentParser();
  await testSocialParser();
  
  console.log('\n=== All Parser Tests Completed ===');
}

// Run all tests
runAllTests().catch(console.error);
