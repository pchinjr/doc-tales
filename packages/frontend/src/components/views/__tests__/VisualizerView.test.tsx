import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import VisualizerView from "../VisualizerView";
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

describe("VisualizerView", () => {
  beforeEach(() => {
    mockOnInteraction.mockClear();
  });

  it("renders without crashing with empty communications", () => {
    render(<VisualizerView communications={[]} onInteraction={mockOnInteraction} />);
    expect(screen.getByText("Visualizer View")).toBeInTheDocument();
  });

  it("handles communications with missing content gracefully", () => {
    const communications = [
      createMockCommunication({ content: undefined }),
    ];

    render(<VisualizerView communications={communications} onInteraction={mockOnInteraction} />);
    
    expect(screen.getByText("Content not available")).toBeInTheDocument();
  });

  it("groups communications by project correctly", () => {
    const communications = [
      createMockCommunication({ id: "1", project: "Project A" }),
      createMockCommunication({ id: "2", project: "Project B" }),
      createMockCommunication({ id: "3", project: "Project A" }),
    ];

    render(<VisualizerView communications={communications} onInteraction={mockOnInteraction} />);
    
    expect(screen.getByText("Project A (2)")).toBeInTheDocument();
    expect(screen.getByText("Project B (1)")).toBeInTheDocument();
  });

  it("handles project click interactions", () => {
    const communications = [
      createMockCommunication({ project: "Test Project" }),
    ];

    render(<VisualizerView communications={communications} onInteraction={mockOnInteraction} />);
    
    fireEvent.click(screen.getByText("Test Project (1)"));
    
    expect(mockOnInteraction).toHaveBeenCalledWith({
      type: "project_click",
      target: "Test Project",
      timestamp: expect.any(Number),
      metadata: {}
    });
  });

  it("handles communication click interactions", () => {
    const communications = [
      createMockCommunication({ id: "test-comm", project: "Test Project" }),
    ];

    render(<VisualizerView communications={communications} onInteraction={mockOnInteraction} />);
    
    // First click project to expand
    fireEvent.click(screen.getByText("Test Project (1)"));
    
    // Then click on the communication
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
        project: "Test Project",
        _highlight: "visual"
      }),
    ];

    render(<VisualizerView communications={communications} onInteraction={mockOnInteraction} />);
    
    // Click project to expand
    fireEvent.click(screen.getByText("Test Project (1)"));
    
    expect(screen.getByText("Visual")).toBeInTheDocument();
  });

  it("sorts projects by communication count", () => {
    const communications = [
      createMockCommunication({ id: "1", project: "Small Project" }),
      createMockCommunication({ id: "2", project: "Big Project" }),
      createMockCommunication({ id: "3", project: "Big Project" }),
      createMockCommunication({ id: "4", project: "Big Project" }),
    ];

    render(<VisualizerView communications={communications} onInteraction={mockOnInteraction} />);
    
    const projectElements = screen.getAllByText(/Project \(\d+\)/);
    expect(projectElements[0]).toHaveTextContent("Big Project (3)");
    expect(projectElements[1]).toHaveTextContent("Small Project (1)");
  });
});
