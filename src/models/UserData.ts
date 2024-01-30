export interface UserDataInput {
  email: string;
  name: string;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  loginToken?: string;
  loginTokenExpiration?: number;
}

export type MaybeUserData = UserData | null;
