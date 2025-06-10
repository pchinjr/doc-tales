import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { ComprehendClient } from "@aws-sdk/client-comprehend";
import { TextractClient } from "@aws-sdk/client-textract";

export class AwsService {
  private static instance: AwsService;
  private dynamoClient: DynamoDBClient;
  private s3Client: S3Client;
  private comprehendClient: ComprehendClient;
  private textractClient: TextractClient;
  
  private constructor() {
    const region = "us-east-1"; // Change to your region
    
    this.dynamoClient = new DynamoDBClient({ region });
    this.s3Client = new S3Client({ region });
    this.comprehendClient = new ComprehendClient({ region });
    this.textractClient = new TextractClient({ region });
  }
  
  public static getInstance(): AwsService {
    if (!AwsService.instance) {
      AwsService.instance = new AwsService();
    }
    return AwsService.instance;
  }
  
  public getDynamoClient(): DynamoDBClient {
    return this.dynamoClient;
  }
  
  public getS3Client(): S3Client {
    return this.s3Client;
  }
  
  public getComprehendClient(): ComprehendClient {
    return this.comprehendClient;
  }
  
  public getTextractClient(): TextractClient {
    return this.textractClient;
  }
}
