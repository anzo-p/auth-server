import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

let dbClient: DynamoDBClient | null = null;

export const getDb = () => {
  if (!dbClient) {
    dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
  }
  return dbClient;
};
