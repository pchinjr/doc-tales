import React, { useState } from "react";
import { Communication, ProjectType } from "../../types/communication";
import { InteractionEvent } from "../../services/ArchetypeService";

interface VisualizerViewProps {
  communications: Communication[];
  onInteraction: (event: InteractionEvent) => void;
}

const VisualizerView: React.FC<VisualizerViewProps> = ({
  communications,
  onInteraction,
}) => {
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);

  // Group communications by project
  const projectGroups: Record<string, Communication[]> = {};
  communications.forEach((comm) => {
    if (!projectGroups[comm.project]) {
      projectGroups[comm.project] = [];
    }
    projectGroups[comm.project].push(comm);
  });

  const handleImageView = (communicationId: string) => {
    onInteraction({
      type: "image_view",
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

  return (
    <div className="visualizer-view">
      <h2>Visualizer View</h2>
      <p>Organized visually by project</p>

      <div className="project-boards">
        {Object.entries(projectGroups).map(([project, comms]) => (
          <div
            key={project}
            className={`project-board ${
              selectedProject === project ? "selected" : ""
            }`}
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
              <span className="item-count">{comms.length} items</span>
            </div>
            <div className="project-cards">
              {comms.slice(0, 3).map((comm) => (
                <div
                  key={comm.id}
                  className="project-card"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageView(comm.id);
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
                  {comm._highlight === "visual" && (
                    <div className="highlight-badge visual">Visual Content</div>
                  )}
                </div>
              ))}
              {comms.length > 3 && (
                <div className="more-indicator">+{comms.length - 3} more</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedProject && (
        <div className="expanded-project">
          <h3>All {selectedProject} Communications</h3>
          <div className="expanded-cards">
            {projectGroups[selectedProject].map((comm) => (
              <div
                key={comm.id}
                className="expanded-card"
                onClick={() => handleImageView(comm.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
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
                <p className="card-excerpt">{comm.content.substring(0, 100)}...</p>
                {comm._highlight === "visual" && (
                  <div className="highlight-badge visual">Visual Content</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualizerView;
