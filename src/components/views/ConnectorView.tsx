import React, { useState } from "react";
import { Communication } from "../../types/communication";
import { InteractionEvent } from "../../services/ArchetypeService";

interface ConnectorViewProps {
  communications: Communication[];
  onInteraction: (event: InteractionEvent) => void;
}

const ConnectorView: React.FC<ConnectorViewProps> = ({
  communications,
  onInteraction,
}) => {
  const [selectedSender, setSelectedSender] = useState<string | null>(null);

  // Group communications by sender
  const senderGroups: Record<string, Communication[]> = {};
  communications.forEach((comm) => {
    if (!senderGroups[comm.sender]) {
      senderGroups[comm.sender] = [];
    }
    senderGroups[comm.sender].push(comm);
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

  return (
    <div className="connector-view">
      <h2>Connector View</h2>
      <p>Organized by people and relationships</p>

      <div className="people-grid">
        {Object.entries(senderGroups).map(([sender, comms]) => (
          <div
            key={sender}
            className={`person-card ${
              selectedSender === sender ? "selected" : ""
            }`}
            onClick={() => handlePersonClick(sender)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handlePersonClick(sender);
              }
            }}
            tabIndex={0}
            role="button"
          >
            <div className="person-avatar">
              {comms[0].senderName.charAt(0).toUpperCase()}
            </div>
            <h3>{comms[0].senderName}</h3>
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
            </div>
          </div>
        ))}
      </div>

      {selectedSender && (
        <div className="selected-person-communications">
          <h3>Communications from {senderGroups[selectedSender][0].senderName}</h3>
          <div className="communications-list">
            {senderGroups[selectedSender].map((comm) => (
              <div key={comm.id} className="communication-item">
                <h4>{comm.subject}</h4>
                <div
                  className="communication-date"
                  onClick={() => handleDateClick(comm.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
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
                <p>{comm.content.substring(0, 150)}...</p>
                {comm._highlight === "relationship" && (
                  <div className="highlight-badge relationship">Key Contact</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectorView;
