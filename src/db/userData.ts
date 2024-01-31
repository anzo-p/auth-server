import {
  AttributeValue,
  GetItemCommand,
  GetItemCommandInput,
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
const userTokenIndex = assertDefined(process.env.USER_TOKEN_INDEX);

export async function getUserDataById(id: string): Promise<MaybeUserData> {
  const param: GetItemCommandInput = {
    TableName: userDataTable,
    Key: {
      id: { S: id }
    }
  };

  try {
    const result = (await getDb().send(new GetItemCommand(param))).Item;
    if (typeof result === 'undefined') {
      return null;
    }
    return mapToUserData(result);
  } catch (err) {
    handleError(err, 'getUserDataById');
  }

  return null;
}

export async function getUserDataByEmail(email: string): Promise<MaybeUserData> {
  const result = await queryUserDataByEmail(email);
  if (result != null) {
    return mapToUserData(result);
  } else {
    return null;
  }
}

export async function getUserDataByToken(token: string): Promise<MaybeUserData> {
  const params: QueryCommandInput = {
    TableName: userDataTable,
    IndexName: userTokenIndex,
    KeyConditionExpression: 'loginToken = :token',
    ExpressionAttributeValues: {
      ':token': { S: token }
    }
  };

  try {
    const result = (await getDb().send(new QueryCommand(params))).Items?.[0];
    if (typeof result === 'undefined') {
      return null;
    }
    return mapToUserData(result);
  } catch (err) {
    handleError(err, 'getUserDataByToken');
  }

  return null;
}

export async function saveUser(userData: UserData): Promise<void> {
  const user = await getUserDataById(userData.id);
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
  } catch (err) {
    handleError(err, 'saveUser');
  }
}

export async function saveLoginToken(token: LoginToken): Promise<void> {
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
  } catch (err) {
    handleError(err, 'saveLoginToken');
  }
}

export async function saveRefreshToken(userId: string, refreshToken: string, refreshExpiration: number): Promise<void> {
  const params: UpdateItemCommandInput = {
    TableName: userDataTable,
    Key: {
      id: { S: userId }
    },
    UpdateExpression: 'SET refreshToken = :refreshToken, refreshExpiration = :refreshExpiration',
    ExpressionAttributeValues: {
      ':refreshToken': { S: refreshToken },
      ':refreshExpiration': { N: refreshExpiration.toString() }
    }
  };

  try {
    await getDb().send(new UpdateItemCommand(params));
  } catch (err) {
    handleError(err, 'saveRefreshToken');
  }
}

async function queryUserDataByEmail(email: string): Promise<Record<string, AttributeValue> | null> {
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
