import React from "react";
import { Communication } from "../../types/communication";
import { InteractionEvent } from "../../services/ArchetypeService";

interface PrioritizerViewProps {
  communications: Communication[];
  onInteraction: (event: InteractionEvent) => void;
}

const PrioritizerView: React.FC<PrioritizerViewProps> = ({
  communications,
  onInteraction,
}) => {
  // Use _sortKey if available, otherwise sort by urgency and date
  const sortedCommunications = [...communications].sort((a, b) => {
    // If _sortKey is available, use it
    if (a._sortKey && b._sortKey) {
      return a._sortKey.localeCompare(b._sortKey);
    }
    
    // Otherwise, sort by urgency and date
    const urgencyOrder = { high: 0, medium: 1, low: 2 };
    const urgencyDiff =
      urgencyOrder[a.metadata.urgency] - urgencyOrder[b.metadata.urgency];

    if (urgencyDiff !== 0) return urgencyDiff;

    // Then sort by date
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  const handleDateClick = (communicationId: string) => {
    onInteraction({
      type: "date_click",
      target: communicationId,
      timestamp: Date.now(),
      metadata: {},
    });
  };

  const handlePersonClick = (senderId: string) => {
    onInteraction({
      type: "person_click",
      target: senderId,
      timestamp: Date.now(),
      metadata: {},
    });
  };

  // Extract deadlines from communications
  const deadlines = communications
    .filter(comm => 
      comm.dimensions?.temporal?.deadline || 
      comm.content.toLowerCase().includes("deadline") ||
      comm.metadata.urgency === "high"
    )
    .map(comm => {
      let deadlineDate = comm.dimensions?.temporal?.deadline;
      if (!deadlineDate) {
        // Try to extract from content
        const match = comm.content.match(/deadline[:\s]*([\w\s,]+)/i);
        if (match) {
          deadlineDate = match[1].trim();
        } else {
          // Use timestamp for high urgency items
          deadlineDate = new Date(comm.timestamp).toLocaleDateString();
        }
      }
      
      return {
        id: comm.id,
        title: comm.subject,
        date: deadlineDate,
        project: comm.project
      };
    })
    .sort((a, b) => {
      // Try to parse dates for comparison
      try {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } catch (e) {
        return 0;
      }
    });

  return (
    <div className="prioritizer-view">
      <h2>Prioritizer View</h2>
      <p>Organized by urgency and timeline</p>

      <div className="timeline-view">
        {sortedCommunications.map((comm) => (
          <div
            key={comm.id}
            className={`timeline-item urgency-${comm.metadata.urgency} ${comm._displayFormat || ""}`}
          >
            <div
              className="timeline-date"
              role="button"
              tabIndex={0}
              onClick={() => handleDateClick(comm.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleDateClick(comm.id);
                }
              }}
            >
              {new Date(comm.timestamp).toLocaleDateString()}
            </div>
            <div className="timeline-content">
              <h4>{comm.subject}</h4>
              <div
                className="timeline-sender"
                role="button"
                tabIndex={0}
                onClick={() => handlePersonClick(comm.sender)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handlePersonClick(comm.sender);
                  }
                }}
              >
                From: {comm.senderName}
              </div>
              <div className="timeline-project">
                Project: {comm.project}
              </div>
              <div className="timeline-urgency">
                Urgency: {comm.metadata.urgency}
              </div>
              <p className="timeline-excerpt">
                {comm.content.substring(0, 100)}...
              </p>
              {comm._highlight && (
                <div className={`highlight-badge ${comm._highlight}`}>
                  {comm._highlight === "urgent" ? "Urgent" : 
                   comm._highlight === "deadline" ? "Deadline" : 
                   comm._highlight === "important" ? "Important" : 
                   comm._highlight}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="upcoming-deadlines">
        <h3>Upcoming Deadlines</h3>
        {deadlines.length > 0 ? (
          <ul>
            {deadlines.map((deadline, index) => (
              <li key={deadline.id || index}>
                {deadline.title} - {deadline.date}
              </li>
            ))}
          </ul>
        ) : (
          <p>No upcoming deadlines found.</p>
        )}
      </div>
    </div>
  );
};

export default PrioritizerView;
