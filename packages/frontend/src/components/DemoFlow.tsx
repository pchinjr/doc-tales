// Task 8: Build Demo Flow
import React, { useState } from "react";
import { ArchetypeType } from "../types/communication";

interface DemoFlowProps {
  onComplete: () => void;
  onArchetypeSelect: (archetype: ArchetypeType) => void;
}

const DemoFlow: React.FC<DemoFlowProps> = ({ onComplete, onArchetypeSelect }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeType | null>(null);
  
  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleSelectArchetype = (archetype: ArchetypeType) => {
    setSelectedArchetype(archetype);
    onArchetypeSelect(archetype);
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="demo-step welcome-step">
            <h2>Welcome to Doc-Tales</h2>
            <p>
              Doc-Tales is a personalized communications sorter that unifies content from diverse sources
              into a single dashboard with archetype-based personalization.
            </p>
            <div className="demo-image">
              <div className="placeholder-image">
                [Dashboard Overview Image]
              </div>
            </div>
            <p>
              This guided tour will show you how Doc-Tales adapts to your cognitive style
              and organizes your communications in a way that makes sense to you.
            </p>
          </div>
        );
        
      case 2:
        return (
          <div className="demo-step archetypes-step">
            <h2>Discover Your Archetype</h2>
            <p>
              Doc-Tales adapts to your cognitive style using four archetypes.
              Which one sounds most like you?
            </p>
            
            <div className="archetype-cards">
              <div 
                className={`archetype-card ${selectedArchetype === "prioritizer" ? "selected" : ""}`}
                onClick={() => handleSelectArchetype("prioritizer")}
              >
                <h3>Prioritizer</h3>
                <div className="archetype-icon">⏱️</div>
                <p>You focus on deadlines and urgency. Time-based organization is key to your workflow.</p>
              </div>
              
              <div 
                className={`archetype-card ${selectedArchetype === "connector" ? "selected" : ""}`}
                onClick={() => handleSelectArchetype("connector")}
              >
                <h3>Connector</h3>
                <div className="archetype-icon">🔗</div>
                <p>You think in terms of relationships. People and connections drive your decision making.</p>
              </div>
              
              <div 
                className={`archetype-card ${selectedArchetype === "visualizer" ? "selected" : ""}`}
                onClick={() => handleSelectArchetype("visualizer")}
              >
                <h3>Visualizer</h3>
                <div className="archetype-icon">🖼️</div>
                <p>You process information visually. Spatial organization helps you understand context.</p>
              </div>
              
              <div 
                className={`archetype-card ${selectedArchetype === "analyst" ? "selected" : ""}`}
                onClick={() => handleSelectArchetype("analyst")}
              >
                <h3>Analyst</h3>
                <div className="archetype-icon">📊</div>
                <p>You value detailed information. Metadata and logical hierarchies guide your work.</p>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="demo-step sources-step">
            <h2>Connect Your Data Sources</h2>
            <p>
              Doc-Tales brings together communications from multiple sources into one unified inbox.
            </p>
            
            <div className="sources-diagram">
              <div className="source-item">
                <div className="source-icon">📧</div>
                <div className="source-name">Email</div>
              </div>
              <div className="source-arrow">→</div>
              
              <div className="source-item">
                <div className="source-icon">📁</div>
                <div className="source-name">Documents</div>
              </div>
              <div className="source-arrow">→</div>
              
              <div className="source-item">
                <div className="source-icon">🐦</div>
                <div className="source-name">Social</div>
              </div>
              <div className="source-arrow">→</div>
              
              <div className="unified-inbox">
                <div className="inbox-icon">📥</div>
                <div className="inbox-name">Unified Inbox</div>
              </div>
            </div>
            
            <p>
              For this demo, we&apos;ve pre-connected email, document, and social media sources
              related to three life projects: Home Purchase, Career Change, and Family Event.
            </p>
          </div>
        );
        
      case 4:
        return (
          <div className="demo-step dimensions-step">
            <h2>Understanding Dimensions</h2>
            <p>
              Doc-Tales extracts key dimensions from your communications to enable
              personalized organization based on your archetype.
            </p>
            
            <div className="dimensions-grid">
              <div className="dimension-item">
                <h3>Temporal</h3>
                <ul>
                  <li>Deadlines</li>
                  <li>Urgency</li>
                  <li>Chronology</li>
                  <li>Follow-up dates</li>
                </ul>
              </div>
              
              <div className="dimension-item">
                <h3>Relationship</h3>
                <ul>
                  <li>Connection strength</li>
                  <li>Communication frequency</li>
                  <li>Network position</li>
                  <li>Context (personal/professional)</li>
                </ul>
              </div>
              
              <div className="dimension-item">
                <h3>Visual</h3>
                <ul>
                  <li>Document types</li>
                  <li>Visual elements</li>
                  <li>Spatial organization</li>
                  <li>Location context</li>
                </ul>
              </div>
              
              <div className="dimension-item">
                <h3>Analytical</h3>
                <ul>
                  <li>Categories and tags</li>
                  <li>Entities and concepts</li>
                  <li>Sentiment</li>
                  <li>Information structure</li>
                </ul>
              </div>
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="demo-step start-step">
            <h2>Ready to Experience Doc-Tales?</h2>
            <p>
              You&apos;ve selected the <strong>{selectedArchetype}</strong> archetype.
              Your dashboard will be optimized for this cognitive style.
            </p>
            <p>
              As you interact with the system, Doc-Tales will learn and adapt to your
              preferences, potentially adjusting your archetype over time.
            </p>
            <div className="demo-image">
              <div className="placeholder-image">
                [Personalized Dashboard Preview]
              </div>
            </div>
            <p>
              Click &quot;Start Experience&quot; to begin exploring your unified communications.
            </p>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="demo-flow">
      <div className="demo-progress">
        <div className="progress-steps">
          {[1, 2, 3, 4, 5].map(i => (
            <div 
              key={i} 
              className={`progress-step ${i === step ? "active" : ""} ${i < step ? "completed" : ""}`}
            >
              {i}
            </div>
          ))}
        </div>
      </div>
      
      <div className="demo-content">
        {renderStep()}
      </div>
      
      <div className="demo-navigation">
        {step > 1 && (
          <button onClick={handleBack} className="back-button">
            Back
          </button>
        )}
        
        <button 
          onClick={handleNext} 
          className="next-button"
          disabled={step === 2 && !selectedArchetype}
        >
          {step === 5 ? "Start Experience" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default DemoFlow;
