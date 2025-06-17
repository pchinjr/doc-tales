import React, { useState, useEffect } from "react";
import { ArchetypeType, Communication } from "../types/communication";
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
import { AwsDataService } from "../services/AwsDataService";

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

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load user profile first
      const archetypeService = ArchetypeService.getInstance();
      setArchetype(archetypeService.getPrimaryArchetype());
      setConfidence(archetypeService.getArchetypeConfidence());
      
      // Use the AWS data service
      const dataService = AwsDataService.getInstance();
      
      // Get communications optimized for the current archetype
      const response = await fetch(`https://1kf8ojp77e.execute-api.us-east-1.amazonaws.com/dev/communications`);
      const data: ApiResponse = await response.json();
      
      setCommunications(data.communications || []);
      
      // Extract view description if available
      if (data.viewDescription) {
        setViewDescription(data.viewDescription);
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
    setArchetype(newArchetype);
    
    // Update the archetype in the service
    const archetypeService = ArchetypeService.getInstance();
    await archetypeService.setArchetype(newArchetype);
    setConfidence(archetypeService.getArchetypeConfidence());
    
    // Update communications to reflect the new archetype
    setLoading(true);
    const dataService = AwsDataService.getInstance();
    const comms = await dataService.getCommunicationsForArchetype(newArchetype);
    setCommunications(comms);
    setLoading(false);
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
        {viewDescription && (
          <div className="view-description">
            <p>{viewDescription}</p>
          </div>
        )}
      </section>

      <nav className="view-selector" aria-label="Archetype views">
        <button 
          onClick={() => handleArchetypeChange("prioritizer")}
          className={archetype === "prioritizer" ? "active" : ""}
        >
          Prioritizer View
        </button>
        <button 
          onClick={() => handleArchetypeChange("connector")}
          className={archetype === "connector" ? "active" : ""}
        >
          Connector View
        </button>
        <button 
          onClick={() => handleArchetypeChange("visualizer")}
          className={archetype === "visualizer" ? "active" : ""}
        >
          Visualizer View
        </button>
        <button 
          onClick={() => handleArchetypeChange("analyst")}
          className={archetype === "analyst" ? "active" : ""}
        >
          Analyst View
        </button>
      </nav>

      <section className="archetype-view">{renderArchetypeView()}</section>
    </main>
  );
};

export default Dashboard;
