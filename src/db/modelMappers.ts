import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { UserData } from '../models/UserData';

export function mapToUserData(result: Record<string, AttributeValue>): UserData {
  if (!result.id || !result.email || !result.name) {
    throw new Error('User data is missing required fields');
  }

  return {
    id: result.id.S || '',
    email: result.email.S || '',
    name: result.name.S || '',
    loginToken: result.loginToken?.S,
    loginTokenExpiration: result.loginTokenExpiration?.N,
    refreshToken: result.refreshToken?.S,
    refreshExpiration: result.refreshExpiration?.N
  } as UserData;
}
