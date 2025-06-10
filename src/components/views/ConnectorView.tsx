import React, { useState } from 'react';
import { Communication, Contact } from '../../types/communication';
import { InteractionEvent } from '../../services/ArchetypeService';

interface ConnectorViewProps {
  communications: Communication[];
  onInteraction: (event: InteractionEvent) => void;
}

const ConnectorView: React.FC<ConnectorViewProps> = ({ communications, onInteraction }) => {
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  
  // Group communications by contact
  const contactMap = new Map<string, Communication[]>();
  
  communications.forEach(comm => {
    // Add sender communications
    if (!contactMap.has(comm.sender.id)) {
      contactMap.set(comm.sender.id, []);
    }
    contactMap.get(comm.sender.id)?.push(comm);
    
    // Add recipient communications
    comm.recipients.forEach(recipient => {
      if (!contactMap.has(recipient.id)) {
        contactMap.set(recipient.id, []);
      }
      contactMap.get(recipient.id)?.push(comm);
    });
  });
  
  // Get unique contacts
  const uniqueContacts = Array.from(new Set(
    communications.flatMap(comm => [comm.sender, ...comm.recipients])
      .map(contact => JSON.stringify(contact))
  )).map(str => JSON.parse(str) as Contact);
  
  const handlePersonClick = (contactId: string) => {
    setSelectedContact(contactId);
    onInteraction({
      type: 'person_click',
      target: contactId,
      timestamp: Date.now(),
      metadata: {}
    });
  };
  
  const handleDateClick = (communicationId: string) => {
    onInteraction({
      type: 'date_click',
      target: communicationId,
      timestamp: Date.now(),
      metadata: {}
    });
  };
  
  const getContactCommunications = (contactId: string): Communication[] => {
    return contactMap.get(contactId) || [];
  };
  
  return (
    <div className="connector-view">
      <h2>Connector View</h2>
      <p>Organized by people and relationships</p>
      
      <div className="connector-layout">
        <div className="contact-list">
          <h3>Key Contacts</h3>
          {uniqueContacts.map(contact => (
            <div 
              key={contact.id} 
              className={`contact-item ${selectedContact === contact.id ? 'selected' : ''}`}
              onClick={() => handlePersonClick(contact.id)}
            >
              <div className="contact-name">{contact.name}</div>
              <div className="contact-role">{contact.role || 'No role'}</div>
              <div className="contact-org">{contact.organization || 'No organization'}</div>
              <div className="contact-projects">
                Projects: {contact.projects.map(p => p.replace('-', ' ')).join(', ')}
              </div>
              <div className="contact-count">
                {getContactCommunications(contact.id).length} communications
              </div>
            </div>
          ))}
        </div>
        
        <div className="contact-communications">
          {selectedContact ? (
            <>
              <h3>Communications with {uniqueContacts.find(c => c.id === selectedContact)?.name}</h3>
              {getContactCommunications(selectedContact).map(comm => (
                <div key={comm.id} className="communication-item">
                  <div className="communication-date" onClick={() => handleDateClick(comm.id)}>
                    {new Date(comm.timestamp).toLocaleDateString()}
                  </div>
                  <div className="communication-subject">{comm.subject}</div>
                  <div className="communication-project">
                    Project: {comm.project.replace('-', ' ')}
                  </div>
                  <p className="communication-excerpt">
                    {comm.content.substring(0, 100)}...
                  </p>
                </div>
              ))}
            </>
          ) : (
            <div className="select-contact-prompt">
              Select a contact to view communications
            </div>
          )}
        </div>
      </div>
      
      <div className="relationship-map">
        <h3>Relationship Map</h3>
        <div className="map-placeholder">
          {/* In a real implementation, this would be a D3.js visualization */}
          <p>Interactive relationship map would be displayed here</p>
        </div>
      </div>
    </div>
  );
};

export default ConnectorView;
