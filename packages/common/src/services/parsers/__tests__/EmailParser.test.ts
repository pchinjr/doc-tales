import { EmailParser, RawEmail } from '../EmailParser';
import * as fs from 'fs';
import * as path from 'path';

describe('EmailParser', () => {
  const parser = new EmailParser();
  
  // Helper function to read test data files
  const readTestFile = (filename: string): string => {
    return fs.readFileSync(path.join(__dirname, 'test-data', filename), 'utf-8');
  };
  
  test('parses a simple email correctly', async () => {
    const rawEmail: RawEmail = {
      id: 'test-email-1',
      source: 'Gmail',
      raw: readTestFile('email-simple.txt')
    };
    
    const result = await parser.parseEmail(rawEmail);
    
    expect(result.id).toBe('test-email-1');
    expect(result.commType).toBe('email');
    expect(result.source).toBe('Gmail');
    expect(result.subject).toBe('Mortgage Pre-Approval Update');
    expect(result.sender).toBe('sarah.johnson@bankofamerica.com');
    expect(result.senderName).toBe('Sarah Johnson');
    expect(result.content).toContain('Good news! Your mortgage pre-approval has been processed');
    expect(result.content).toContain('interest rate of 3.75%');
    expect(result.metadata.urgency).toBe('high');
    expect(result.metadata.category).toBeDefined();
    expect(result.metadata.hasAttachments).toBe(true);
  });
  
  test('parses an HTML email correctly', async () => {
    const rawEmail: RawEmail = {
      id: 'test-email-2',
      source: 'Gmail',
      raw: readTestFile('email-html.txt')
    };
    
    const result = await parser.parseEmail(rawEmail);
    
    expect(result.id).toBe('test-email-2');
    expect(result.subject).toBe('Interview Confirmation');
    expect(result.sender).toBe('mchen@techcorp.com');
    expect(result.senderName).toBe('Michael Chen');
    expect(result.content).toContain('Senior Developer');
    expect(result.content).toContain('Monday at 10:00 AM');
    expect(result.content).not.toContain('<html>');
    expect(result.content).not.toContain('<body>');
    expect(result.metadata.hasImages).toBe(true);
  });
  
  test('parses a multipart email correctly', async () => {
    const rawEmail: RawEmail = {
      id: 'test-email-3',
      source: 'Gmail',
      raw: readTestFile('email-multipart.txt')
    };
    
    const result = await parser.parseEmail(rawEmail);
    
    expect(result.id).toBe('test-email-3');
    expect(result.subject).toBe('Family Reunion Planning');
    expect(result.sender).toBe('lisa.family@gmail.com');
    expect(result.senderName).toBe('Aunt Lisa');
    expect(result.content).toContain('family reunion');
    expect(result.content).toContain('July 15th');
    expect(result.metadata.hasAttachments).toBe(true);
    expect(result.metadata.attachmentCount).toBe(1);
    if (result.attachments) {
      expect(result.attachments[0].filename).toBe('family-reunion-location.pdf');
      expect(result.attachments[0].contentType).toBe('application/pdf');
    }
  });
  
  test('handles emails with missing fields', async () => {
    const rawEmail: RawEmail = {
      id: 'test-email-4',
      source: 'Gmail',
      raw: 'Subject: No From Field\n\nThis email has no From field.'
    };
    
    const result = await parser.parseEmail(rawEmail);
    
    expect(result.id).toBe('test-email-4');
    expect(result.subject).toBe('No From Field');
    expect(result.sender).toBe('');
    expect(result.senderName).toBe('');
    expect(result.content).toBe('This email has no From field.');
  });
  
  test('determines urgency correctly', async () => {
    // High urgency email
    const highUrgencyEmail: RawEmail = {
      id: 'urgent-email',
      source: 'Gmail',
      raw: 'From: Test <test@example.com>\nSubject: URGENT: Action Required\n\nThis needs immediate attention!'
    };
    
    const highResult = await parser.parseEmail(highUrgencyEmail);
    expect(highResult.metadata.urgency).toBe('high');
    
    // Low urgency email
    const lowUrgencyEmail: RawEmail = {
      id: 'low-urgency-email',
      source: 'Gmail',
      raw: 'From: Test <test@example.com>\nSubject: FYI: Information\n\nJust for your information, no rush.'
    };
    
    const lowResult = await parser.parseEmail(lowUrgencyEmail);
    expect(lowResult.metadata.urgency).toBe('low');
    
    // Medium urgency (default)
    const mediumUrgencyEmail: RawEmail = {
      id: 'medium-urgency-email',
      source: 'Gmail',
      raw: 'From: Test <test@example.com>\nSubject: Regular Email\n\nThis is a regular email.'
    };
    
    const mediumResult = await parser.parseEmail(mediumUrgencyEmail);
    expect(mediumResult.metadata.urgency).toBe('medium');
  });
  
  test('determines category correctly', async () => {
    // Finance category
    const financeEmail: RawEmail = {
      id: 'finance-email',
      source: 'Gmail',
      raw: 'From: Bank <bank@example.com>\nSubject: Invoice Payment\n\nYour invoice #12345 has been paid.'
    };
    
    const financeResult = await parser.parseEmail(financeEmail);
    expect(financeResult.metadata.category).toBe('finance');
    
    // Planning category
    const planningEmail: RawEmail = {
      id: 'planning-email',
      source: 'Gmail',
      raw: 'From: Organizer <organizer@example.com>\nSubject: Meeting Schedule\n\nLet\'s schedule a meeting for next week.'
    };
    
    const planningResult = await parser.parseEmail(planningEmail);
    expect(planningResult.metadata.category).toBe('planning');
  });
  
  test('handles malformed emails gracefully', async () => {
    const malformedEmail: RawEmail = {
      id: 'malformed-email',
      source: 'Gmail',
      raw: 'This is not a properly formatted email'
    };
    
    const result = await parser.parseEmail(malformedEmail);
    
    expect(result.id).toBe('malformed-email');
    expect(result.subject).toBe('(No Subject)');
    expect(result.content).toBe('This is not a properly formatted email');
  });
});
