import React, { useEffect, useState } from "react";
import { Communication } from "../types/communication";
import { ApiService } from "../services/ApiService";

interface CommunicationDetailProps {
  communicationId: string;
  onClose: () => void;
}

const CommunicationDetail: React.FC<CommunicationDetailProps> = ({
  communicationId,
  onClose,
}) => {
  const [communication, setCommunication] = useState<Communication | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchCommunication = async () => {
      try {
        // Use a small delay before showing loading indicator to prevent flashing
        const timeout = setTimeout(() => {
          setLoading(true);
        }, 300);
        
        setLoadingTimeout(timeout);
        setError(null);
        
        const apiService = ApiService.getInstance();
        const comm = await apiService.getCommunicationById(communicationId);
        
        // Clear the timeout if it hasn't fired yet
        clearTimeout(timeout);
        setLoadingTimeout(null);
        
        setCommunication(comm);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch communication details:", err);
        setError("Failed to load communication details. Please try again.");
        setLoading(false);
        
        // Clear the timeout if it hasn't fired yet
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
          setLoadingTimeout(null);
        }
      }
    };

    fetchCommunication();
    
    return () => {
      // Clean up timeout on unmount
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [communicationId]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains("modal-overlay")) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    
    // Add escape key handler
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose]);

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Render dimension visualization
  const renderDimensions = () => {
    if (!communication?.dimensions) return null;
    
    const { temporal, relationship, visual, analytical } = communication.dimensions;
    
    return (
      <div className="dimensions-container">
        <h3>Communication Dimensions</h3>
        
        <div className="dimensions-grid">
          <div className="dimension-card temporal">
            <h4>Temporal</h4>
            <ul>
              <li><strong>Urgency:</strong> {temporal.urgency}</li>
              {temporal.deadline && (
                <li><strong>Deadline:</strong> {temporal.deadline}</li>
              )}
              <li>
                <strong>Requires Action:</strong> 
                {temporal.timeContext.requiresAction ? "Yes" : "No"}
              </li>
            </ul>
          </div>
          
          <div className="dimension-card relationship">
            <h4>Relationship</h4>
            <ul>
              <li>
                <strong>Connection Strength:</strong> {relationship.connectionStrength}
              </li>
              <li><strong>Frequency:</strong> {relationship.frequency}</li>
              <li>
                <strong>Relevance Score:</strong> 
                {Math.round(relationship.networkPosition.relevanceScore * 100)}%
              </li>
            </ul>
          </div>
          
          <div className="dimension-card visual">
            <h4>Visual</h4>
            <ul>
              <li>
                <strong>Has Images:</strong> {visual.hasImages ? "Yes" : "No"}
              </li>
              {visual.documentType && (
                <li><strong>Document Type:</strong> {visual.documentType}</li>
              )}
              <li>
                <strong>Visual Elements:</strong> 
                {visual.visualElements.charts > 0 && `${visual.visualElements.charts} charts, `}
                {visual.visualElements.tables > 0 && `${visual.visualElements.tables} tables, `}
                {visual.visualElements.images > 0 && `${visual.visualElements.images} images`}
                {visual.visualElements.charts === 0 && 
                 visual.visualElements.tables === 0 && 
                 visual.visualElements.images === 0 && "None"}
              </li>
            </ul>
          </div>
          
          <div className="dimension-card analytical">
            <h4>Analytical</h4>
            <ul>
              <li><strong>Category:</strong> {analytical.categories.join(", ")}</li>
              {analytical.tags.length > 0 && (
                <li><strong>Tags:</strong> {analytical.tags.join(", ")}</li>
              )}
              <li><strong>Sentiment:</strong> {analytical.sentiment}</li>
              <li>
                <strong>Complexity:</strong> {analytical.metrics.complexity}
              </li>
            </ul>
          </div>
        </div>
        
        <div className="confidence-section">
          <h4>Dimension Confidence</h4>
          <div className="confidence-bars">
            {Object.entries(communication.dimensions.confidenceScores).map(([dim, score]) => (
              <div key={dim} className="confidence-bar">
                <span>{dim}</span>
                <div className="bar">
                  <div 
                    className={`fill ${dim}`} 
                    style={{ width: `${score * 100}%` }}
                  ></div>
                </div>
                <span>{Math.round(score * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // If we have the communication data, render it immediately
  // even if loading is true (this prevents flashing)
  if (communication) {
    return (
      <div className="modal-overlay">
        <div className="modal-content communication-detail">
          <button className="close-button" onClick={onClose}>×</button>
          
          <div className="detail-header">
            <h2>{communication.subject}</h2>
            <div className="detail-meta">
              <div className="sender-info">
                <strong>From:</strong> {communication.senderName} ({communication.sender})
              </div>
              <div className="date-info">
                <strong>Date:</strong> {formatDate(communication.timestamp)}
              </div>
              <div className="project-info">
                <strong>Project:</strong> {communication.project}
              </div>
              <div className="urgency-info">
                <strong>Urgency:</strong> 
                <span className={`urgency-badge ${communication.metadata.urgency}`}>
                  {communication.metadata.urgency}
                </span>
              </div>
            </div>
          </div>
          
          <div className="detail-content">
            <h3>Content</h3>
            <div className="content-text">
              {communication.content.split("\\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
          
          <div className="detail-metadata">
            <h3>Metadata</h3>
            <div className="metadata-grid">
              {Object.entries(communication.metadata).map(([key, value]) => (
                <div key={key} className="metadata-item">
                  <strong>{key}:</strong> 
                  <span>
                    {typeof value === "object" 
                      ? JSON.stringify(value) 
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {renderDimensions()}
        </div>
      </div>
    );
  }

  // Otherwise show loading or error
  return (
    <div className="modal-overlay">
      <div className="modal-content communication-detail">
        <button className="close-button" onClick={onClose}>×</button>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading communication details...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={onClose}>Close</button>
          </div>
        ) : (
          <div className="error-message">
            <p>Communication not found.</p>
            <button onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationDetail;
