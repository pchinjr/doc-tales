import React, { useState } from "react";
import { Communication } from "../../types/communication";
import { InteractionEvent } from "../../services/ArchetypeService";

interface AnalystViewProps {
  communications: Communication[];
  onInteraction: (event: InteractionEvent) => void;
}

const AnalystView: React.FC<AnalystViewProps> = ({
  communications,
  onInteraction,
}) => {
  const [expandedComm, setExpandedComm] = useState<string | null>(null);

  // Group communications by category
  const categoryGroups: Record<string, Communication[]> = {};
  communications.forEach((comm) => {
    const category = comm.metadata.category || "uncategorized";
    if (!categoryGroups[category]) {
      categoryGroups[category] = [];
    }
    categoryGroups[category].push(comm);
  });

  const handleDetailsView = (communicationId: string) => {
    setExpandedComm(expandedComm === communicationId ? null : communicationId);
    onInteraction({
      type: "details_view",
      target: communicationId,
      timestamp: Date.now(),
      metadata: {},
    });
  };

  return (
    <div className="analyst-view">
      <h2>Analyst View</h2>
      <p>Organized by category with detailed metadata</p>

      <div className="category-tables">
        {Object.entries(categoryGroups).map(([category, comms]) => (
          <div key={category} className="category-section">
            <h3 className="category-header">{category}</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Sender</th>
                  <th>Date</th>
                  <th>Project</th>
                  <th>Urgency</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {comms.map((comm) => (
                  <React.Fragment key={comm.id}>
                    <tr
                      className={expandedComm === comm.id ? "expanded" : ""}
                      onClick={() => handleDetailsView(comm.id)}
                    >
                      <td>{comm.subject}</td>
                      <td>{comm.senderName}</td>
                      <td>{new Date(comm.timestamp).toLocaleDateString()}</td>
                      <td>{comm.project}</td>
                      <td>
                        <span className={`urgency-badge ${comm.metadata.urgency}`}>
                          {comm.metadata.urgency}
                        </span>
                      </td>
                      <td>
                        <button
                          className="details-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDetailsView(comm.id);
                          }}
                        >
                          {expandedComm === comm.id ? "Hide" : "Details"}
                        </button>
                      </td>
                    </tr>
                    {expandedComm === comm.id && (
                      <tr className="details-row">
                        <td colSpan={6}>
                          <div className="details-content">
                            <div className="details-section">
                              <h4>Content</h4>
                              <p>{comm.content}</p>
                            </div>
                            <div className="details-section">
                              <h4>Metadata</h4>
                              <ul>
                                {Object.entries(comm.metadata).map(
                                  ([key, value]) => (
                                    <li key={key}>
                                      <strong>{key}:</strong>{" "}
                                      {typeof value === "object"
                                        ? JSON.stringify(value)
                                        : value.toString()}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                            {comm._highlight === "metadata" && (
                              <div className="highlight-badge metadata">
                                Rich Metadata
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalystView;
