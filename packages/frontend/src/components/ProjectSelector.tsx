import React from "react";
import { ProjectType } from "@doc-tales/common";

interface ProjectSelectorProps {
  currentProject: string | null;
  onProjectChange: (project: ProjectType | null) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ 
  currentProject, 
  onProjectChange 
}) => {
  const projects: ProjectType[] = [
    "Home Purchase",
    "Career Change",
    "Family Event"
  ];

  return (
    <div className="project-selector">
      <h3>Filter by Project</h3>
      <div className="project-buttons">
        <button 
          className={currentProject === null ? "active" : ""}
          onClick={() => onProjectChange(null)}
        >
          All Projects
        </button>
        
        {projects.map(project => (
          <button
            key={project}
            className={currentProject === project ? "active" : ""}
            onClick={() => onProjectChange(project)}
          >
            {project}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProjectSelector;
