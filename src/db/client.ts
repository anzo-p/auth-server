import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';
import { assertDefined } from '../helpers/errors';

dotenv.config();

const region = assertDefined(process.env.AWS_REGION);

let dbClient: DynamoDBClient | null = null;

export const getDb = () => {
  if (!dbClient) {
    dbClient = new DynamoDBClient({ region });
  }
  return dbClient;
};
