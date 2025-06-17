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
  const [sortField, setSortField] = useState<string>("category");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Group communications by category
  const categoryGroups: Record<string, Communication[]> = {};
  communications.forEach((comm) => {
    const category = comm.metadata.category || "uncategorized";
    if (!categoryGroups[category]) {
      categoryGroups[category] = [];
    }
    categoryGroups[category].push(comm);
  });

  // Sort categories by name or by communication count
  const sortedCategories = Object.keys(categoryGroups).sort((a, b) => {
    if (sortField === "count") {
      const diff = categoryGroups[b].length - categoryGroups[a].length;
      return sortDirection === "asc" ? -diff : diff;
    }
    return sortDirection === "asc" ? a.localeCompare(b) : b.localeCompare(a);
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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort communications within a category
  const sortCommunications = (comms: Communication[]) => {
    return [...comms].sort((a, b) => {
      // First use _sortKey if available
      if (a._sortKey && b._sortKey) {
        const sortResult = a._sortKey.localeCompare(b._sortKey);
        return sortDirection === "asc" ? sortResult : -sortResult;
      }
      
      // Then prioritize highlighted items
      if (a._highlight === "metadata" && b._highlight !== "metadata") return -1;
      if (a._highlight !== "metadata" && b._highlight === "metadata") return 1;
      
      // Then sort by the selected field
      switch (sortField) {
        case "subject":
          return sortDirection === "asc" 
            ? a.subject.localeCompare(b.subject) 
            : b.subject.localeCompare(a.subject);
        case "sender":
          return sortDirection === "asc" 
            ? a.senderName.localeCompare(b.senderName) 
            : b.senderName.localeCompare(a.senderName);
        case "date":
          return sortDirection === "asc" 
            ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime() 
            : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case "project":
          return sortDirection === "asc" 
            ? a.project.localeCompare(b.project) 
            : b.project.localeCompare(a.project);
        case "urgency":
          const urgencyOrder = { high: 0, medium: 1, low: 2 };
          const urgencyDiff = urgencyOrder[a.metadata.urgency] - urgencyOrder[b.metadata.urgency];
          return sortDirection === "asc" ? urgencyDiff : -urgencyDiff;
        default:
          return 0;
      }
    });
  };

  return (
    <div className="analyst-view">
      <h2>Analyst View</h2>
      <p>Organized by category with detailed metadata</p>

      <div className="sort-controls">
        <label>Sort categories by: </label>
        <button 
          className={sortField === "category" ? "active" : ""}
          onClick={() => handleSort("category")}
        >
          Name {sortField === "category" && (sortDirection === "asc" ? "▲" : "▼")}
        </button>
        <button 
          className={sortField === "count" ? "active" : ""}
          onClick={() => handleSort("count")}
        >
          Count {sortField === "count" && (sortDirection === "asc" ? "▲" : "▼")}
        </button>
      </div>

      <div className="category-tables">
        {sortedCategories.map((category) => {
          const comms = sortCommunications(categoryGroups[category]);
          const hasHighlightedItems = comms.some(comm => comm._highlight === "metadata");
          
          return (
            <div 
              key={category} 
              className={`category-section ${hasHighlightedItems ? "has-highlights" : ""}`}
            >
              <h3 className="category-header">
                {category} <span className="count-badge">{comms.length}</span>
              </h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort("subject")} className={sortField === "subject" ? "sorted" : ""}>
                      Subject {sortField === "subject" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>
                    <th onClick={() => handleSort("sender")} className={sortField === "sender" ? "sorted" : ""}>
                      Sender {sortField === "sender" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>
                    <th onClick={() => handleSort("date")} className={sortField === "date" ? "sorted" : ""}>
                      Date {sortField === "date" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>
                    <th onClick={() => handleSort("project")} className={sortField === "project" ? "sorted" : ""}>
                      Project {sortField === "project" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>
                    <th onClick={() => handleSort("urgency")} className={sortField === "urgency" ? "sorted" : ""}>
                      Urgency {sortField === "urgency" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {comms.map((comm) => (
                    <React.Fragment key={comm.id}>
                      <tr
                        className={`${expandedComm === comm.id ? "expanded" : ""} ${comm._displayFormat || ""}`}
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
                              {comm.dimensions && (
                                <div className="details-section">
                                  <h4>Dimensions</h4>
                                  <div className="dimensions-grid">
                                    <div className="dimension-item">
                                      <h5>Temporal</h5>
                                      <ul>
                                        {comm.dimensions.temporal.deadline && (
                                          <li><strong>Deadline:</strong> {comm.dimensions.temporal.deadline}</li>
                                        )}
                                        <li><strong>Urgency:</strong> {comm.dimensions.temporal.urgency}</li>
                                        <li><strong>Requires Action:</strong> {comm.dimensions.temporal.timeContext.requiresAction ? "Yes" : "No"}</li>
                                      </ul>
                                    </div>
                                    <div className="dimension-item">
                                      <h5>Relationship</h5>
                                      <ul>
                                        <li><strong>Strength:</strong> {comm.dimensions.relationship.connectionStrength}</li>
                                        <li><strong>Frequency:</strong> {comm.dimensions.relationship.frequency}</li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {comm._highlight && (
                                <div className={`highlight-badge ${comm._highlight}`}>
                                  {comm._highlight === "metadata" ? "Rich Metadata" : 
                                   comm._highlight === "important" ? "Important" : 
                                   comm._highlight}
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
          );
        })}
      </div>
    </div>
  );
};

export default AnalystView;
