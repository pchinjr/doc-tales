import { Communication, SourceType, CommunicationType } from "../types/communication";
export interface SourceAdapter {
    getSourceType(): SourceType;
    getCommunicationType(): CommunicationType;
    fetchCommunications(): Promise<Communication[]>;
    isConnected(): boolean;
    connect?(): Promise<boolean>;
    disconnect?(): Promise<boolean>;
    refreshData?(): Promise<boolean>;
}
export declare abstract class BaseSourceAdapter implements SourceAdapter {
    protected connected: boolean;
    protected sourceType: SourceType;
    protected communicationType: CommunicationType;
    constructor(sourceType: SourceType, communicationType: CommunicationType);
    getSourceType(): SourceType;
    getCommunicationType(): CommunicationType;
    isConnected(): boolean;
    abstract fetchCommunications(): Promise<Communication[]>;
}
