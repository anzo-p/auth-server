import { v4 as uuidv4 } from 'uuid';
import { getUserDataByEmail, saveUser } from '../db/userData';
import { MaybeUserData, UserData, UserDataInput } from '../models/UserData';
import { DuplicateRequest, InternalError, ServiceResult, createErrorResult } from './errorTypes';
import { handleError } from '../helpers/errors';

export const register = async (input: UserDataInput): Promise<ServiceResult> => {
  const existingUser: MaybeUserData = await getUserDataByEmail(input.email);
  if (existingUser) {
    return createErrorResult(new DuplicateRequest('Email'));
  }

  try {
    const newUser: UserData = { ...input, id: uuidv4() };
    await saveUser(newUser);

    return {
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name
        }
      }
    };
  } catch (err) {
    handleError(err, 'registerUser');
    return createErrorResult(new InternalError());
  }
};
