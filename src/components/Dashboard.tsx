import React, { useState, useEffect } from "react";
import { ArchetypeType, Communication, ProjectType } from "../types/communication";
import {
  ArchetypeService,
  InteractionEvent,
} from "../services/ArchetypeService";
import PrioritizerView from "./views/PrioritizerView";
import ConnectorView from "./views/ConnectorView";
import VisualizerView from "./views/VisualizerView";
import AnalystView from "./views/AnalystView";
import ConfigurationUI from "./ConfigurationUI";
import DemoFlow from "./DemoFlow";
import ViewDescription from "./ViewDescription";
import ProjectSelector from "./ProjectSelector";
import { ApiService } from "../services/ApiService";

interface ApiResponse {
  communications: Communication[];
  count: number;
  scannedCount: number;
  viewDescription?: string;
}

const Dashboard: React.FC = () => {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [archetype, setArchetype] = useState<ArchetypeType>("connector");
  const [confidence, setConfidence] = useState<Record<ArchetypeType, number>>({
    prioritizer: 0.25,
    connector: 0.25,
    visualizer: 0.25,
    analyst: 0.25,
  });
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [showDemoFlow, setShowDemoFlow] = useState<boolean>(true);
  const [viewDescription, setViewDescription] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load user profile first
      const archetypeService = ArchetypeService.getInstance();
      setArchetype(archetypeService.getPrimaryArchetype());
      setConfidence(archetypeService.getArchetypeConfidence());
      
      // Get communications optimized for the current archetype
      const apiService = ApiService.getInstance();
      let data;
      
      if (selectedProject) {
        // Fetch communications filtered by project
        const comms = await apiService.getCommunications(selectedProject);
        data = { communications: comms, count: comms.length, scannedCount: comms.length };
      } else {
        // Fetch all communications
        const response = await fetch("https://1kf8ojp77e.execute-api.us-east-1.amazonaws.com/dev/communications");
        data = await response.json() as ApiResponse;
      }
      
      setCommunications(data.communications || []);
      
      // Extract view description if available
      if (data.viewDescription) {
        setViewDescription(data.viewDescription);
      } else {
        // Set default view descriptions based on archetype
        const descriptions = {
          prioritizer: "Organized by urgency and timeline to help you focus on what matters most.",
          connector: "Organized by people and relationships to help you manage your network.",
          visualizer: "Organized visually by project to help you see the big picture.",
          analyst: "Organized by category with detailed metadata for in-depth analysis."
        };
        setViewDescription(descriptions[archetype]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to load data:", error);
      setLoading(false);
    }
  };

  const trackInteraction = async (event: InteractionEvent) => {
    const archetypeService = ArchetypeService.getInstance();
    await archetypeService.trackInteraction(event);
    setArchetype(archetypeService.getPrimaryArchetype());
    setConfidence(archetypeService.getArchetypeConfidence());
    
    // Update communications to reflect the new archetype
    loadData();
  };

  const handleArchetypeChange = async (newArchetype: ArchetypeType) => {
    if (newArchetype === archetype) return;
    
    setIsTransitioning(true);
    setArchetype(newArchetype);
    
    // Update the archetype in the service
    const archetypeService = ArchetypeService.getInstance();
    await archetypeService.setArchetype(newArchetype);
    setConfidence(archetypeService.getArchetypeConfidence());
    
    // Update communications to reflect the new archetype
    setLoading(true);
    
    try {
      const apiService = ApiService.getInstance();
      let data;
      
      if (selectedProject) {
        // Fetch communications filtered by project
        const comms = await apiService.getCommunications(selectedProject);
        data = { communications: comms, count: comms.length, scannedCount: comms.length };
      } else {
        // Fetch all communications
        const response = await fetch("https://1kf8ojp77e.execute-api.us-east-1.amazonaws.com/dev/communications");
        data = await response.json() as ApiResponse;
      }
      
      setCommunications(data.communications || []);
      
      // Set view description based on archetype
      const descriptions = {
        prioritizer: "Organized by urgency and timeline to help you focus on what matters most.",
        connector: "Organized by people and relationships to help you manage your network.",
        visualizer: "Organized visually by project to help you see the big picture.",
        analyst: "Organized by category with detailed metadata for in-depth analysis."
      };
      setViewDescription(descriptions[newArchetype]);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
      setIsTransitioning(false);
    }
  };

  const handleProjectChange = (project: ProjectType | null) => {
    setSelectedProject(project);
  };

  const handleSourcesChanged = () => {
    loadData();
  };

  const handleDemoComplete = () => {
    setShowDemoFlow(false);
  };

  const renderArchetypeView = () => {
    switch (archetype) {
      case "prioritizer":
        return (
          <PrioritizerView
            communications={communications}
            onInteraction={trackInteraction}
          />
        );
      case "connector":
        return (
          <ConnectorView
            communications={communications}
            onInteraction={trackInteraction}
          />
        );
      case "visualizer":
        return (
          <VisualizerView
            communications={communications}
            onInteraction={trackInteraction}
          />
        );
      case "analyst":
        return (
          <AnalystView
            communications={communications}
            onInteraction={trackInteraction}
          />
        );
      default:
        return (
          <ConnectorView
            communications={communications}
            onInteraction={trackInteraction}
          />
        );
    }
  };

  if (showDemoFlow) {
    return (
      <DemoFlow 
        onComplete={handleDemoComplete} 
        onArchetypeSelect={handleArchetypeChange}
      />
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your communications...</p>
      </div>
    );
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1>Doc-Tales</h1>
        <div className="header-actions">
          <button 
            className="config-button"
            onClick={() => setShowConfig(!showConfig)}
          >
            {showConfig ? "Hide Configuration" : "Configure Sources"}
          </button>
          <button 
            className="demo-button"
            onClick={() => setShowDemoFlow(true)}
          >
            Restart Demo
          </button>
        </div>
      </header>

      {showConfig && (
        <ConfigurationUI onSourcesChanged={handleSourcesChanged} />
      )}

      <section className="archetype-indicator">
        <h3>Detected Archetype: {archetype}</h3>
        <div className="confidence-bars">
          {Object.entries(confidence).map(([type, value]) => (
            <div key={type} className="confidence-bar">
              <span>{type}</span>
              <div className="bar">
                <div
                  className="fill"
                  style={{ width: `${value * 100}%` }}
                ></div>
              </div>
              <span>{Math.round(value * 100)}%</span>
            </div>
          ))}
        </div>
        
        <ViewDescription 
          description={viewDescription} 
          archetype={archetype}
        />
      </section>

      <ProjectSelector 
        currentProject={selectedProject} 
        onProjectChange={handleProjectChange}
      />

      <nav className="view-selector" aria-label="Archetype views">
        <button 
          onClick={() => handleArchetypeChange("prioritizer")}
          className={archetype === "prioritizer" ? "active" : ""}
          disabled={isTransitioning}
        >
          Prioritizer View
        </button>
        <button 
          onClick={() => handleArchetypeChange("connector")}
          className={archetype === "connector" ? "active" : ""}
          disabled={isTransitioning}
        >
          Connector View
        </button>
        <button 
          onClick={() => handleArchetypeChange("visualizer")}
          className={archetype === "visualizer" ? "active" : ""}
          disabled={isTransitioning}
        >
          Visualizer View
        </button>
        <button 
          onClick={() => handleArchetypeChange("analyst")}
          className={archetype === "analyst" ? "active" : ""}
          disabled={isTransitioning}
        >
          Analyst View
        </button>
      </nav>

      <section className={`archetype-view ${isTransitioning ? "transitioning" : ""}`}>
        {renderArchetypeView()}
      </section>
    </main>
  );
};

export default Dashboard;
