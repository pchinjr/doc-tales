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
    console.log(`- Subject: ${simpleResult.subject || 'N/A'}`);
    console.log(`- Sender: ${simpleResult.senderName || 'N/A'} <${simpleResult.sender || 'N/A'}>`);
    console.log(`- Urgency: ${simpleResult.metadata?.urgency || 'N/A'}`);
    console.log(`- Category: ${simpleResult.metadata?.category || 'N/A'}`);
    console.log(`- Has Attachments: ${simpleResult.metadata?.hasAttachments || false}`);
    console.log(`- Content Preview: ${simpleResult.content?.substring(0, 100) || 'N/A'}...`);
    
    console.log('\nTesting HTML email...');
    const htmlEmail: RawEmail = {
      id: 'test-email-2',
      source: 'Gmail',
      raw: readTestFile('email-html.txt')
    };
    
    const htmlResult = await parser.parseEmail(htmlEmail);
    console.log('HTML Email Result:');
    console.log(`- Subject: ${htmlResult.subject || 'N/A'}`);
    console.log(`- Sender: ${htmlResult.senderName || 'N/A'} <${htmlResult.sender || 'N/A'}>`);
    console.log(`- Urgency: ${htmlResult.metadata?.urgency || 'N/A'}`);
    console.log(`- Category: ${htmlResult.metadata?.category || 'N/A'}`);
    console.log(`- Has Images: ${htmlResult.metadata?.hasImages || false}`);
    console.log(`- Content Preview: ${htmlResult.content?.substring(0, 100) || 'N/A'}...`);
    
    console.log('\nTesting multipart email...');
    const multipartEmail: RawEmail = {
      id: 'test-email-3',
      source: 'Gmail',
      raw: readTestFile('email-multipart.txt')
    };
    
    const multipartResult = await parser.parseEmail(multipartEmail);
    console.log('Multipart Email Result:');
    console.log(`- Subject: ${multipartResult.subject || 'N/A'}`);
    console.log(`- Sender: ${multipartResult.senderName || 'N/A'} <${multipartResult.sender || 'N/A'}>`);
    console.log(`- Urgency: ${multipartResult.metadata?.urgency || 'N/A'}`);
    console.log(`- Category: ${multipartResult.metadata?.category || 'N/A'}`);
    console.log(`- Has Attachments: ${multipartResult.metadata?.hasAttachments || false}`);
    console.log(`- Attachment Count: ${multipartResult.metadata?.attachmentCount || 0}`);
    console.log(`- Content Preview: ${multipartResult.content?.substring(0, 100) || 'N/A'}...`);
    
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
    console.log(`- Subject: ${inspectionResult.subject || 'N/A'}`);
    console.log(`- Author: ${inspectionResult.senderName || 'N/A'} <${inspectionResult.sender || 'N/A'}>`);
    console.log(`- File Type: ${inspectionResult.metadata?.fileType || 'N/A'}`);
    console.log(`- Urgency: ${inspectionResult.metadata?.urgency || 'N/A'}`);
    console.log(`- Category: ${inspectionResult.metadata?.category || 'N/A'}`);
    console.log(`- Page Count: ${inspectionResult.metadata?.pageCount || 'N/A'}`);
    console.log(`- Has Images: ${inspectionResult.metadata?.hasImages || false}`);
    console.log(`- Content Preview: ${inspectionResult.content?.substring(0, 100) || 'N/A'}...`);
    
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
    console.log(`- Subject: ${resumeResult.subject || 'N/A'}`);
    console.log(`- Author: ${resumeResult.senderName || 'N/A'} <${resumeResult.sender || 'N/A'}>`);
    console.log(`- File Type: ${resumeResult.metadata?.fileType || 'N/A'}`);
    console.log(`- Urgency: ${resumeResult.metadata?.urgency || 'N/A'}`);
    console.log(`- Category: ${resumeResult.metadata?.category || 'N/A'}`);
    console.log(`- Word Count: ${resumeResult.metadata?.wordCount || 'N/A'}`);
    console.log(`- Content Preview: ${resumeResult.content?.substring(0, 100) || 'N/A'}...`);
    
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
    console.log(`- Subject: ${twitterResult.subject || 'N/A'}`);
    console.log(`- Author: ${twitterResult.senderName || 'N/A'} (${twitterResult.sender || 'N/A'})`);
    console.log(`- Platform: ${twitterResult.metadata?.platform || 'N/A'}`);
    console.log(`- Urgency: ${twitterResult.metadata?.urgency || 'N/A'}`);
    console.log(`- Category: ${twitterResult.metadata?.category || 'N/A'}`);
    console.log(`- Likes: ${twitterResult.metadata?.likes || 0}`);
    console.log(`- Hashtags: ${twitterResult.metadata?.hashtags?.join(', ') || 'None'}`);
    console.log(`- Has Images: ${twitterResult.metadata?.hasImages || false}`);
    console.log(`- Content: ${twitterResult.content || 'N/A'}`);
    
    console.log('\nTesting LinkedIn post...');
    const linkedinPost: RawSocialPost = readJsonTestFile('social-linkedin.json');
    
    const linkedinResult = await parser.parseSocialPost(linkedinPost);
    console.log('LinkedIn Post Result:');
    console.log(`- Subject: ${linkedinResult.subject || 'N/A'}`);
    console.log(`- Author: ${linkedinResult.senderName || 'N/A'} (${linkedinResult.sender || 'N/A'})`);
    console.log(`- Platform: ${linkedinResult.metadata?.platform || 'N/A'}`);
    console.log(`- Urgency: ${linkedinResult.metadata?.urgency || 'N/A'}`);
    console.log(`- Category: ${linkedinResult.metadata?.category || 'N/A'}`);
    console.log(`- Likes: ${linkedinResult.metadata?.likes || 0}`);
    console.log(`- Hashtags: ${linkedinResult.metadata?.hashtags?.join(', ') || 'None'}`);
    console.log(`- Content Preview: ${linkedinResult.content?.substring(0, 100) || 'N/A'}...`);
    
    console.log('\nTesting Twitter reply...');
    const twitterReply: RawSocialPost = readJsonTestFile('social-twitter-reply.json');
    
    const replyResult = await parser.parseSocialPost(twitterReply);
    console.log('Twitter Reply Result:');
    console.log(`- Subject: ${replyResult.subject || 'N/A'}`);
    console.log(`- Author: ${replyResult.senderName || 'N/A'} (${replyResult.sender || 'N/A'})`);
    console.log(`- Is Reply: ${replyResult.metadata?.isReply || false}`);
    console.log(`- Reply To: ${replyResult.metadata?.replyToUser || 'N/A'}`);
    console.log(`- Mentions: ${replyResult.metadata?.mentions?.join(', ') || 'None'}`);
    console.log(`- Content: ${replyResult.content || 'N/A'}`);
    
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
