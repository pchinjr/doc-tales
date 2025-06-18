import React, { useState } from "react";
import { EmailParser, RawEmail } from "../services/parsers/EmailParser";
import { DocumentParser, RawDocument } from "../services/parsers/DocumentParser";
import { SocialParser, RawSocialPost } from "../services/parsers/SocialParser";

export const ParserTester: React.FC = () => {
  // Email parser state
  const [emailInput, setEmailInput] = useState("");
  const [emailResult, setEmailResult] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  
  // Document parser state
  const [documentInput, setDocumentInput] = useState("");
  const [documentFilename, setDocumentFilename] = useState("document.txt");
  const [documentResult, setDocumentResult] = useState("");
  const [documentLoading, setDocumentLoading] = useState(false);
  
  // Social parser state
  const [socialInput, setSocialInput] = useState("");
  const [socialResult, setSocialResult] = useState("");
  const [socialLoading, setSocialLoading] = useState(false);
  
  const testEmailParser = async () => {
    setEmailLoading(true);
    try {
      const parser = new EmailParser();
      const rawEmail: RawEmail = {
        id: "test-email",
        source: "Gmail",
        raw: emailInput
      };
      
      const result = await parser.parseEmail(rawEmail);
      setEmailResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setEmailResult(`Error: ${error}`);
    } finally {
      setEmailLoading(false);
    }
  };
  
  const testDocumentParser = async () => {
    setDocumentLoading(true);
    try {
      const parser = new DocumentParser();
      const rawDocument: RawDocument = {
        id: "test-document",
        filename: documentFilename,
        contentType: "text/plain",
        size: documentInput.length,
        content: documentInput,
        source: "Google Drive"
      };
      
      const result = await parser.parseDocument(rawDocument);
      setDocumentResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setDocumentResult(`Error: ${error}`);
    } finally {
      setDocumentLoading(false);
    }
  };
  
  const testSocialParser = async () => {
    setSocialLoading(true);
    try {
      const parser = new SocialParser();
      let rawPost: RawSocialPost;
      
      try {
        // Try to parse as JSON
        rawPost = JSON.parse(socialInput);
      } catch (e) {
        // If not valid JSON, create a simple Twitter post
        rawPost = {
          id: "test-post",
          platform: "Twitter",
          timestamp: new Date().toISOString(),
          author: {
            id: "user-001",
            name: "Test User",
            username: "@testuser"
          },
          content: socialInput
        };
      }
      
      const result = await parser.parseSocialPost(rawPost);
      setSocialResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setSocialResult(`Error: ${error}`);
    } finally {
      setSocialLoading(false);
    }
  };
  
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Parser Tester</h1>
      
      <div style={{ marginBottom: "40px" }}>
        <h2>Email Parser</h2>
        <div>
          <textarea 
            rows={10} 
            cols={80} 
            value={emailInput} 
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Paste raw email here..."
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>
        <div>
          <button 
            onClick={testEmailParser} 
            disabled={emailLoading || !emailInput}
            style={{ padding: "8px 16px", marginBottom: "10px" }}
          >
            {emailLoading ? "Testing..." : "Test Email Parser"}
          </button>
        </div>
        
        <h3>Result:</h3>
        <pre style={{ 
          backgroundColor: "#f5f5f5", 
          padding: "10px", 
          border: "1px solid #ddd",
          borderRadius: "4px",
          overflow: "auto",
          maxHeight: "300px"
        }}>
          {emailResult || "No result yet"}
        </pre>
      </div>
      
      <div style={{ marginBottom: "40px" }}>
        <h2>Document Parser</h2>
        <div style={{ marginBottom: "10px" }}>
          <label>
            Filename:
            <input 
              type="text" 
              value={documentFilename} 
              onChange={(e) => setDocumentFilename(e.target.value)}
              style={{ marginLeft: "10px", padding: "8px", width: "300px" }}
            />
          </label>
        </div>
        <div>
          <textarea 
            rows={10} 
            cols={80} 
            value={documentInput} 
            onChange={(e) => setDocumentInput(e.target.value)}
            placeholder="Paste document content here..."
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>
        <div>
          <button 
            onClick={testDocumentParser} 
            disabled={documentLoading || !documentInput}
            style={{ padding: "8px 16px", marginBottom: "10px" }}
          >
            {documentLoading ? "Testing..." : "Test Document Parser"}
          </button>
        </div>
        
        <h3>Result:</h3>
        <pre style={{ 
          backgroundColor: "#f5f5f5", 
          padding: "10px", 
          border: "1px solid #ddd",
          borderRadius: "4px",
          overflow: "auto",
          maxHeight: "300px"
        }}>
          {documentResult || "No result yet"}
        </pre>
      </div>
      
      <div style={{ marginBottom: "40px" }}>
        <h2>Social Parser</h2>
        <div>
          <textarea 
            rows={10} 
            cols={80} 
            value={socialInput} 
            onChange={(e) => setSocialInput(e.target.value)}
            placeholder="Paste social post content or JSON here..."
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>
        <div>
          <button 
            onClick={testSocialParser} 
            disabled={socialLoading || !socialInput}
            style={{ padding: "8px 16px", marginBottom: "10px" }}
          >
            {socialLoading ? "Testing..." : "Test Social Parser"}
          </button>
        </div>
        
        <h3>Result:</h3>
        <pre style={{ 
          backgroundColor: "#f5f5f5", 
          padding: "10px", 
          border: "1px solid #ddd",
          borderRadius: "4px",
          overflow: "auto",
          maxHeight: "300px"
        }}>
          {socialResult || "No result yet"}
        </pre>
      </div>
    </div>
  );
};
