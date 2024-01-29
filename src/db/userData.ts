import { PutItemCommand, PutItemCommandInput, QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';
import { DynamoDBUserData } from './types';
import { UserData } from '../models/UserData';
import { getDb } from './client';

dotenv.config();

const userDataTable = process.env.USER_DATA_TABLE;
const userEmailIndex = process.env.USER_EMAIL_INDEX;

export async function checkEmailAvailability(email: string): Promise<boolean> {
  const params: QueryCommandInput = {
    TableName: userDataTable,
    IndexName: userEmailIndex,
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': { S: email }
    }
  };

  try {
    const result = (await getDb().send(new QueryCommand(params))).Items?.[0];
    if (result) {
      return false;
    }
  } catch (err) {
    console.error('Error getting user:', err);
  }
  return true;
}

export async function saveUser(userData: UserData): Promise<boolean> {
  const saveUser: DynamoDBUserData = {
    id: { S: userData.id },
    email: { S: userData.email },
    name: { S: userData.name }
  };

  const params: PutItemCommandInput = {
    TableName: userDataTable,
    Item: saveUser
  };

  try {
    await getDb().send(new PutItemCommand(params));
    return true;
  } catch (err) {
    console.error('Error saving user:', err);
    return false;
  }
}
