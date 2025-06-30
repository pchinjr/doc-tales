import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PrioritizerView from "../PrioritizerView";
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
  content: "Test content with some deadline information",
  metadata: {
    urgency: "medium" as const,
    category: "test"
  },
  project: "Test Project",
  ...overrides
});

describe("PrioritizerView", () => {
  beforeEach(() => {
    mockOnInteraction.mockClear();
  });

  it("renders without crashing with empty communications", () => {
    render(<PrioritizerView communications={[]} onInteraction={mockOnInteraction} />);
    expect(screen.getByText("Prioritizer View")).toBeInTheDocument();
    expect(screen.getByText("No upcoming deadlines found.")).toBeInTheDocument();
  });

  it("handles communications with missing content gracefully", () => {
    const communications = [
      createMockCommunication({ content: undefined }),
    ];

    render(<PrioritizerView communications={communications} onInteraction={mockOnInteraction} />);
    
    expect(screen.getByText("Content not available")).toBeInTheDocument();
  });

  it("sorts communications by urgency correctly", () => {
    const communications = [
      createMockCommunication({ 
        id: "1", 
        subject: "Low Priority", 
        metadata: { urgency: "low", category: "test" }
      }),
      createMockCommunication({ 
        id: "2", 
        subject: "High Priority", 
        metadata: { urgency: "high", category: "test" }
      }),
      createMockCommunication({ 
        id: "3", 
        subject: "Medium Priority", 
        metadata: { urgency: "medium", category: "test" }
      }),
    ];

    render(<PrioritizerView communications={communications} onInteraction={mockOnInteraction} />);
    
    const timelineItems = screen.getAllByText(/Priority/);
    expect(timelineItems[0]).toHaveTextContent("High Priority");
    expect(timelineItems[1]).toHaveTextContent("Medium Priority");
    expect(timelineItems[2]).toHaveTextContent("Low Priority");
  });

  it("uses _sortKey when available", () => {
    const communications = [
      createMockCommunication({ 
        id: "1", 
        subject: "Second", 
        _sortKey: "2025-06-28T14:00:00Z",
        metadata: { urgency: "high", category: "test" }
      }),
      createMockCommunication({ 
        id: "2", 
        subject: "First", 
        _sortKey: "2025-06-28T12:00:00Z",
        metadata: { urgency: "high", category: "test" }
      }),
    ];

    render(<PrioritizerView communications={communications} onInteraction={mockOnInteraction} />);
    
    const timelineItems = screen.getAllByText(/First|Second/);
    expect(timelineItems[0]).toHaveTextContent("First");
    expect(timelineItems[1]).toHaveTextContent("Second");
  });

  it("extracts deadlines from content safely", () => {
    const communications = [
      createMockCommunication({ 
        id: "1", 
        subject: "Has Deadline",
        content: "This has a deadline: tomorrow",
        metadata: { urgency: "medium", category: "test" }
      }),
      createMockCommunication({ 
        id: "2", 
        subject: "No Content",
        content: undefined,
        metadata: { urgency: "high", category: "test" }
      }),
    ];

    render(<PrioritizerView communications={communications} onInteraction={mockOnInteraction} />);
    
    // Should show deadlines section with extracted deadline
    expect(screen.getByText("Upcoming Deadlines")).toBeInTheDocument();
    expect(screen.getByText(/Has Deadline/)).toBeInTheDocument();
  });

  it("handles date click interactions", () => {
    const communications = [
      createMockCommunication({ id: "test-comm" }),
    ];

    render(<PrioritizerView communications={communications} onInteraction={mockOnInteraction} />);
    
    const dateElement = screen.getByText("6/28/2025"); // Based on mock timestamp
    fireEvent.click(dateElement);
    
    expect(mockOnInteraction).toHaveBeenCalledWith({
      type: "date_click",
      target: "test-comm",
      timestamp: expect.any(Number),
      metadata: {}
    });
  });

  it("handles person click interactions", () => {
    const communications = [
      createMockCommunication({ sender: "test@example.com", senderName: "Test Sender" }),
    ];

    render(<PrioritizerView communications={communications} onInteraction={mockOnInteraction} />);
    
    fireEvent.click(screen.getByText("From: Test Sender"));
    
    expect(mockOnInteraction).toHaveBeenCalledWith({
      type: "person_click",
      target: "test@example.com",
      timestamp: expect.any(Number),
      metadata: {}
    });
  });

  it("handles communication click interactions", () => {
    const communications = [
      createMockCommunication({ id: "test-comm" }),
    ];

    render(<PrioritizerView communications={communications} onInteraction={mockOnInteraction} />);
    
    fireEvent.click(screen.getByText("Test Subject"));
    
    expect(mockOnInteraction).toHaveBeenCalledWith({
      type: "details_view",
      target: "test-comm",
      timestamp: expect.any(Number),
      metadata: {}
    });
  });

  it("displays highlight badges correctly", () => {
    const communications = [
      createMockCommunication({ 
        id: "1",
        subject: "Urgent Item",
        _highlight: "urgent"
      }),
      createMockCommunication({ 
        id: "2",
        subject: "Important Item",
        _highlight: "important"
      }),
    ];

    render(<PrioritizerView communications={communications} onInteraction={mockOnInteraction} />);
    
    expect(screen.getByText("Urgent")).toBeInTheDocument();
    expect(screen.getByText("Important")).toBeInTheDocument();
  });
});
