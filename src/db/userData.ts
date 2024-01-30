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
import { assertDefined, handleError } from '../helpers/errors';

dotenv.config();

const userDataTable = assertDefined(process.env.USER_DATA_TABLE);
const userEmailIndex = assertDefined(process.env.USER_EMAIL_INDEX);

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
    throw new Error('Duplicate email for UswrData');
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
    handleError(err, 'saveUser');
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
    handleError(err, 'saveLoginToken');
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
    handleError(err, 'queryUserData');
  }

  return null;
}
