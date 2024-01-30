import { UserData } from '../models/UserData';

export type DynamoDBUserData = {
  [K in keyof UserData]: { S: string };
};
