// Task 3: Implement Source Adapters
import { Communication, SourceType, CommunicationType } from '../types/communication';

// Base interface for all source adapters
export interface SourceAdapter {
  // Basic methods required for all adapters
  getSourceType(): SourceType;
  getCommunicationType(): CommunicationType;
  fetchCommunications(): Promise<Communication[]>;
  isConnected(): boolean;
  
  // Optional methods that can be implemented by specific adapters
  connect?(): Promise<boolean>;
  disconnect?(): Promise<boolean>;
  refreshData?(): Promise<boolean>;
}

// Base abstract class that implements common functionality
export abstract class BaseSourceAdapter implements SourceAdapter {
  protected connected: boolean = false;
  protected sourceType: SourceType;
  protected communicationType: CommunicationType;
  
  constructor(sourceType: SourceType, communicationType: CommunicationType) {
    this.sourceType = sourceType;
    this.communicationType = communicationType;
  }
  
  public getSourceType(): SourceType {
    return this.sourceType;
  }
  
  public getCommunicationType(): CommunicationType {
    return this.communicationType;
  }
  
  public isConnected(): boolean {
    return this.connected;
  }
  
  public abstract fetchCommunications(): Promise<Communication[]>;
}
