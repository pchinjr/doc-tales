import { BaseSourceAdapter } from "../SourceAdapter";
import { Communication, SourceType } from "../../types/communication";
export declare class DocumentAdapter extends BaseSourceAdapter {
    private mockData;
    private dimensionExtractor;
    private documentParser;
    constructor(sourceType?: SourceType);
    private loadMockData;
    fetchCommunications(): Promise<Communication[]>;
    connect(): Promise<boolean>;
    disconnect(): Promise<boolean>;
    refreshData(): Promise<boolean>;
}
