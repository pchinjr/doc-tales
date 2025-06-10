import React, { useState } from 'react';
import { Communication, ProjectType } from '../../types/communication';
import { InteractionEvent } from '../../services/ArchetypeService';

interface AnalystViewProps {
  communications: Communication[];
  onInteraction: (event: InteractionEvent) => void;
}

const AnalystView: React.FC<AnalystViewProps> = ({ communications, onInteraction }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Extract all unique categories
  const categories = Array.from(new Set(communications.map(comm => comm.metadata.category)));
  
  // Filter communications by selected category
  const filteredCommunications = selectedCategory 
    ? communications.filter(comm => comm.metadata.category === selectedCategory)
    : communications;
  
  // Sort communications
  const sortedCommunications = [...filteredCommunications].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortField) {
      case 'timestamp':
        valueA = new Date(a.timestamp).getTime();
        valueB = new Date(b.timestamp).getTime();
        break;
      case 'subject':
        valueA = a.subject;
        valueB = b.subject;
        break;
      case 'sender':
        valueA = a.sender.name;
        valueB = b.sender.name;
        break;
      case 'project':
        valueA = a.project;
        valueB = b.project;
        break;
      case 'urgency':
        const urgencyOrder = { high: 0, medium: 1, low: 2 };
        valueA = urgencyOrder[a.metadata.urgency];
        valueB = urgencyOrder[b.metadata.urgency];
        break;
      default:
        valueA = a.timestamp;
        valueB = b.timestamp;
    }
    
    const comparison = typeof valueA === 'string' 
      ? valueA.localeCompare(valueB as string)
      : (valueA as number) - (valueB as number);
      
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };
  
  const handleDetailsView = (communicationId: string) => {
    onInteraction({
      type: 'details_view',
      target: communicationId,
      timestamp: Date.now(),
      metadata: {}
    });
  };
  
  return (
    <div className="analyst-view">
      <h2>Analyst View</h2>
      <p>Organized by categories and details</p>
      
      <div className="filter-controls">
        <div className="category-filters">
          <h3>Categories</h3>
          <div className="category-buttons">
            {categories.map(category => (
              <button 
                key={category}
                className={`category-button ${selectedCategory === category ? 'selected' : ''}`}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </button>
            ))}
            {selectedCategory && (
              <button 
                className="category-button clear"
                onClick={() => setSelectedCategory(null)}
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
        
        <div className="sort-controls">
          <h3>Sort By</h3>
          <div className="sort-buttons">
            <button 
              className={`sort-button ${sortField === 'timestamp' ? 'selected' : ''}`}
              onClick={() => handleSort('timestamp')}
            >
              Date {sortField === 'timestamp' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button 
              className={`sort-button ${sortField === 'subject' ? 'selected' : ''}`}
              onClick={() => handleSort('subject')}
            >
              Subject {sortField === 'subject' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button 
              className={`sort-button ${sortField === 'sender' ? 'selected' : ''}`}
              onClick={() => handleSort('sender')}
            >
              Sender {sortField === 'sender' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button 
              className={`sort-button ${sortField === 'project' ? 'selected' : ''}`}
              onClick={() => handleSort('project')}
            >
              Project {sortField === 'project' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button 
              className={`sort-button ${sortField === 'urgency' ? 'selected' : ''}`}
              onClick={() => handleSort('urgency')}
            >
              Urgency {sortField === 'urgency' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>
      
      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('timestamp')}>
                Date {sortField === 'timestamp' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('subject')}>
                Subject {sortField === 'subject' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('sender')}>
                Sender {sortField === 'sender' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('project')}>
                Project {sortField === 'project' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('urgency')}>
                Urgency {sortField === 'urgency' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCommunications.map(comm => (
              <tr key={comm.id}>
                <td>{new Date(comm.timestamp).toLocaleDateString()}</td>
                <td>{comm.subject}</td>
                <td>{comm.sender.name}</td>
                <td>{comm.project.replace('-', ' ')}</td>
                <td>{comm.metadata.urgency}</td>
                <td>
                  <button onClick={() => handleDetailsView(comm.id)}>Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="analytics-section">
        <h3>Analytics</h3>
        <div className="analytics-cards">
          <div className="analytics-card">
            <h4>Communications by Project</h4>
            <div className="chart-placeholder">
              {/* In a real implementation, this would be a chart */}
              <p>Chart showing communication distribution by project</p>
            </div>
          </div>
          <div className="analytics-card">
            <h4>Communications by Type</h4>
            <div className="chart-placeholder">
              {/* In a real implementation, this would be a chart */}
              <p>Chart showing communication distribution by type</p>
            </div>
          </div>
          <div className="analytics-card">
            <h4>Communications by Urgency</h4>
            <div className="chart-placeholder">
              {/* In a real implementation, this would be a chart */}
              <p>Chart showing communication distribution by urgency</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalystView;
