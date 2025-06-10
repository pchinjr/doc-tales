import React, { useState, useEffect } from 'react';
import { ArchetypeType, Communication } from '../types/communication';
import { DataService } from '../services/DataService';
import { ArchetypeService, InteractionEvent } from '../services/ArchetypeService';
import PrioritizerView from './views/PrioritizerView';
import ConnectorView from './views/ConnectorView';
import VisualizerView from './views/VisualizerView';
import AnalystView from './views/AnalystView';

const Dashboard: React.FC = () => {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [archetype, setArchetype] = useState<ArchetypeType>('connector');
  const [confidence, setConfidence] = useState<Record<ArchetypeType, number>>({
    prioritizer: 0.25,
    connector: 0.25,
    visualizer: 0.25,
    analyst: 0.25
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const dataService = DataService.getInstance();
        await dataService.loadSampleData();
        setCommunications(dataService.getCommunications());
        
        const archetypeService = ArchetypeService.getInstance();
        setArchetype(archetypeService.getPrimaryArchetype());
        setConfidence(archetypeService.getArchetypeConfidence());
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to load data:', error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const trackInteraction = (event: InteractionEvent) => {
    const archetypeService = ArchetypeService.getInstance();
    archetypeService.trackInteraction(event);
    setArchetype(archetypeService.getPrimaryArchetype());
    setConfidence(archetypeService.getArchetypeConfidence());
  };
  
  const renderArchetypeView = () => {
    switch (archetype) {
      case 'prioritizer':
        return <PrioritizerView communications={communications} onInteraction={trackInteraction} />;
      case 'connector':
        return <ConnectorView communications={communications} onInteraction={trackInteraction} />;
      case 'visualizer':
        return <VisualizerView communications={communications} onInteraction={trackInteraction} />;
      case 'analyst':
        return <AnalystView communications={communications} onInteraction={trackInteraction} />;
      default:
        return <ConnectorView communications={communications} onInteraction={trackInteraction} />;
    }
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="dashboard">
      <div className="archetype-indicator">
        <h3>Detected Archetype: {archetype}</h3>
        <div className="confidence-bars">
          {Object.entries(confidence).map(([type, value]) => (
            <div key={type} className="confidence-bar">
              <span>{type}</span>
              <div className="bar">
                <div className="fill" style={{ width: `${value * 100}%` }}></div>
              </div>
              <span>{Math.round(value * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="view-selector">
        <button onClick={() => setArchetype('prioritizer')}>Prioritizer View</button>
        <button onClick={() => setArchetype('connector')}>Connector View</button>
        <button onClick={() => setArchetype('visualizer')}>Visualizer View</button>
        <button onClick={() => setArchetype('analyst')}>Analyst View</button>
      </div>
      
      <div className="archetype-view">
        {renderArchetypeView()}
      </div>
    </div>
  );
};

export default Dashboard;
