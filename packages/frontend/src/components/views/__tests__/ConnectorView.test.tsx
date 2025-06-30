import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConnectorView from "../ConnectorView";
import { Communication } from "@doc-tales/common";

// Mock CommunicationDetail component
jest.mock("../../CommunicationDetail", () => {
  return function MockCommunicationDetail({ onClose }: { onClose: () => void }) {
    return (
      <div data-testid="communication-detail">
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

const mockOnInteraction = jest.fn();

const createMockCommunication = (overrides: Partial<Communication> = {}): Communication => ({
  id: "test-id",
  commType: "email",
  timestamp: "2025-06-28T12:00:00Z",
  sender: "test@example.com",
  senderName: "Test Sender",
  subject: "Test Subject",
  content: "Test content",
  metadata: {
    urgency: "medium" as const,
    category: "test"
  },
  project: "Test Project",
  ...overrides
});

describe("ConnectorView", () => {
  beforeEach(() => {
    mockOnInteraction.mockClear();
  });

  it("renders without crashing with empty communications", () => {
    render(<ConnectorView communications={[]} onInteraction={mockOnInteraction} />);
    expect(screen.getByText("Connector View")).toBeInTheDocument();
  });

  it("handles communications with missing senderName gracefully", () => {
    const communications = [
      createMockCommunication({ senderName: undefined, sender: "test@example.com" }),
    ];

    render(<ConnectorView communications={communications} onInteraction={mockOnInteraction} />);
    
    // Should show sender email when senderName is missing
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    // Avatar should show first letter of sender
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("handles communications with missing sender gracefully", () => {
    const communications = [
      createMockCommunication({ sender: undefined as any, senderName: undefined }),
    ];

    render(<ConnectorView communications={communications} onInteraction={mockOnInteraction} />);
    
    // Should show fallback text
    expect(screen.getByText("Unknown Sender")).toBeInTheDocument();
    // Avatar should show 'U' for unknown
    expect(screen.getByText("U")).toBeInTheDocument();
  });

  it("handles communications with missing content gracefully", () => {
    const communications = [
      createMockCommunication({ content: undefined }),
    ];

    render(<ConnectorView communications={communications} onInteraction={mockOnInteraction} />);
    
    // Click on person to show communications
    fireEvent.click(screen.getByText("Test Sender"));
    
    // Should show fallback text for missing content
    expect(screen.getByText("Content not available")).toBeInTheDocument();
  });

  it("groups communications by sender correctly", () => {
    const communications = [
      createMockCommunication({ id: "1", sender: "alice@example.com", senderName: "Alice" }),
      createMockCommunication({ id: "2", sender: "bob@example.com", senderName: "Bob" }),
      createMockCommunication({ id: "3", sender: "alice@example.com", senderName: "Alice" }),
    ];

    render(<ConnectorView communications={communications} onInteraction={mockOnInteraction} />);
    
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    
    // Alice should have 2 messages, Bob should have 1
    expect(screen.getByText("Messages: 2")).toBeInTheDocument();
    expect(screen.getByText("Messages: 1")).toBeInTheDocument();
  });

  it("handles person click interactions", () => {
    const communications = [
      createMockCommunication({ sender: "test@example.com", senderName: "Test Sender" }),
    ];

    render(<ConnectorView communications={communications} onInteraction={mockOnInteraction} />);
    
    fireEvent.click(screen.getByText("Test Sender"));
    
    expect(mockOnInteraction).toHaveBeenCalledWith({
      type: "person_click",
      target: "test@example.com",
      timestamp: expect.any(Number),
      metadata: {}
    });
  });

  it("handles communication click interactions", () => {
    const communications = [
      createMockCommunication({ id: "test-comm", sender: "test@example.com", senderName: "Test Sender" }),
    ];

    render(<ConnectorView communications={communications} onInteraction={mockOnInteraction} />);
    
    // First click person to show communications
    fireEvent.click(screen.getByText("Test Sender"));
    
    // Then click on the communication
    fireEvent.click(screen.getByText("Test Subject"));
    
    expect(mockOnInteraction).toHaveBeenCalledWith({
      type: "details_view",
      target: "test-comm",
      timestamp: expect.any(Number),
      metadata: {}
    });
  });

  it("sorts senders by highlight status and message count", () => {
    const communications = [
      createMockCommunication({ 
        id: "1", 
        sender: "normal@example.com", 
        senderName: "Normal User",
        _highlight: undefined 
      }),
      createMockCommunication({ 
        id: "2", 
        sender: "important@example.com", 
        senderName: "Important User",
        _highlight: "relationship" 
      }),
    ];

    render(<ConnectorView communications={communications} onInteraction={mockOnInteraction} />);
    
    const personCards = screen.getAllByRole("button");
    // Important user should come first due to highlight
    expect(personCards[0]).toHaveTextContent("Important User");
  });
});
