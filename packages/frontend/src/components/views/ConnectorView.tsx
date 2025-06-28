import React, { useState } from "react";
import { Communication, InteractionEvent } from "@doc-tales/common";
import CommunicationDetail from "../CommunicationDetail";

interface ConnectorViewProps {
  communications: Communication[];
  onInteraction: (event: InteractionEvent) => void;
}

const ConnectorView: React.FC<ConnectorViewProps> = ({
  communications,
  onInteraction,
}) => {
  const [selectedSender, setSelectedSender] = useState<string | null>(null);
  const [selectedCommunication, setSelectedCommunication] = useState<string | null>(null);

  // Use _sortKey if available, otherwise group by sender
  const senderGroups: Record<string, Communication[]> = {};
  communications.forEach((comm) => {
    if (!senderGroups[comm.sender]) {
      senderGroups[comm.sender] = [];
    }
    senderGroups[comm.sender].push(comm);
  });

  // Sort senders by message count or importance
  const sortedSenders = Object.keys(senderGroups).sort((a, b) => {
    // Check if any communications from this sender are highlighted
    const aHasHighlight = senderGroups[a].some(comm => comm._highlight === "relationship" || comm._highlight === "important");
    const bHasHighlight = senderGroups[b].some(comm => comm._highlight === "relationship" || comm._highlight === "important");
    
    if (aHasHighlight && !bHasHighlight) return -1;
    if (!aHasHighlight && bHasHighlight) return 1;
    
    // Otherwise sort by message count
    return senderGroups[b].length - senderGroups[a].length;
  });

  const handlePersonClick = (senderId: string) => {
    setSelectedSender(selectedSender === senderId ? null : senderId);
    onInteraction({
      type: "person_click",
      target: senderId,
      timestamp: Date.now(),
      metadata: {},
    });
  };

  const handleDateClick = (communicationId: string) => {
    onInteraction({
      type: "date_click",
      target: communicationId,
      timestamp: Date.now(),
      metadata: {},
    });
  };

  const handleCommunicationClick = (communicationId: string) => {
    setSelectedCommunication(communicationId);
    onInteraction({
      type: "details_view",
      target: communicationId,
      timestamp: Date.now(),
      metadata: {},
    });
  };

  return (
    <div className="connector-view">
      <h2>Connector View</h2>
      <p>Organized by people and relationships</p>

      <div className="people-grid">
        {sortedSenders.map((sender) => {
          const comms = senderGroups[sender];
          const hasHighlight = comms.some(comm => comm._highlight === "relationship" || comm._highlight === "important");
          
          return (
            <div
              key={sender}
              className={`person-card ${
                selectedSender === sender ? "selected" : ""
              } ${hasHighlight ? "highlighted" : ""}`}
              onClick={() => handlePersonClick(sender)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handlePersonClick(sender);
                }
              }}
              tabIndex={0}
              role="button"
            >
              <div className={`person-avatar ${hasHighlight ? "highlighted" : ""}`}>
                {(comms[0].senderName || comms[0].sender || "U").charAt(0).toUpperCase()}
              </div>
              <h3>{comms[0].senderName || comms[0].sender || "Unknown Sender"}</h3>
              <div className="person-details">
                <p>{comms[0].sender}</p>
                <p>Messages: {comms.length}</p>
                <p>
                  Latest:{" "}
                  {new Date(
                    Math.max(
                      ...comms.map((c) => new Date(c.timestamp).getTime())
                    )
                  ).toLocaleDateString()}
                </p>
                {hasHighlight && (
                  <div className="person-badge">Key Contact</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedSender && (
        <div className="selected-person-communications">
          <h3>Communications from {senderGroups[selectedSender][0].senderName || senderGroups[selectedSender][0].sender || "Unknown Sender"}</h3>
          <div className="communications-list">
            {senderGroups[selectedSender]
              .sort((a, b) => {
                // Use _sortKey if available
                if (a._sortKey && b._sortKey) {
                  return a._sortKey.localeCompare(b._sortKey);
                }
                // Otherwise sort by date (newest first)
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
              })
              .map((comm) => (
                <div 
                  key={comm.id} 
                  className={`communication-item ${comm._displayFormat || ""}`}
                  onClick={() => handleCommunicationClick(comm.id)}
                >
                  <h4>{comm.subject}</h4>
                  <div
                    className="communication-date"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDateClick(comm.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        handleDateClick(comm.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                  >
                    {new Date(comm.timestamp).toLocaleDateString()}
                  </div>
                  <div className="communication-project">
                    Project: {comm.project}
                  </div>
                  <p>{comm.content ? `${comm.content.substring(0, 150)}...` : "Content not available"}</p>
                  {comm._highlight && (
                    <div className={`highlight-badge ${comm._highlight}`}>
                      {comm._highlight === "relationship" ? "Key Contact" : 
                       comm._highlight === "important" ? "Important" : 
                       comm._highlight}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {selectedCommunication && (
        <CommunicationDetail
          communicationId={selectedCommunication}
          onClose={() => setSelectedCommunication(null)}
        />
      )}
    </div>
  );
};

export default ConnectorView;
