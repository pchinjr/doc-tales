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
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(
    null,
  );

  // Group communications by project
  const projectMap = new Map<ProjectType, Communication[]>();

  communications.forEach((comm) => {
    if (!projectMap.has(comm.project)) {
      projectMap.set(comm.project, []);
    }
    projectMap.get(comm.project)?.push(comm);
  });

  const projects: ProjectType[] = [
    "home-purchase",
    "career-change",
    "family-event",
  ];

  const handleProjectClick = (project: ProjectType) => {
    setSelectedProject(project);
  };

  const handleImageView = (communicationId: string) => {
    onInteraction({
      type: "image_view",
      target: communicationId,
      timestamp: Date.now(),
      metadata: {},
    });
  };

  const handlePersonClick = (contactId: string) => {
    onInteraction({
      type: "person_click",
      target: contactId,
      timestamp: Date.now(),
      metadata: {},
    });
  };

  const getProjectColor = (project: ProjectType): string => {
    switch (project) {
      case "home-purchase":
        return "#4285F4"; // Blue
      case "career-change":
        return "#EA4335"; // Red
      case "family-event":
        return "#34A853"; // Green
      default:
        return "#FBBC05"; // Yellow
    }
  };

  return (
    <div className="visualizer-view">
      <h2>Visualizer View</h2>
      <p>Organized by visual and spatial relationships</p>

      <div className="project-boards">
        {projects.map((project) => (
          <div
            key={project}
            className={`project-board ${selectedProject === project ? "selected" : ""}`}
            style={{ borderColor: getProjectColor(project) }}
            role="button"
            tabIndex={0}
            onClick={() => handleProjectClick(project)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleProjectClick(project);
              }
            }}
          >
            <h3>{project.replace("-", " ")}</h3>
            <div className="board-preview">
              {/* This would show a visual preview of the board */}
              <div
                className="board-thumbnail"
                style={{ backgroundColor: getProjectColor(project) }}
              >
                {projectMap.get(project)?.length || 0} items
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProject && (
        <div className="visual-board">
          <h3>{selectedProject.replace("-", " ")} Board</h3>
          <div className="board-items">
            {projectMap.get(selectedProject)?.map((comm) => (
              <div key={comm.id} className="board-item">
                {/* In a real implementation, this would have actual images */}
                <div
                  className="item-visual"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleImageView(comm.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleImageView(comm.id);
                    }
                  }}
                  style={{ backgroundColor: getProjectColor(comm.project) }}
                >
                  {comm.type === "document"
                    ? "Document Preview"
                    : comm.type === "email"
                      ? "Email Preview"
                      : "Social Post Preview"}
                </div>
                <div className="item-title">{comm.subject}</div>
                <div
                  className="item-sender"
                  role="button"
                  tabIndex={0}
                  onClick={() => handlePersonClick(comm.sender.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handlePersonClick(comm.sender.id);
                    }
                  }}
                >
                  {comm.sender.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="location-map">
        <h3>Location Map</h3>
        <div
          className="map-placeholder"
          role="img"
          aria-label="Location map placeholder"
        >
          {/* In a real implementation, this would be a map visualization */}
          <p>
            Interactive map showing locations across projects would be displayed
            here
          </p>
        </div>
      </div>
    </div>
  );
};

export default VisualizerView;
