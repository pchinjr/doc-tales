import React from 'react';
import { Communication } from '../../types/communication';
import { InteractionEvent } from '../../services/ArchetypeService';

interface PrioritizerViewProps {
  communications: Communication[];
  onInteraction: (event: InteractionEvent) => void;
}

const PrioritizerView: React.FC<PrioritizerViewProps> = ({ communications, onInteraction }) => {
  // Sort communications by date and urgency
  const sortedCommunications = [...communications].sort((a, b) => {
    // First sort by urgency
    const urgencyOrder = { high: 0, medium: 1, low: 2 };
    const urgencyDiff = urgencyOrder[a.metadata.urgency] - urgencyOrder[b.metadata.urgency];
    
    if (urgencyDiff !== 0) return urgencyDiff;
    
    // Then sort by date
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
  
  const handleDateClick = (communicationId: string) => {
    onInteraction({
      type: 'date_click',
      target: communicationId,
      timestamp: Date.now(),
      metadata: {}
    });
  };
  
  const handlePersonClick = (contactId: string) => {
    onInteraction({
      type: 'person_click',
      target: contactId,
      timestamp: Date.now(),
      metadata: {}
    });
  };
  
  return (
    <div className="prioritizer-view">
      <h2>Prioritizer View</h2>
      <p>Organized by urgency and timeline</p>
      
      <div className="timeline-view">
        {sortedCommunications.map(comm => (
          <div 
            key={comm.id} 
            className={`timeline-item urgency-${comm.metadata.urgency}`}
          >
            <div className="timeline-date" onClick={() => handleDateClick(comm.id)}>
              {new Date(comm.timestamp).toLocaleDateString()}
            </div>
            <div className="timeline-content">
              <h4>{comm.subject}</h4>
              <div className="timeline-sender" onClick={() => handlePersonClick(comm.sender.id)}>
                From: {comm.sender.name}
              </div>
              <div className="timeline-project">
                Project: {comm.project.replace('-', ' ')}
              </div>
              <div className="timeline-urgency">
                Urgency: {comm.metadata.urgency}
              </div>
              <p className="timeline-excerpt">
                {comm.content.substring(0, 100)}...
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="upcoming-deadlines">
        <h3>Upcoming Deadlines</h3>
        <ul>
          {/* This would be populated with actual deadline data */}
          <li>Mortgage Application - June 5, 2025</li>
          <li>Technical Assessment - June 8, 2025</li>
          <li>Home Inspection - June 10, 2025</li>
          <li>Catering Selection - June 10, 2025</li>
          <li>RSVP Deadline - June 15, 2025</li>
        </ul>
      </div>
    </div>
  );
};

export default PrioritizerView;
