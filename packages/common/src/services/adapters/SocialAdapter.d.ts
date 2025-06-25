import { BaseSourceAdapter } from "../SourceAdapter";
import { Communication, SourceType } from "../../types/communication";
export declare class SocialAdapter extends BaseSourceAdapter {
    private mockData;
    private dimensionExtractor;
    private socialParser;
    constructor(sourceType?: SourceType);
    private loadMockData;
    fetchCommunications(): Promise<Communication[]>;
    connect(): Promise<boolean>;
    disconnect(): Promise<boolean>;
    refreshData(): Promise<boolean>;
}
