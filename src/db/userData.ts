import {
  AttributeValue,
  PutItemCommand,
  PutItemCommandInput,
  QueryCommand,
  QueryCommandInput,
  UpdateItemCommand,
  UpdateItemCommandInput
} from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';
import { LoginToken } from '../models/LoginToken';
import { MaybeUserData, UserData } from '../models/UserData';
import { getDb } from './client';
import { DynamoDBUserData } from './dbItemMappers';
import { mapToUserData } from './modelMappers';

dotenv.config();

const userDataTable = process.env.USER_DATA_TABLE;
const userEmailIndex = process.env.USER_EMAIL_INDEX;

export async function getUserData(email: string): Promise<MaybeUserData> {
  const result = await queryUserData(email);
  if (result != null) {
    return mapToUserData(result);
  } else {
    return null;
  }
}

export async function saveUser(userData: UserData): Promise<boolean> {
  const user = await queryUserData(userData.email);
  if (user) {
    console.log('User already exists');
    return false;
  }

  const saveUser: DynamoDBUserData = {
    id: { S: userData.id },
    email: { S: userData.email },
    name: { S: userData.name }
  };

  const params: PutItemCommandInput = {
    TableName: userDataTable,
    Item: saveUser,
    ConditionExpression: 'attribute_not_exists(email)'
  };

  try {
    await getDb().send(new PutItemCommand(params));
    return true;
  } catch (err) {
    console.error('Error saving user:', err);
    return false;
  }
}

export async function saveLoginToken(token: LoginToken): Promise<boolean> {
  const params: UpdateItemCommandInput = {
    TableName: userDataTable,
    Key: {
      id: { S: token.userId }
    },
    UpdateExpression: 'SET loginToken = :loginToken, loginTokenExpiration = :loginTokenExpiration',
    ExpressionAttributeValues: {
      ':loginToken': { S: token.loginToken },
      ':loginTokenExpiration': { N: token.expiration.toString() }
    }
  };

  try {
    await getDb().send(new UpdateItemCommand(params));
    return true;
  } catch (err) {
    console.error('Error saving login token:', err);
    return false;
  }
}

async function queryUserData(email: string): Promise<Record<string, AttributeValue> | null> {
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
    if (typeof result === 'undefined') {
      return null;
    }
    return result;
  } catch (err) {
    console.error('Error getting user:', err);
  }

  return null;
}
