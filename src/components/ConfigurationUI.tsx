// Task 7: Add Simple Configuration UI
import React, { useState, useEffect } from "react";
import { UnifiedDataService } from "../services/UnifiedDataService";
import { SourceType } from "../types/communication";

interface ConfigurationUIProps {
  onSourcesChanged: () => void;
}

const ConfigurationUI: React.FC<ConfigurationUIProps> = ({ onSourcesChanged }) => {
  const [availableSources, setAvailableSources] = useState<{
    type: SourceType;
    enabled: boolean;
    connected: boolean;
    name: string;
    icon: string;
  }[]>([
    { type: "gmail", enabled: true, connected: true, name: "Gmail", icon: "📧" },
    { type: "outlook", enabled: false, connected: false, name: "Outlook", icon: "📨" },
    { type: "dropbox", enabled: true, connected: true, name: "Dropbox", icon: "📁" },
    { type: "gdrive", enabled: false, connected: false, name: "Google Drive", icon: "📄" },
    { type: "twitter", enabled: true, connected: true, name: "Twitter", icon: "🐦" },
    { type: "linkedin", enabled: false, connected: false, name: "LinkedIn", icon: "💼" },
    { type: "slack", enabled: false, connected: false, name: "Slack", icon: "💬" }
  ]);
  
  const [isConnecting, setIsConnecting] = useState<SourceType | null>(null);
  const [demoMode, setDemoMode] = useState<boolean>(true);
  
  useEffect(() => {
    // Initialize with current adapters from UnifiedDataService
    const dataService = UnifiedDataService.getInstance();
    const adapters = dataService.getAdapters();
    
    setAvailableSources(prevSources => {
      return prevSources.map(source => {
        const adapter = adapters.find(a => a.getSourceType() === source.type);
        return {
          ...source,
          enabled: !!adapter,
          connected: adapter ? adapter.isConnected() : false
        };
      });
    });
  }, []);
  
  const handleToggleSource = (sourceType: SourceType) => {
    setAvailableSources(prevSources => {
      return prevSources.map(source => {
        if (source.type === sourceType) {
          return { ...source, enabled: !source.enabled };
        }
        return source;
      });
    });
    
    // Update the UnifiedDataService
    const dataService = UnifiedDataService.getInstance();
    const source = availableSources.find(s => s.type === sourceType);
    
    if (source?.enabled) {
      // If it was enabled, now disable it
      dataService.removeAdapter(sourceType);
    } else {
      // If it was disabled, now enable it
      // In a real implementation, this would create the appropriate adapter
      // For the demo, we'll just show a connecting state
      setIsConnecting(sourceType);
      
      // Simulate connection delay
      setTimeout(() => {
        setIsConnecting(null);
        setAvailableSources(prevSources => {
          return prevSources.map(source => {
            if (source.type === sourceType) {
              return { ...source, connected: true };
            }
            return source;
          });
        });
        onSourcesChanged();
      }, 1500);
    }
  };
  
  const handleConnectSource = (sourceType: SourceType) => {
    setIsConnecting(sourceType);
    
    // Simulate connection delay
    setTimeout(() => {
      setIsConnecting(null);
      setAvailableSources(prevSources => {
        return prevSources.map(source => {
          if (source.type === sourceType) {
            return { ...source, connected: true };
          }
          return source;
        });
      });
      onSourcesChanged();
    }, 1500);
  };
  
  const handleToggleDemoMode = () => {
    setDemoMode(!demoMode);
  };
  
  return (
    <div className="configuration-ui">
      <h2>Data Sources Configuration</h2>
      
      <div className="demo-mode-toggle">
        <label>
          <input 
            type="checkbox" 
            checked={demoMode} 
            onChange={handleToggleDemoMode} 
          />
          Demo Mode {demoMode ? "(On)" : "(Off)"}
        </label>
        <p className="demo-mode-description">
          {demoMode 
            ? "Using sample data for demonstration purposes." 
            : "Connect to real data sources (not implemented in MVP)."}
        </p>
      </div>
      
      <div className="sources-list">
        <h3>Available Sources</h3>
        {availableSources.map(source => (
          <div key={source.type} className="source-item">
            <div className="source-icon">{source.icon}</div>
            <div className="source-details">
              <div className="source-name">{source.name}</div>
              <div className="source-status">
                {source.connected ? "Connected" : "Not connected"}
              </div>
            </div>
            <div className="source-actions">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={source.enabled}
                  onChange={() => handleToggleSource(source.type)}
                  disabled={isConnecting !== null}
                />
                <span className="toggle-slider"></span>
              </label>
              {!source.connected && source.enabled && (
                <button 
                  onClick={() => handleConnectSource(source.type)}
                  disabled={isConnecting !== null}
                  className="connect-button"
                >
                  {isConnecting === source.type ? "Connecting..." : "Connect"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="configuration-actions">
        <button 
          onClick={onSourcesChanged}
          className="refresh-button"
          disabled={isConnecting !== null}
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default ConfigurationUI;
