import { BaseSourceAdapter } from "../SourceAdapter";
import { Communication, SourceType } from "../../types/communication";
export declare class EmailAdapter extends BaseSourceAdapter {
    private mockData;
    private dimensionExtractor;
    private emailParser;
    constructor(sourceType?: SourceType);
    private loadMockData;
    fetchCommunications(): Promise<Communication[]>;
    connect(): Promise<boolean>;
    disconnect(): Promise<boolean>;
    refreshData(): Promise<boolean>;
}
