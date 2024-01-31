export interface UserDataInput {
  email: string;
  name: string;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  loginToken?: string | null;
  loginTokenExpiration?: number | null;
  refreshToken?: string | null;
  refreshExpiration?: number | null;
}

export type MaybeUserData = UserData | null;
