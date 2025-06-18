import React, { useState } from "react";
import { ApiService } from "../services/ApiService";

interface ConfigurationUIProps {
  onSourcesChanged: () => void;
}

const ConfigurationUI: React.FC<ConfigurationUIProps> = ({ onSourcesChanged }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  
  const handleResetProfile = async () => {
    try {
      setLoading(true);
      setMessage("Resetting user profile...");
      
      const apiService = ApiService.getInstance();
      await apiService.updateUserProfile({
        id: "default-user",
        primaryArchetype: "connector",
        archetypeConfidence: {
          prioritizer: 0.25,
          connector: 0.25,
          visualizer: 0.25,
          analyst: 0.25
        }
      });
      
      setMessage("User profile reset successfully!");
      onSourcesChanged();
    } catch (error) {
      console.error("Failed to reset profile:", error);
      setMessage("Failed to reset profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="configuration-ui">
      <h2>Configuration</h2>
      
      <div className="config-section">
        <h3>Connected Data Sources</h3>
        <div className="source-list">
          <div className="source-item connected">
            <div className="source-icon">📧</div>
            <div className="source-details">
              <h4>Email</h4>
              <p>Connected to API</p>
            </div>
            <div className="source-status">✅</div>
          </div>
          
          <div className="source-item connected">
            <div className="source-icon">📁</div>
            <div className="source-details">
              <h4>Documents</h4>
              <p>Connected to API</p>
            </div>
            <div className="source-status">✅</div>
          </div>
          
          <div className="source-item connected">
            <div className="source-icon">🐦</div>
            <div className="source-details">
              <h4>Social</h4>
              <p>Connected to API</p>
            </div>
            <div className="source-status">✅</div>
          </div>
        </div>
      </div>
      
      <div className="config-section">
        <h3>User Profile</h3>
        <button 
          className="reset-button"
          onClick={handleResetProfile}
          disabled={loading}
        >
          Reset Archetype Preferences
        </button>
        {message && <p className="message">{message}</p>}
      </div>
      
      <div className="config-section">
        <h3>API Connection</h3>
        <div className="api-status">
          <div className="status-indicator connected"></div>
          <p>Connected to AWS API</p>
        </div>
        <p className="api-endpoint">
          Endpoint: https://1kf8ojp77e.execute-api.us-east-1.amazonaws.com/dev/
        </p>
      </div>
    </div>
  );
};

export default ConfigurationUI;
