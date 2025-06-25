import React, { useState } from "react";
import { Communication, ProjectType, InteractionEvent } from "@doc-tales/common";
import CommunicationDetail from "../CommunicationDetail";

interface VisualizerViewProps {
  communications: Communication[];
  onInteraction: (event: InteractionEvent) => void;
}

const VisualizerView: React.FC<VisualizerViewProps> = ({
  communications,
  onInteraction,
}) => {
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [selectedCommunication, setSelectedCommunication] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Group communications by project
  const projectGroups: Record<string, Communication[]> = {};
  communications.forEach((comm) => {
    if (!projectGroups[comm.project]) {
      projectGroups[comm.project] = [];
    }
    projectGroups[comm.project].push(comm);
  });

  // Sort projects by visual content
  const sortedProjects = Object.keys(projectGroups).sort((a, b) => {
    const aVisualCount = projectGroups[a].filter(comm => 
      comm._highlight === "visual" || 
      (comm.metadata && comm.metadata.hasImages) ||
      (comm.dimensions?.visual?.hasImages)
    ).length;
    
    const bVisualCount = projectGroups[b].filter(comm => 
      comm._highlight === "visual" || 
      (comm.metadata && comm.metadata.hasImages) ||
      (comm.dimensions?.visual?.hasImages)
    ).length;
    
    return bVisualCount - aVisualCount;
  });

  const handleImageView = (communicationId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    onInteraction({
      type: "image_view",
      target: communicationId,
      timestamp: Date.now(),
      metadata: {},
    });
    
    setExpandedCard(expandedCard === communicationId ? null : communicationId);
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

  const handleProjectClick = (project: ProjectType) => {
    setSelectedProject(selectedProject === project ? null : project);
    onInteraction({
      type: "image_view", // Viewing a project board is a visual interaction
      target: project,
      timestamp: Date.now(),
      metadata: { type: "project_board" },
    });
  };

  const getProjectColor = (project: string): string => {
    switch (project) {
      case "Home Purchase":
        return "#4285F4"; // Blue
      case "Career Change":
        return "#EA4335"; // Red
      case "Family Event":
        return "#34A853"; // Green
      default:
        return "#FBBC05"; // Yellow
    }
  };

  // Sort communications within a project based on visual content
  const sortProjectCommunications = (comms: Communication[]) => {
    return [...comms].sort((a, b) => {
      // First prioritize highlighted items
      if (a._highlight === "visual" && b._highlight !== "visual") return -1;
      if (a._highlight !== "visual" && b._highlight === "visual") return 1;
      
      // Then use _sortKey if available
      if (a._sortKey && b._sortKey) return a._sortKey.localeCompare(b._sortKey);
      
      // Then prioritize items with images
      const aHasImages = a.metadata && a.metadata.hasImages;
      const bHasImages = b.metadata && b.metadata.hasImages;
      if (aHasImages && !bHasImages) return -1;
      if (!aHasImages && bHasImages) return 1;
      
      // Finally sort by date
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  };

  return (
    <div className="visualizer-view">
      <h2>Visualizer View</h2>
      <p>Organized visually by project</p>

      <div className="project-boards">
        {sortedProjects.map((project) => {
          const comms = sortProjectCommunications(projectGroups[project]);
          const visualCount = comms.filter(comm => 
            comm._highlight === "visual" || 
            (comm.metadata && comm.metadata.hasImages) ||
            (comm.dimensions?.visual?.hasImages)
          ).length;
          
          return (
            <div
              key={project}
              className={`project-board ${
                selectedProject === project ? "selected" : ""
              } ${visualCount > 0 ? "has-visual" : ""}`}
              style={{ borderColor: getProjectColor(project) }}
              onClick={() => handleProjectClick(project as ProjectType)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleProjectClick(project as ProjectType);
                }
              }}
              tabIndex={0}
              role="button"
            >
              <div
                className="project-header"
                style={{ backgroundColor: getProjectColor(project) }}
              >
                <h3>{project}</h3>
                <span className="item-count">
                  {comms.length} items {visualCount > 0 && `(${visualCount} visual)`}
                </span>
              </div>
              <div className="project-cards">
                {comms.slice(0, 3).map((comm) => (
                  <div
                    key={comm.id}
                    className={`project-card ${comm._displayFormat || ""} ${expandedCard === comm.id ? "expanded" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageView(comm.id, e);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        handleImageView(comm.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                  >
                    <h4>{comm.subject}</h4>
                    <p className="card-sender">From: {comm.senderName}</p>
                    <p className="card-date">
                      {new Date(comm.timestamp).toLocaleDateString()}
                    </p>
                    {expandedCard === comm.id && (
                      <div className="card-actions">
                        <button 
                          className="view-details-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCommunicationClick(comm.id);
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    )}
                    {comm._highlight && (
                      <div className={`highlight-badge ${comm._highlight}`}>
                        {comm._highlight === "visual" ? "Visual Content" : 
                         comm._highlight === "important" ? "Important" : 
                         comm._highlight}
                      </div>
                    )}
                  </div>
                ))}
                {comms.length > 3 && (
                  <div className="more-indicator">+{comms.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedProject && (
        <div className="expanded-project">
          <h3>All {selectedProject} Communications</h3>
          <div className="expanded-cards">
            {sortProjectCommunications(projectGroups[selectedProject]).map((comm) => (
              <div
                key={comm.id}
                className={`expanded-card ${comm._displayFormat || ""}`}
                onClick={() => handleCommunicationClick(comm.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleCommunicationClick(comm.id);
                  }
                }}
                tabIndex={0}
                role="button"
              >
                <h4>{comm.subject}</h4>
                <p className="card-sender">From: {comm.senderName}</p>
                <p className="card-date">
                  {new Date(comm.timestamp).toLocaleDateString()}
                </p>
                <p className="card-excerpt">{comm.content.substring(0, 100)}...</p>
                {comm._highlight && (
                  <div className={`highlight-badge ${comm._highlight}`}>
                    {comm._highlight === "visual" ? "Visual Content" : 
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

export default VisualizerView;
