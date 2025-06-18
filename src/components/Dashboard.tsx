import React, { useState, useEffect, useCallback, useRef } from "react";
import { ArchetypeType, Communication, ProjectType } from "../types/communication";
import {
  ArchetypeService,
  InteractionEvent,
  ArchetypeChangeListener,
} from "../services/ArchetypeService";
import PrioritizerView from "./views/PrioritizerView";
import ConnectorView from "./views/ConnectorView";
import VisualizerView from "./views/VisualizerView";
import AnalystView from "./views/AnalystView";
import ConfigurationUI from "./ConfigurationUI";
import DemoFlow from "./DemoFlow";
import ViewDescription from "./ViewDescription";
import ProjectSelector from "./ProjectSelector";
import { ApiService, UserProfile } from "../services/ApiService";

interface ApiResponse {
  communications: Communication[];
  count: number;
  scannedCount: number;
  viewDescription?: string;
}

const Dashboard: React.FC = () => {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
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
  const [archetypeChanged, setArchetypeChanged] = useState<boolean>(false);
  
  // Use refs to track previous values for comparison
  const prevArchetypeRef = useRef<ArchetypeType>(archetype);
  const prevProjectRef = useRef<ProjectType | null>(selectedProject);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle archetype service updates
  const handleProfileUpdate: ArchetypeChangeListener = useCallback((profile: UserProfile) => {
    setConfidence(profile.archetypeConfidence);
    
    // Check if primary archetype has changed
    if (profile.primaryArchetype !== archetype) {
      setArchetypeChanged(true);
      
      // Show notification that archetype has changed
      setTimeout(() => {
        setArchetype(profile.primaryArchetype);
        setArchetypeChanged(false);
      }, 2000); // Wait 2 seconds before changing the view
    }
  }, [archetype]);

  // Set up archetype change listener
  useEffect(() => {
    const archetypeService = ArchetypeService.getInstance();
    archetypeService.addChangeListener(handleProfileUpdate);
    
    return () => {
      archetypeService.removeChangeListener(handleProfileUpdate);
    };
  }, [handleProfileUpdate]);

  // Load data when component mounts or when selectedProject changes
  useEffect(() => {
    // Only show loading indicator on initial load or if data actually changes
    const shouldShowLoading = initialLoad || 
      (prevProjectRef.current !== selectedProject || prevArchetypeRef.current !== archetype);
    
    if (shouldShowLoading) {
      // Use a small delay before showing loading indicator to prevent flashing
      loadingTimeoutRef.current = setTimeout(() => {
        setLoading(true);
      }, 300); // Small delay to prevent flashing for quick loads
    }
    
    loadData().finally(() => {
      // Clear the timeout if it hasn't fired yet
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      setLoading(false);
      setInitialLoad(false);
      
      // Update refs with current values
      prevArchetypeRef.current = archetype;
      prevProjectRef.current = selectedProject;
    });
    
    // Cleanup function
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [selectedProject, archetype]);

  const loadData = async () => {
    try {
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
        const comms = await apiService.getCommunications();
        data = { communications: comms, count: comms.length, scannedCount: comms.length };
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
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const trackInteraction = async (event: InteractionEvent) => {
    const archetypeService = ArchetypeService.getInstance();
    await archetypeService.trackInteraction(event);
    
    // Note: We don't need to manually update state here anymore
    // The change listener will handle updates when the archetype service changes
  };

  const handleArchetypeSelect = async (newArchetype: ArchetypeType) => {
    if (newArchetype === archetype) return;
    
    setIsTransitioning(true);
    setArchetype(newArchetype);
    
    // Update the archetype in the service
    const archetypeService = ArchetypeService.getInstance();
    await archetypeService.setArchetype(newArchetype);
    
    // Set view description based on archetype
    const descriptions = {
      prioritizer: "Organized by urgency and timeline to help you focus on what matters most.",
      connector: "Organized by people and relationships to help you manage your network.",
      visualizer: "Organized visually by project to help you see the big picture.",
      analyst: "Organized by category with detailed metadata for in-depth analysis."
    };
    setViewDescription(descriptions[newArchetype]);
    
    // The useEffect will handle loading the data
    // We just need to end the transition after a short delay
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const handleProjectChange = (project: ProjectType | null) => {
    setSelectedProject(project);
  };

  const handleSourcesChanged = () => {
    // Clear the cache when sources change
    const apiService = ApiService.getInstance();
    // Access the clearCache method if it exists
    if (typeof (apiService as any).clearCache === "function") {
      (apiService as any).clearCache();
    }
    loadData();
  };

  const handleDemoComplete = () => {
    setShowDemoFlow(false);
  };

  const renderArchetypeView = () => {
    // Don't re-render the view if we're transitioning
    if (isTransitioning) {
      return (
        <div className="transitioning-placeholder">
          <div className="loading-spinner-small"></div>
        </div>
      );
    }
    
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
        onArchetypeSelect={handleArchetypeSelect}
      />
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

      <section className="archetype-section">
        <h3>Detected Archetype: {archetype}</h3>
        <div className="confidence-bars">
          {Object.entries(confidence).map(([type, value]) => (
            <div key={type} className="confidence-bar">
              <span>{type}</span>
              <div className="bar">
                <div
                  className={`fill ${archetypeChanged && type === archetype ? "pulse" : ""}`}
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
          onClick={() => handleArchetypeSelect("prioritizer")}
          className={archetype === "prioritizer" ? "active" : ""}
          disabled={isTransitioning}
        >
          Prioritizer View
        </button>
        <button 
          onClick={() => handleArchetypeSelect("connector")}
          className={archetype === "connector" ? "active" : ""}
          disabled={isTransitioning}
        >
          Connector View
        </button>
        <button 
          onClick={() => handleArchetypeSelect("visualizer")}
          className={archetype === "visualizer" ? "active" : ""}
          disabled={isTransitioning}
        >
          Visualizer View
        </button>
        <button 
          onClick={() => handleArchetypeSelect("analyst")}
          className={archetype === "analyst" ? "active" : ""}
          disabled={isTransitioning}
        >
          Analyst View
        </button>
      </nav>

      <section className={`archetype-view ${isTransitioning ? "transitioning" : ""}`}>
        {loading && initialLoad ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your communications...</p>
          </div>
        ) : (
          renderArchetypeView()
        )}
      </section>
    </main>
  );
};

export default Dashboard;
