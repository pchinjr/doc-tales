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
import { UnifiedDataService } from "../services/UnifiedDataService";

// Task 6: Connect to Archetype Views
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Use the new UnifiedDataService instead of DataService
      const dataService = UnifiedDataService.getInstance();
      await dataService.loadAllData();
      
      // Get communications optimized for the current archetype
      setCommunications(dataService.getCommunicationsForArchetype(archetype));

      const archetypeService = ArchetypeService.getInstance();
      setArchetype(archetypeService.getPrimaryArchetype());
      setConfidence(archetypeService.getArchetypeConfidence());

      setLoading(false);
    } catch (error) {
      console.error("Failed to load data:", error);
      setLoading(false);
    }
  };

  const trackInteraction = (event: InteractionEvent) => {
    const archetypeService = ArchetypeService.getInstance();
    archetypeService.trackInteraction(event);
    setArchetype(archetypeService.getPrimaryArchetype());
    setConfidence(archetypeService.getArchetypeConfidence());
    
    // Update communications to reflect the new archetype
    const dataService = UnifiedDataService.getInstance();
    setCommunications(dataService.getCommunicationsForArchetype(archetype));
  };

  const handleArchetypeChange = (newArchetype: ArchetypeType) => {
    setArchetype(newArchetype);
    
    // Update communications to reflect the new archetype
    const dataService = UnifiedDataService.getInstance();
    setCommunications(dataService.getCommunicationsForArchetype(newArchetype));
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
