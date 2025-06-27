// Entity Extraction Service
// Processes Comprehend entities and maps them to Doc-Tales entity structure

import { Entity } from '@aws-sdk/client-comprehend';
import { ComprehendService } from './ComprehendService';
import { ExtractionInput, ExtractionResults } from '../types/ml-extraction';

/**
 * Service for extracting and processing entities from communications
 */
export class EntityExtractor {
  private comprehendService: ComprehendService;

  constructor(region?: string) {
    this.comprehendService = new ComprehendService(region);
  }

  /**
   * Extract entities from text and map to Doc-Tales structure
   */
  async extractEntities(input: ExtractionInput): Promise<ExtractionResults['entityMappings']> {
    try {
      const comprehendResults = await this.comprehendService.extractComprehendResults(input);
      return this.mapEntitiesToDocTales(comprehendResults.entities);
    } catch (error) {
      console.error('Error extracting entities:', error);
      return {
        people: [],
        organizations: [],
        locations: [],
        dates: [],
        concepts: []
      };
    }
  }

  /**
   * Map Comprehend entities to Doc-Tales entity structure
   */
  private mapEntitiesToDocTales(entities: Entity[]): ExtractionResults['entityMappings'] {
    const mappings: ExtractionResults['entityMappings'] = {
      people: [],
      organizations: [],
      locations: [],
      dates: [],
      concepts: []
    };

    entities.forEach(entity => {
      if (!entity.Text || !entity.Type || (entity.Score || 0) < 0.7) {
        return; // Skip low-confidence entities
      }

      const text = entity.Text.trim();
      
      switch (entity.Type) {
        case 'PERSON':
          if (!mappings.people.includes(text)) {
            mappings.people.push(text);
          }
          break;
          
        case 'ORGANIZATION':
          if (!mappings.organizations.includes(text)) {
            mappings.organizations.push(text);
          }
          break;
          
        case 'LOCATION':
          if (!mappings.locations.includes(text)) {
            mappings.locations.push(text);
          }
          break;
          
        case 'DATE':
          if (!mappings.dates.includes(text)) {
            mappings.dates.push(text);
          }
          break;
          
        case 'EVENT':
        case 'TITLE':
        case 'COMMERCIAL_ITEM':
        case 'OTHER':
          if (!mappings.concepts.includes(text)) {
            mappings.concepts.push(text);
          }
          break;
      }
    });

    return mappings;
  }

  /**
   * Extract specific entity types with filtering
   */
  async extractPeople(text: string): Promise<string[]> {
    const input: ExtractionInput = { text };
    const mappings = await this.extractEntities(input);
    return mappings.people;
  }

  async extractOrganizations(text: string): Promise<string[]> {
    const input: ExtractionInput = { text };
    const mappings = await this.extractEntities(input);
    return mappings.organizations;
  }

  async extractLocations(text: string): Promise<string[]> {
    const input: ExtractionInput = { text };
    const mappings = await this.extractEntities(input);
    return mappings.locations;
  }

  /**
   * Get entity extraction statistics
   */
  async getExtractionStats(text: string): Promise<{
    totalEntities: number;
    entitiesByType: Record<string, number>;
    averageConfidence: number;
  }> {
    try {
      const comprehendResults = await this.comprehendService.extractComprehendResults({ text });
      const entities = comprehendResults.entities;

      const stats = {
        totalEntities: entities.length,
        entitiesByType: {} as Record<string, number>,
        averageConfidence: 0
      };

      let totalConfidence = 0;
      entities.forEach(entity => {
        if (entity.Type) {
          stats.entitiesByType[entity.Type] = (stats.entitiesByType[entity.Type] || 0) + 1;
        }
        totalConfidence += entity.Score || 0;
      });

      stats.averageConfidence = entities.length > 0 ? totalConfidence / entities.length : 0;

      return stats;
    } catch (error) {
      console.error('Error getting extraction stats:', error);
      return {
        totalEntities: 0,
        entitiesByType: {},
        averageConfidence: 0
      };
    }
  }
}
